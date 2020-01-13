"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FmbMessage_1 = require("./FmbMessage");
const PacketType_1 = require("./PacketType");
class AckMessage extends FmbMessage_1.FmbMessage {
    constructor() {
        super();
        this.packet_length = 3;
        this.packet_type = PacketType_1.PacketType.Acknowledgement;
        this.packet_id = 0;
    }
}
exports.AckMessage = AckMessage;
//# sourceMappingURL=AckMessage.js.map