"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
class OrganizationsConnector {
    constructor(_logger, _organizationsClient) {
        this._logger = _logger;
        this._organizationsClient = _organizationsClient;
        this._cacheById = {};
        this._cacheTime = new Date();
        this._cacheTimeout = 15000;
    }
    clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheById = {};
            this._cacheTime = now;
        }
    }
    getOrganizationFromCacheById(id) {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }
    storeOrganizationToCache(organization) {
        if (organization) {
            this.clearObsoleteCache();
            this._cacheById[organization.id] = organization;
        }
    }
    findOrganizationById(orgId, callback) {
        // Retrieve from cache
        let organization = this.getOrganizationFromCacheById(orgId);
        if (organization) {
            callback(null, organization);
            return;
        }
        this._organizationsClient.getOrganizationById('teltonika-gateway', orgId, (err, organization) => {
            this.storeOrganizationToCache(organization);
            callback(err, organization);
        });
    }
}
exports.OrganizationsConnector = OrganizationsConnector;
//# sourceMappingURL=OrganizationsConnector.js.map