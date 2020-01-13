/// <reference types="node" />
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ITeltonikaGatewayConnector } from './ITeltonikaGatewayConnector';
export declare class TeltonikaGatewayConnector implements ITeltonikaGatewayConnector, IConfigurable, IReferenceable, IOpenable {
    private _connectionResolver;
    private _logger;
    private _server;
    private _listener;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    sendMessage(host: string, port: number, buffer: Buffer): void;
    listenMessages(listener: (host: string, port: number, buffer: Buffer) => void): void;
}
