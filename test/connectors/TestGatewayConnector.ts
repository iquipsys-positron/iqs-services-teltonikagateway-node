import { ITeltonikaGatewayConnector } from '../../src/connectors/ITeltonikaGatewayConnector';

export class TestGatewayConnector implements ITeltonikaGatewayConnector {
    public outgoing: Buffer[] = [];

    public sendMessage(host: string, port: number, buffer: Buffer): void {
        this.outgoing.push(buffer);
    }

    public listenMessages(listener: (host: string, port: number, buffer: Buffer) => void) {
        // Do nothing
    }
}