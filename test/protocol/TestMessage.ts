import { FmbMessage } from '../../src/protocol/FmbMessage'; 
import { IStream } from 'iqs-libs-protocols-node';

export class TestMessage extends FmbMessage {

    public constructor() {
        super();
    }

    public value1: number;
    public value2: number;
    public value3: number;
    public value4: number;
    public value5: boolean;
    public value6: string;
    public value7: Date;

    public stream(stream: IStream): void {
        this.value1 = stream.streamByte(this.value1);
        this.value2 = stream.streamWord(this.value2);
        this.value3 = stream.streamDWord(this.value3);
        this.value4 = stream.streamInteger(this.value4);
        this.value5 = stream.streamBoolean(this.value5);
        this.value6 = stream.streamString(this.value6);
        this.value7 = stream.streamDateTime(this.value7);
    }

}