"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const TeltonikaGatewayServiceFactory_1 = require("../build/TeltonikaGatewayServiceFactory");
class TeltonikaGatewayLambdaFunction extends pip_services3_aws_node_1.CommandableLambdaFunction {
    constructor() {
        super("signals", "Teltonika gateway function");
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('iqs-services-signals', 'controller', 'default', '*', '*'));
        this._factories.add(new TeltonikaGatewayServiceFactory_1.TeltonikaGatewayServiceFactory());
    }
}
exports.TeltonikaGatewayLambdaFunction = TeltonikaGatewayLambdaFunction;
exports.handler = new TeltonikaGatewayLambdaFunction().getHandler();
//# sourceMappingURL=TeltonikaGatewayLambdaFunction.js.map