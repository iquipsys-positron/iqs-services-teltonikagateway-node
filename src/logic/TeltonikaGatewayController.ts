let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';
import { BadRequestException } from 'pip-services3-commons-node';

import { DeviceV1 } from 'iqs-clients-devices-node';
import { DeviceTypeV1 } from 'iqs-clients-devices-node';
import { DeviceStatusV1 } from 'iqs-clients-devices-node';
import { StateUpdateV1 } from 'iqs-clients-stateupdates-node';
import { StateUpdateDataValueV1 } from 'iqs-clients-stateupdates-node';
import { OrganizationV1 } from 'pip-clients-organizations-node';
import { WriteStream } from 'iqs-libs-protocols-node';

import { ITeltonikaGatewayConnector } from '../connectors/ITeltonikaGatewayConnector';
import { TeltonikaGatewayCommandSet } from './TeltonikaGatewayCommandSet';

import { ExternalDependencies } from '../deps/ExternalDependencies';
import { ExternalDependenciesResolver } from '../deps/ExternalDependenciesResolver';

import { IncomingMessageDecoder } from '../protocol/IncomingMessageDecoder';
import { FmbMessage } from '../protocol/FmbMessage';
import { AvlDataMessage } from '../protocol/AvlDataMessage';
import { PacketType } from '../protocol/PacketType';
import { AckMessage } from '../protocol/AckMessage';
import { AvlAckMessage } from '../protocol/AvlAckMessage';
import { AvlData } from '../protocol/AvlData';

export class TeltonikaGatewayController implements IConfigurable, IReferenceable, ICommandable {
    private _logger: CompositeLogger = new CompositeLogger();
    private _counters: CompositeCounters = new CompositeCounters();
    private _dependencyResolver = new ExternalDependenciesResolver();
    private _dependencies: ExternalDependencies;
    private _commandSet: TeltonikaGatewayCommandSet;
    private _eventWindow: number = 5000;
    private _packetId: number = 1;

    public configure(config: ConfigParams): void {
        this._logger.configure(config);
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);

