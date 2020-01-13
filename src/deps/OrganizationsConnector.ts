let _ = require('lodash');
let async = require('async');

import { ILogger } from 'pip-services3-components-node';
import { BadRequestException } from 'pip-services3-commons-node';

import { OrganizationV1 } from 'pip-clients-organizations-node'; 
import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';

export class OrganizationsConnector {
    private _cacheById: { [id: string]: OrganizationV1 } = {};
    private _cacheTime: Date = new Date();
    private _cacheTimeout: number = 15000;

    public constructor(
        private _logger: ILogger,
        private _organizationsClient: IOrganizationsClientV1
    ) {}

    private clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheById = {};
            this._cacheTime = now;
        }
    }

    private getOrganizationFromCacheById(id: string): OrganizationV1 {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }

    private storeOrganizationToCache(organization: OrganizationV1): void {
        if (organization) {
            this.clearObsoleteCache();
            this._cacheById[organization.id] = organization;
        }
    }

    public findOrganizationById(orgId: string,
        callback: (err: any, organization: OrganizationV1) => void): void {

        // Retrieve from cache
        let organization = this.getOrganizationFromCacheById(orgId);
        if (organization) {
            callback(null, organization);
            return;
        }
            
        this._organizationsClient.getOrganizationById(
            'teltonika-gateway',
            orgId,
            (err, organization) => {
                this.storeOrganizationToCache(organization);
                
                callback(err, organization);
            }
        );
    }

}