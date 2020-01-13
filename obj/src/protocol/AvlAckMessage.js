"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const FmbMessage_1 = require("./FmbMessage");
const PacketType_1 = require("./PacketType");
class AvlAckMessage extends FmbMessage_1.FmbMessage {
    constructor() {
        super();
        this.packet_length = 5;
        this.packet_id = 0;
        this.packet_type = PacketType_1.PacketType.NoAcknowledgement;
    }
    stream(stream) {
        super.stream(stream);
        this.avl_packet_id = stream.streamByte(this.avl_packet_id);
        this.data_num = stream.streamByte(this.data_num);
    }
}
exports.AvlAckMessage = AvlAckMessage;
//# sourceMappingURL=AvlAckMessage.js.map