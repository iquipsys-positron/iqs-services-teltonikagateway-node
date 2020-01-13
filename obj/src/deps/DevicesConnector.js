"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
class DevicesConnector {
    constructor(_logger, _devicesClient) {
        this._logger = _logger;
        this._devicesClient = _devicesClient;
        this._cacheByUdi = {};
        this._cacheTime = new Date();
        this._cacheTimeout = 15000;
    }
    clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheTime = now;
        }
    }
    getDevicesFromCache(udi) {
        this.clearObsoleteCache();
        return this._cacheByUdi[udi];
    }
    storeDevicesToCache(udi, devices) {
        if (devices && devices.length > 0) {
            this.clearObsoleteCache();
            this._cacheByUdi[udi] = devices;
        }
    }
    storeDeviceToCache(device) {
        let devices = this._cacheByUdi[device.udi] || [];
        devices = _.filter(devices, d => d.id != device.id);
        devices.push(device);
        this._cacheByUdi[device.udi] = devices;
    }
    resolveDevices(udi, callback) {
        if (udi == '') {
            callback(new pip_services3_commons_node_2.BadRequestException('teltonika-gateway', 'NO_DEVICE_UDI', 'Device UDI is not defined'), null);
            return;
        }
        // Retrieve from cache
        udi = udi.toLowerCase();
        let devices = this.getDevicesFromCache(udi);
        if (devices != null) {
            callback(null, devices);
            return;
        }
        let filter = pip_services3_commons_node_1.FilterParams.fromTuples('udi', udi, 
        //'type', DeviceTypeV1.TeltonikaFmb,          
        'status', iqs_clients_devices_node_1.DeviceStatusV1.Active);
        this._devicesClient.getDevices('teltonika-gateway', filter, null, (err, page) => {
            let devices = page != null ? page.data : null;
            this.storeDevicesToCache(udi, devices);
            callback(err, devices);
        });
    }
    // Operation is performed asynchronously
    updateDevice(device) {
        if (device == null)
            return;
        this._devicesClient.updateDevice('teltonika-gateway', device, (err, device) => {
            this.storeDeviceToCache(device);
            if (err)
                this._logger.error('teltonika-gateway', err, 'Failed to update device info');
        });
    }
}
exports.DevicesConnector = DevicesConnector;
//# sourceMappingURL=DevicesConnector.js.map