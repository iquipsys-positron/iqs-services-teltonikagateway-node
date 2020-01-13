"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
class TeltonikaGatewayCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands
        this.addCommand(this.makeSendSignalCommand());
        this.addCommand(this.makeBroadcastSignalCommand());
        this.addCommand(this.makePingDeviceCommand());
    }
    makeSendSignalCommand() {
        return new pip_services3_commons_node_2.Command("send_signal", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('device_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('signal', pip_services3_commons_node_4.TypeCode.Integer)
            .withOptionalProperty('timestamp', pip_services3_commons_node_4.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let signal = args.getAsInteger("signal");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.sendSignal(correlationId, orgId, deviceId, signal, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makeBroadcastSignalCommand() {
        return new pip_services3_commons_node_2.Command("broadcast_signal", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('signal', pip_services3_commons_node_4.TypeCode.Integer)
            .withOptionalProperty('timestamp', pip_services3_commons_node_4.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let signal = args.getAsInteger("signal");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.broadcastSignal(correlationId, orgId, signal, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makePingDeviceCommand() {
        return new pip_services3_commons_node_2.Command("ping_device", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_4.TypeCode.String)
            .withRequiredProperty('device_id', pip_services3_commons_node_4.TypeCode.String), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            this._logic.pingDevice(correlationId, orgId, deviceId, (err) => {
                callback(err, null);
            });
        });
    }
}
exports.TeltonikaGatewayCommandSet = TeltonikaGatewayCommandSet;
//# sourceMappingURL=TeltonikaGatewayCommandSet.js.map