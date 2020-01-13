import { IStream } from 'iqs-libs-protocols-node';
import { FmbMessage } from './FmbMessage';
export declare class AvlAckMessage extends FmbMessage {
    avl_packet_id: number;
    data_num: number;
    constructor();
    stream(stream: IStream): void;
}
