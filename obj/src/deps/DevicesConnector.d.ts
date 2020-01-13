import { ILogger } from 'pip-services3-components-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
export declare class DevicesConnector {
    private _logger;
    private _devicesClient;
    private _cacheByUdi;
    private _cacheTime;
    private _cacheTimeout;
    constructor(_logger: ILogger, _devicesClient: IDevicesClientV1);
    private clearObsoleteCache;
    private getDevicesFromCache;
    private storeDevicesToCache;
    private storeDeviceToCache;
    resolveDevices(udi: string, callback: (err: any, devices: DeviceV1[]) => void): void;
    updateDevice(device: DeviceV1): void;
}
