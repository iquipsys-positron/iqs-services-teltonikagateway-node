let _ = require('lodash');

import { IStream } from 'iqs-libs-protocols-node';
import { IStreamable } from 'iqs-libs-protocols-node';

import { FmbMessage } from './FmbMessage';
import { PacketType } from './PacketType';
import { AvlData } from './AvlData';
import { IoElement } from './IoElement';

export class AvlAckMessage extends FmbMessage {
    public avl_packet_id: number;
    public data_num: number;

    public constructor() {
        super();

        this.packet_length = 5;
        this.packet_id = 0;
        this.packet_type = PacketType.NoAcknowledgement;
    }

    public stream(stream: IStream): void {
        super.stream(stream);

        this.avl_packet_id = stream.streamByte(this.avl_packet_id);
        this.data_num = stream.streamByte(this.data_num);
    }

}