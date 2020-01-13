import { DependencyResolver } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';

import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';

import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
import { IStateUpdatesClientV1 } from 'iqs-clients-stateupdates-node';

import { ITeltonikaGatewayConnector } from '../connectors/ITeltonikaGatewayConnector';
import { OrganizationsConnector } from './OrganizationsConnector';
import { DevicesConnector } from './DevicesConnector';

import { ExternalDependencies } from './ExternalDependencies';

export class ExternalDependenciesResolver extends DependencyResolver {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.connector', 'iqs-services-teltonikagateway:connector:*:*:1.0',
        'dependencies.organizations', 'pip-services-organizations:client:*:*:1.0',
        'dependencies.devices', 'iqs-services-devices:client:*:*:1.0',
        'dependencies.state-updates', 'iqs-services-stateupdates:client:*:*:1.0'
    );

    public constructor() {
        super(ExternalDependenciesResolver._defaultConfig);
    }

    public resolve(): ExternalDependencies {
        let dependencies = new ExternalDependencies();

        dependencies.organizationsClient = this.getOneRequired<IOrganizationsClientV1>('organizations');
        dependencies.devicesClient = this.getOneRequired<IDevicesClientV1>('devices');
        dependencies.statesClient = this.getOneRequired<IStateUpdatesClientV1>('state-updates');

        dependencies.connector = this.getOneRequired<ITeltonikaGatewayConnector>('connector');

        dependencies.organizationsConnector = new OrganizationsConnector(dependencies.logger, dependencies.organizationsClient);
        dependencies.devicesConnector = new DevicesConnector(dependencies.logger, dependencies.devicesClient);
        
        return dependencies;
    }
}