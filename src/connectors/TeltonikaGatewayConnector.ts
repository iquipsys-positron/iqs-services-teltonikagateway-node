let _ = require('lodash');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { ConnectionResolver } from 'pip-services3-components-node';

import { ITeltonikaGatewayConnector } from './ITeltonikaGatewayConnector';

export class TeltonikaGatewayConnector 
    implements ITeltonikaGatewayConnector, IConfigurable, IReferenceable, IOpenable {
    
    private _connectionResolver: ConnectionResolver = new ConnectionResolver();
    private _logger: CompositeLogger = new CompositeLogger();
    private _server: any;
    private _listener: any;

    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);
        this._logger.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._connectionResolver.setReferences(references);
        this._logger.setReferences(references);
    }

    public isOpen(): boolean {
        return this._server != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        this._connectionResolver.resolve(correlationId, (err, options) => {
            if (err) {
                callback(err);
                return;
            }

            let port = options.getPort();
            let host = options.getHost();

            let dgram = require('dgram');
            let server = dgram.createSocket('udp4');
            
            server.on('listening', () => {
                this._server = server;

                this._logger.trace(correlationId, "Started Teltonika connector on udp://" + host + ":" + port);

                // callback(null);
            });
            
            server.on('error', (err) => {
                this._logger.error(correlationId, err, "Failed to start Teltonika on udp://" + host + ":" + port);
                // callback(err);
            });

            server.on('message', (buffer, remote) => {
                if (this._listener) {
                    try {
                        this._listener(remote.address, remote.port, buffer);
                    } catch (ex) {
                        this._logger.error(null, ex, "Failed to process the message");
                    }
                }
            });
            
            server.bind(port, host);

            // Todo: Temporary hack!!
            callback(null);
        });
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        if (this._server != null) {
            this._server.close();
            this._server = null;
            this._logger.trace(correlationId, "Stopped Teltonika connector");
        }

        callback(null);
    }

    public sendMessage(host: string, port: number, buffer: Buffer): void {
        if (this._server) {
            this._server.send(buffer, 0, buffer.length, port, host, (err) => {
                if (err) this._logger.error(null, err, "Failed to send to udp:// " + host + ":" + port);
            });
        }
    }
 
    public listenMessages(listener: (host: string, port: number, buffer: Buffer) => void) {
        this._listener = listener;
    }
}