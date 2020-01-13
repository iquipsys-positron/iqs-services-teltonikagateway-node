/// <reference types="node" />
export interface ITeltonikaGatewayConnector {
    sendMessage(host: string, port: number, buffer: Buffer): void;
    listenMessages(listener: (host: string, port: number, buffer: Buffer) => void): any;
}
