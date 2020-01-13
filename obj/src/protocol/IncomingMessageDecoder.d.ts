/// <reference types="node" />
import { FmbMessage } from './FmbMessage';
export declare class IncomingMessageDecoder {
    static decode(buffer: Buffer, callback: (err: any, message: FmbMessage) => void): void;
}
