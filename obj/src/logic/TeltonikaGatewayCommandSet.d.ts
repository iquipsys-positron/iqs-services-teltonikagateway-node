import { CommandSet } from 'pip-services3-commons-node';
import { ITeltonikaGatewayController } from './ITeltonikaGatewayController';
export declare class TeltonikaGatewayCommandSet extends CommandSet {
    private _logic;
    constructor(logic: ITeltonikaGatewayController);
    private makeSendSignalCommand;
    private makeBroadcastSignalCommand;
    private makePingDeviceCommand;
}
