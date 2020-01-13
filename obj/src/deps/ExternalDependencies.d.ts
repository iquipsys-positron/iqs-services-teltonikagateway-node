import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';
import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
import { IStateUpdatesClientV1 } from 'iqs-clients-stateupdates-node';
import { ITeltonikaGatewayConnector } from '../connectors/ITeltonikaGatewayConnector';
import { OrganizationsConnector } from './OrganizationsConnector';
import { DevicesConnector } from './DevicesConnector';
export declare class ExternalDependencies {
    logger: CompositeLogger;
    counters: CompositeCounters;
    statesClient: IStateUpdatesClientV1;
    devicesClient: IDevicesClientV1;
    organizationsClient: IOrganizationsClientV1;
    connector: ITeltonikaGatewayConnector;
    organizationsConnector: OrganizationsConnector;
    devicesConnector: DevicesConnector;
}
