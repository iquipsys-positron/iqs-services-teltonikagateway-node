"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
class TeltonikaGatewayConnector {
    constructor() {
        this._connectionResolver = new pip_services3_components_node_2.ConnectionResolver();
        this._logger = new pip_services3_components_node_1.CompositeLogger();
    }
    configure(config) {
        this._connectionResolver.configure(config);
        this._logger.configure(config);
    }
    setReferences(references) {
        this._connectionResolver.setReferences(references);
        this._logger.setReferences(references);
    }
    isOpen() {
        return this._server != null;
    }
    open(correlationId, callback) {
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
                    }
                    catch (ex) {
                        this._logger.error(null, ex, "Failed to process the message");
                    }
                }
            });
            server.bind(port, host);
            // Todo: Temporary hack!!
            callback(null);
        });
    }
    close(correlationId, callback) {
        if (this._server != null) {
            this._server.close();
            this._server = null;
            this._logger.trace(correlationId, "Stopped Teltonika connector");
        }
        callback(null);
    }
    sendMessage(host, port, buffer) {
        if (this._server) {
            this._server.send(buffer, 0, buffer.length, port, host, (err) => {
                if (err)
                    this._logger.error(null, err, "Failed to send to udp:// " + host + ":" + port);
            });
        }
    }
    listenMessages(listener) {
        this._listener = listener;
    }
}
exports.TeltonikaGatewayConnector = TeltonikaGatewayConnector;
//# sourceMappingURL=TeltonikaGatewayConnector.js.map