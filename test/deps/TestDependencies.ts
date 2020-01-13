import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';

import { OrganizationsMemoryClientV1 } from 'pip-clients-organizations-node';
import { DevicesMemoryClientV1 } from 'iqs-clients-devices-node';
import { StateUpdatesNullClientV1 } from 'iqs-clients-stateupdates-node';

import { ITeltonikaGatewayConnector } from '../../src/connectors/ITeltonikaGatewayConnector';
import { OrganizationsConnector } from '../../src/deps/OrganizationsConnector';
import { DevicesConnector } from '../../src/deps/DevicesConnector';

import { ExternalDependencies } from '../../src/deps/ExternalDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';

export class TestDependencies extends ExternalDependencies {

    public constructor() {
        super();

        this.logger = new CompositeLogger();
        this.counters = new CompositeCounters();

        this.organizationsClient = new OrganizationsMemoryClientV1();
        this.devicesClient = new DevicesMemoryClientV1();
        this.statesClient = new StateUpdatesNullClientV1();

        this.connector = new TestGatewayConnector();
        this.organizationsConnector = new OrganizationsConnector(this.logger, this.organizationsClient);
        this.devicesConnector = new DevicesConnector(this.logger, this.devicesClient);
    }

}