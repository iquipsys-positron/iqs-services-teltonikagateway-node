import { Descriptor } from 'pip-services3-commons-node';
import { CommandableLambdaFunction } from 'pip-services3-aws-node';
import { TeltonikaGatewayServiceFactory } from '../build/TeltonikaGatewayServiceFactory';

export class TeltonikaGatewayLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("signals", "Teltonika gateway function");
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-signals', 'controller', 'default', '*', '*'));
        this._factories.add(new TeltonikaGatewayServiceFactory());
    }
}

export const handler = new TeltonikaGatewayLambdaFunction().getHandler();