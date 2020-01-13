import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
export declare class TeltonikaGatewayController implements IConfigurable, IReferenceable, ICommandable {
    private _logger;
    private _counters;
    private _dependencyResolver;
    private _dependencies;
    private _commandSet;
    private _eventWindow;
    private _packetId;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    private lookupDevices;
    private sendAcknowledgement;
    private sendAvlAcknowledgement;
    private createStateUpdate;
    private createStateUpdates;
    private sendStatusUpdate;
    private onMessage;
    sendSignal(correlationId: string, orgId: string, deviceId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void;
    broadcastSignal(correlationId: string, orgId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void;
    pingDevice(correlationId: string, orgId: string, deviceId: string, callback?: (err: any) => void): void;
}