        this._dependencyResolver.setReferences(references);
        this._dependencies = this._dependencyResolver.resolve();
        this._dependencies.logger = this._logger;
        this._dependencies.counters = this._counters;
        this._dependencies.connector.listenMessages((host, port, buffer) => {
            this.onMessage(host, port, buffer);
        });
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new TeltonikaGatewayCommandSet(this);
        return this._commandSet;
    }

    private lookupDevices(message: AvlDataMessage, callback: (err: any, devices: DeviceV1[]) => void): void {
        this._dependencies.devicesConnector.resolveDevices(message.device_udi, (err, devices) => {
            callback(err, devices);
        });
    }

    private sendAcknowledgement(host: string, port: number, message: FmbMessage): void {
        if (message.packet_type != PacketType.AcknowledgementRequired)
           return;

        let ackMessage = new AckMessage();
        ackMessage.packet_id = message.packet_id;

        let stream = new WriteStream();
        ackMessage.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(host, port, buffer);
    }

    private sendAvlAcknowledgement(host: string, port: number, message: FmbMessage): void {
        if (!(message instanceof AvlDataMessage))
            return;

        let avlMessage = message as AvlDataMessage;
        let ackMessage = new AvlAckMessage();
        ackMessage.packet_id = this._packetId;
        this._packetId = this._packetId >= 0xFFFF ? 1 : this._packetId + 1;
        ackMessage.avl_packet_id = avlMessage.avl_packet_id;
        ackMessage.data_num = avlMessage.avl_data.length;

        let stream = new WriteStream();
        ackMessage.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(host, port, buffer);
    }
    
    private createStateUpdate(device: DeviceV1, data: AvlData[]): StateUpdateV1 {
        // Calculate special values (obsolete)
        let freezed = false;
        let pressed = false;
        let long_pressed = false;
        let power = null;

        for (let thisData of data) {
             for (let element of thisData.io_elements) {
                 if (element.id == 240 && element.value == 0)
                     freezed = true;
                 if (element.id == 1 && thisData.event_id == 1 && element.value == 1)
                     pressed = true;
                 if (element.id == 9 /*&& thisData.event_id == 9 */&& element.value > 2500 && element.value < 4400)
                     long_pressed = true;
                 if (element.id == 252)
                     power = element.value != 1;
             }
        }

        // Calculate parameters and events
        let params: StateUpdateDataValueV1[] = [];
        let events: StateUpdateDataValueV1[] = [];

        for (let thisData of data) {
            for (let element of thisData.io_elements) {
                if (element.id == thisData.event_id) {
                    events = _.filter(events, e => e.id != element.id);
                    events.push({ id: element.id, val: element.value });
                } else {
                    params = _.filter(params, p => p.id != element.id);
                    params.push({ id: element.id, val: element.value });
                }
            }
       }

        let firstData = data[0];
        let stateUpdate: StateUpdateV1 = {
            org_id: device.org_id,
            device_id: device.id,
            time: firstData.time,

            // Deprecated
            freezed: freezed,
            pressed: pressed,
            long_pressed: long_pressed,
            power: power,

            params: params,
            events: events
        };

        if (firstData.lat != 0 && firstData.lng != 0) {
            stateUpdate.lat = firstData.lat;
            stateUpdate.lng = firstData.lng;
            stateUpdate.alt = firstData.alt;
            stateUpdate.angle = firstData.angle;
            stateUpdate.speed = firstData.speed;
        }

        return stateUpdate;
    }

    private createStateUpdates(device: DeviceV1, message: AvlDataMessage): StateUpdateV1[] {
        if (message == null && message.avl_data.length == 0) return [];

        let stateUpdates: StateUpdateV1[] = [];
        let allData = _.sortBy(message.avl_data, (d) => d.time.getTime());

        let startTime = allData[0].time.getTime();
        let endTime = startTime + this._eventWindow;
        let eventData: AvlData[] = [];
        this._logger.info("teltonika-gateway", "createStateUpdates: " + allData.length);
        for (let index = 0; index < allData.length; index++) {
            let thisData = allData[index];

            this._logger.info("teltonika-gateway", "Processing allData. thisData index: " + index + " time: " + thisData.time);  

            // Calculate event at the end
            if (index == allData.length - 1) {
                let stateUpdate;
                if (thisData.time.getTime() > endTime) {
                    stateUpdate = this.createStateUpdate(device, eventData);
                    stateUpdates.push(stateUpdate);

                    eventData = [thisData];
                    stateUpdate = this.createStateUpdate(device, eventData);
                    stateUpdates.push(stateUpdate);
                } else {
                    eventData.push(thisData);
                    stateUpdate = this.createStateUpdate(device, eventData);
                    stateUpdates.push(stateUpdate);
                }


                this._logger.info("teltonika-gateway", "Generate last state update. index: " + index + " thisData.time: " + thisData.time + 
                        " stateUpdates.time: " + stateUpdate.time);
            }
            // Calculate when data is outside of time window
            else if (thisData.time.getTime() > endTime) {
                let stateUpdate = this.createStateUpdate(device, eventData);
                stateUpdates.push(stateUpdate);

                this._logger.info("teltonika-gateway", "Generate current state update. index: " + index + " thisData.time: " + thisData.time + 
                " stateUpdates.time: " + stateUpdate.time);
                startTime = thisData.time.getTime();
                endTime = startTime + this._eventWindow;
                eventData = [thisData];
            }
            // Continue inside time windpw
            else {
                eventData.push(thisData);
            }
        }
        this._logger.info("teltonika-gateway", "State Updates generated: " + stateUpdates.length);
        return stateUpdates;
    }
    
    private sendStatusUpdate(devices: DeviceV1[], message: AvlDataMessage,
        callback: (err: any) => void): void {

        async.eachSeries(devices, (device, callback) => {
            let stateUpdates = this.createStateUpdates(device, message);
            this._dependencies.organizationsConnector.findOrganizationById(
                device.org_id, (err, organization) => {
                if (err && organization == null) {
                    callback(err);
                    return;
                }
                 
                // Todo: Check if device is located within the organization
                // async.each(stateUpdates, (stateUpdate, callback) => {
                //     this._logger.info("teltonika-gateway", "Send stateUpdate. time: " + stateUpdate.time);  

                //     this._dependencies.statesClient.beginUpdateState(
                //         'teltonika-gateway', stateUpdate, callback);
                // }, callback);
                async.eachSeries(stateUpdates, (stateUpdate, callback) => {
                    this._logger.info("teltonika-gateway", "Send stateUpdate. time: " + stateUpdate.time);  

                    this._dependencies.statesClient.beginUpdateState(
                        'teltonika-gateway', stateUpdate, callback);
                }, callback);
            });
        }, callback);
    }

    private onMessage(host: string, port: number, buffer: Buffer): void {
        let devices: DeviceV1[];
        let message: AvlDataMessage;
        let deviceUdi: string;
        let stateMessage: AvlDataMessage;

        async.series([
            (callback) => {
                IncomingMessageDecoder.decode(buffer, (err, data) => {
                    if (data instanceof AvlDataMessage)
                        message = data;
                    else if (err == null)
                        err = 'abort';

                    callback(err);
                });
            },
            // (callback) => {
            //     this.sendAcknowledgement(host, port, message);
            //     this.sendAvlAcknowledgement(host, port, message);
            //     callback();
            // },
            (callback) => {
                this.lookupDevices(message, (err, data) => {
                    devices = data;

                    if (devices && devices.length == 0)
                        this._logger.warn("teltonika-gateway", "No devices found for " + message.device_udi);
                    
                    callback(err);
                });
            },
            (callback) => {
                this.sendStatusUpdate(devices, message, callback);
            }
        ], (err) => {
            if (err == 'abort') err = null;
            if (err) this._logger.error("teltonika-gateway", err, "Failed to process the message");

            this.sendAcknowledgement(host, port, message);
            this.sendAvlAcknowledgement(host, port, message);
        });
    }

    public sendSignal(correlationId: string, orgId: string, deviceId: string,
        signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void {
        callback(null, false);
    }

    public broadcastSignal(correlationId: string, orgId: string,
        signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void {
        callback(null, false);
    }

    public pingDevice(correlationId: string, orgId: string, deviceId: string,
        callback?: (err: any) => void): void {
        callback(null);
    }

}
