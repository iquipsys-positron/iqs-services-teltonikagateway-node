let _ = require('lodash');
let async = require('async');

import { FilterParams } from 'pip-services3-commons-node';
import { ILogger } from 'pip-services3-components-node';
import { BadRequestException } from 'pip-services3-commons-node';
import { InvalidStateException } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';

import { DeviceTypeV1 } from 'iqs-clients-devices-node'; 
import { DeviceStatusV1 } from 'iqs-clients-devices-node'; 
import { DeviceV1 } from 'iqs-clients-devices-node'; 
import { IDevicesClientV1 } from 'iqs-clients-devices-node';

export class DevicesConnector {
    private _cacheByUdi: { [udi: string]: DeviceV1[] } = {};
    private _cacheTime: Date = new Date();
    private _cacheTimeout: number = 15000;

    public constructor(
        private _logger: ILogger,
        private _devicesClient: IDevicesClientV1
    ) {}

    private clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheTime = now;
        }
    }

    private getDevicesFromCache(udi: string): DeviceV1[] {
        this.clearObsoleteCache();
        return this._cacheByUdi[udi];
    }

    private storeDevicesToCache(udi: string, devices: DeviceV1[]): void {
        if (devices && devices.length > 0) {
            this.clearObsoleteCache();
            this._cacheByUdi[udi] = devices;
        }
    }

    private storeDeviceToCache(device: DeviceV1): void {
        let devices = this._cacheByUdi[device.udi] || [];
        devices = _.filter(devices, d => d.id != device.id);

        devices.push(device);

        this._cacheByUdi[device.udi] = devices;
    }
    
    public resolveDevices(udi: string,
        callback: (err: any, devices: DeviceV1[]) => void): void {

        if (udi == '') {
            callback(
                new BadRequestException(
                    'teltonika-gateway',
                    'NO_DEVICE_UDI',
                    'Device UDI is not defined'
                ),
                null
            );
            return;
        }

        // Retrieve from cache
        udi = udi.toLowerCase();
        let devices = this.getDevicesFromCache(udi);
        if (devices != null) {
            callback(null, devices);
            return;
        }

        let filter = FilterParams.fromTuples(
            'udi', udi,  
            //'type', DeviceTypeV1.TeltonikaFmb,          
            'status', DeviceStatusV1.Active
        );

        this._devicesClient.getDevices(
            'teltonika-gateway', filter, null,
            (err, page) => {
                let devices = page != null ? page.data : null;

                this.storeDevicesToCache(udi, devices);

                callback(err, devices);
            }
        );
    }

    // Operation is performed asynchronously
    public updateDevice(device: DeviceV1): void {
        if (device == null) return;

        this._devicesClient.updateDevice(
            'teltonika-gateway',
            device,
            (err, device) => {
                this.storeDeviceToCache(device);

                if (err) this._logger.error('teltonika-gateway', err, 'Failed to update device info');
            }
        )
    }
    
}