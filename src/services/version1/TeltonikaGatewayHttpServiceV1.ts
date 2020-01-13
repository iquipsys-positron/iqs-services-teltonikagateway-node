import { Descriptor } from 'pip-services3-commons-node';
import { CommandableHttpService } from 'pip-services3-rpc-node';

export class TeltonikaGatewayHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/teltonikagateway');
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-teltonikagateway', 'controller', 'default', '*', '1.0'));
    }
}