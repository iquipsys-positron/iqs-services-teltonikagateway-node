import { BadRequestException } from 'pip-services3-commons-node';

import { FmbMessage } from './FmbMessage';
import { AvlDataMessage } from './AvlDataMessage';
import { AckMessage } from './AckMessage';
import { ReadStream } from 'iqs-libs-protocols-node';

export class IncomingMessageDecoder {

    public static decode(buffer: Buffer,
        callback: (err: any, message: FmbMessage) => void): void {
        
        let messageType = buffer && buffer.length > 5 ? 0 : 1;
        let message: FmbMessage = null;

        switch (messageType) {
            case 0:
                message = new AvlDataMessage();
                break;
            case 1:
                message = new AckMessage();
                break;
        }

        if (message != null) {
            let stream = new ReadStream(buffer);
            try {
                // Deserialize the message
                message.stream(stream);
            } catch {
                // If streaming fails then discard the message
                message = null;
            }
        }

        if (message == null) {
            callback(new BadRequestException(
                'teltonika-gateway',
                'BAD_MESSAGE',
                'Received unknown or invalid message'
            ), null);
        } else {
            callback(null, message);
        }
    }
    
}