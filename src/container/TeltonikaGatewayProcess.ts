import { IReferences } from 'pip-services3-commons-node';
import { ProcessContainer } from 'pip-services3-container-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

import { OrganizationsClientFactory } from 'pip-clients-organizations-node';
import { DevicesClientFactory } from 'iqs-clients-devices-node';
import { StateUpdatesClientFactory } from 'iqs-clients-stateupdates-node';

import { TeltonikaGatewayServiceFactory } from '../build/TeltonikaGatewayServiceFactory';

export class TeltonikaGatewayProcess extends ProcessContainer {

    public constructor() {
        super("teltonika-gateway", "Teltonika gateway microservice");
        this._factories.add(new TeltonikaGatewayServiceFactory());
        this._factories.add(new OrganizationsClientFactory());
        this._factories.add(new DevicesClientFactory());
        this._factories.add(new StateUpdatesClientFactory());
        this._factories.add(new DefaultRpcFactory);
    }

}
