"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const iqs_libs_protocols_node_1 = require("iqs-libs-protocols-node");
const TeltonikaGatewayCommandSet_1 = require("./TeltonikaGatewayCommandSet");
const ExternalDependenciesResolver_1 = require("../deps/ExternalDependenciesResolver");
const IncomingMessageDecoder_1 = require("../protocol/IncomingMessageDecoder");
const AvlDataMessage_1 = require("../protocol/AvlDataMessage");
const PacketType_1 = require("../protocol/PacketType");
const AckMessage_1 = require("../protocol/AckMessage");
const AvlAckMessage_1 = require("../protocol/AvlAckMessage");
class TeltonikaGatewayController {
    constructor() {
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._counters = new pip_services3_components_node_2.CompositeCounters();
        this._dependencyResolver = new ExternalDependenciesResolver_1.ExternalDependenciesResolver();
        this._eventWindow = 5000;
        this._packetId = 1;
    }
    configure(config) {
        this._logger.configure(config);
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
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
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new TeltonikaGatewayCommandSet_1.TeltonikaGatewayCommandSet(this);
        return this._commandSet;
    }
    lookupDevices(message, callback) {
        this._dependencies.devicesConnector.resolveDevices(message.device_udi, (err, devices) => {
            callback(err, devices);
        });
    }
    sendAcknowledgement(host, port, message) {
        if (message.packet_type != PacketType_1.PacketType.AcknowledgementRequired)
            return;
        let ackMessage = new AckMessage_1.AckMessage();
        ackMessage.packet_id = message.packet_id;
        let stream = new iqs_libs_protocols_node_1.WriteStream();
        ackMessage.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(host, port, buffer);
    }
    sendAvlAcknowledgement(host, port, message) {
        if (!(message instanceof AvlDataMessage_1.AvlDataMessage))
            return;
        let avlMessage = message;
        let ackMessage = new AvlAckMessage_1.AvlAckMessage();
        ackMessage.packet_id = this._packetId;
        this._packetId = this._packetId >= 0xFFFF ? 1 : this._packetId + 1;
        ackMessage.avl_packet_id = avlMessage.avl_packet_id;
        ackMessage.data_num = avlMessage.avl_data.length;
        let stream = new iqs_libs_protocols_node_1.WriteStream();
        ackMessage.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(host, port, buffer);
    }
    createStateUpdate(device, data) {
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
                if (element.id == 9 /*&& thisData.event_id == 9 */ && element.value > 2500 && element.value < 4400)
                    long_pressed = true;
                if (element.id == 252)
                    power = element.value != 1;
            }
        }
        // Calculate parameters and events
        let params = [];
        let events = [];
        for (let thisData of data) {
            for (let element of thisData.io_elements) {
                if (element.id == thisData.event_id) {
                    events = _.filter(events, e => e.id != element.id);
                    events.push({ id: element.id, val: element.value });
                }
                else {
                    params = _.filter(params, p => p.id != element.id);
                    params.push({ id: element.id, val: element.value });
                }
            }
        }
        let firstData = data[0];
        let stateUpdate = {
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
    createStateUpdates(device, message) {
        if (message == null && message.avl_data.length == 0)
            return [];
        let stateUpdates = [];
        let allData = _.sortBy(message.avl_data, (d) => d.time.getTime());
        let startTime = allData[0].time.getTime();
        let endTime = startTime + this._eventWindow;
        let eventData = [];
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
                }
                else {
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
    sendStatusUpdate(devices, message, callback) {
        async.eachSeries(devices, (device, callback) => {
            let stateUpdates = this.createStateUpdates(device, message);
            this._dependencies.organizationsConnector.findOrganizationById(device.org_id, (err, organization) => {
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
                    this._dependencies.statesClient.beginUpdateState('teltonika-gateway', stateUpdate, callback);
                }, callback);
            });
        }, callback);
    }
    onMessage(host, port, buffer) {
        let devices;
        let message;
        let deviceUdi;
        let stateMessage;
        async.series([
            (callback) => {
                IncomingMessageDecoder_1.IncomingMessageDecoder.decode(buffer, (err, data) => {
                    if (data instanceof AvlDataMessage_1.AvlDataMessage)
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
            if (err == 'abort')
                err = null;
            if (err)
                this._logger.error("teltonika-gateway", err, "Failed to process the message");
            this.sendAcknowledgement(host, port, message);
            this.sendAvlAcknowledgement(host, port, message);
        });
    }
    sendSignal(correlationId, orgId, deviceId, signal, timestamp, callback) {
        callback(null, false);
    }
    broadcastSignal(correlationId, orgId, signal, timestamp, callback) {
        callback(null, false);
    }
    pingDevice(correlationId, orgId, deviceId, callback) {
        callback(null);
    }
}
exports.TeltonikaGatewayController = TeltonikaGatewayController;
//# sourceMappingURL=TeltonikaGatewayController.js.map