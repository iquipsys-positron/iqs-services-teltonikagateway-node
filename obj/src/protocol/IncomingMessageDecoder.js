"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const AvlDataMessage_1 = require("./AvlDataMessage");
const AckMessage_1 = require("./AckMessage");
const iqs_libs_protocols_node_1 = require("iqs-libs-protocols-node");
class IncomingMessageDecoder {
    static decode(buffer, callback) {
        let messageType = buffer && buffer.length > 5 ? 0 : 1;
        let message = null;
        switch (messageType) {
            case 0:
                message = new AvlDataMessage_1.AvlDataMessage();
                break;
            case 1:
                message = new AckMessage_1.AckMessage();
                break;
        }
        if (message != null) {
            let stream = new iqs_libs_protocols_node_1.ReadStream(buffer);
            try {
                // Deserialize the message
                message.stream(stream);
            }
            catch (_a) {
                // If streaming fails then discard the message
                message = null;
            }
        }
        if (message == null) {
            callback(new pip_services3_commons_node_1.BadRequestException('teltonika-gateway', 'BAD_MESSAGE', 'Received unknown or invalid message'), null);
        }
        else {
            callback(null, message);
        }
    }
}
exports.IncomingMessageDecoder = IncomingMessageDecoder;
//# sourceMappingURL=IncomingMessageDecoder.js.map