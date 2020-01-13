import { ILogger } from 'pip-services3-components-node';
import { OrganizationV1 } from 'pip-clients-organizations-node';
import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
export declare class OrganizationsConnector {
    private _logger;
    private _organizationsClient;
    private _cacheById;
    private _cacheTime;
    private _cacheTimeout;
    constructor(_logger: ILogger, _organizationsClient: IOrganizationsClientV1);
    private clearObsoleteCache;
    private getOrganizationFromCacheById;
    private storeOrganizationToCache;
    findOrganizationById(orgId: string, callback: (err: any, organization: OrganizationV1) => void): void;
}
