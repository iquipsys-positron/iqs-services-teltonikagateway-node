import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

import { ITeltonikaGatewayController } from './ITeltonikaGatewayController';

export class TeltonikaGatewayCommandSet extends CommandSet {
    private _logic: ITeltonikaGatewayController;

    constructor(logic: ITeltonikaGatewayController) {
        super();

        this._logic = logic;

        // Register commands
		this.addCommand(this.makeSendSignalCommand());
		this.addCommand(this.makeBroadcastSignalCommand());
		this.addCommand(this.makePingDeviceCommand());
    }

	private makeSendSignalCommand(): ICommand {
		return new Command(
			"send_signal",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('device_id', TypeCode.String)
				.withRequiredProperty('signal', TypeCode.Integer)
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let signal = args.getAsInteger("signal");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.sendSignal(correlationId, orgId, deviceId, signal, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makeBroadcastSignalCommand(): ICommand {
		return new Command(
			"broadcast_signal",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('signal', TypeCode.Integer)
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let signal = args.getAsInteger("signal");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.broadcastSignal(correlationId, orgId, signal, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makePingDeviceCommand(): ICommand {
		return new Command(
			"ping_device",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('device_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                this._logic.pingDevice(correlationId, orgId, deviceId, (err) => {
					callback(err, null);
				});
            }
		);
	}
	
}