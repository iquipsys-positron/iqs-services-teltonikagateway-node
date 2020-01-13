import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';

import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
import { IStateUpdatesClientV1 } from 'iqs-clients-stateupdates-node';

import { ITeltonikaGatewayConnector } from '../connectors/ITeltonikaGatewayConnector';
import { OrganizationsConnector } from './OrganizationsConnector';
import { DevicesConnector } from './DevicesConnector';

export class ExternalDependencies {
    public logger: CompositeLogger;
    public counters: CompositeCounters;
    
    public statesClient: IStateUpdatesClientV1;
    public devicesClient: IDevicesClientV1;
    public organizationsClient: IOrganizationsClientV1;

    public connector: ITeltonikaGatewayConnector;
    public organizationsConnector: OrganizationsConnector;
    public devicesConnector: DevicesConnector;
}