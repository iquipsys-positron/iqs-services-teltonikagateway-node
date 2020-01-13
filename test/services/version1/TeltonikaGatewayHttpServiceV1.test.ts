let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { OrganizationsNullClientV1 } from 'pip-clients-organizations-node';
import { DeviceTypeV1 } from 'iqs-clients-devices-node';
import { DevicesMemoryClientV1 } from 'iqs-clients-devices-node';
import { StateUpdatesNullClientV1 } from 'iqs-clients-stateupdates-node';

import { TeltonikaGatewayConnector } from '../../../src/connectors/TeltonikaGatewayConnector'
import { TeltonikaGatewayController } from '../../../src/logic/TeltonikaGatewayController';
import { TeltonikaGatewayHttpServiceV1 } from '../../../src/services/version1/TeltonikaGatewayHttpServiceV1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('TeltonikaGatewayHttpServiceV1', ()=> {    
    let connector: TeltonikaGatewayConnector;
    let service: TeltonikaGatewayHttpServiceV1;
    let rest: any;

    suiteSetup((done) => {
        let controller = new TeltonikaGatewayController();

        connector = new TeltonikaGatewayConnector();

        service = new TeltonikaGatewayHttpServiceV1();
        service.configure(httpConfig);

        let devicesClient = new DevicesMemoryClientV1();
        devicesClient.createDevice(
            null,
            { id: '123', org_id: '1', udi: '123', type: DeviceTypeV1.IoTDevice, status: 'active' },
            (err, device) => {}
        );

        let references: References = References.fromTuples(
            new Descriptor('pip-services-organizations', 'client', 'null', 'default', '1.0'), new OrganizationsNullClientV1(),
            new Descriptor('iqs-services-devices', 'client', 'null', 'default', '1.0'), devicesClient,
            new Descriptor('iqs-services-stateupdates', 'client', 'null', 'default', '1.0'), new StateUpdatesNullClientV1(),
            new Descriptor('iqs-services-teltonikagateway', 'connector', 'default', 'default', '1.0'), connector,
            new Descriptor('iqs-services-teltonikagateway', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('iqs-services-teltonikagateway', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });
    
    
    test('Receive signals', (done) => {

        async.series([
        // Send signal to one device
            (callback) => {
                rest.post('/v1/teltonikagateway/send_signal', 
                    {
                        org_id: '1',
                        device_id: '123',
                        signal: 2,
                        timestamp: new Date().getTime() / 1000
                    },
                    (err, req, res, result) => {
                        assert.isNull(err);

                        assert.isObject(result);
                        assert.isFalse(result.result);

                        callback();
                    }
                );
            },
        // Broadcast signal to all organization devices
            (callback) => {
                rest.post('/v1/teltonikagateway/send_signal', 
                    {
                        org_id: '1',
                        device_id: '123',
                        signal: 2,
                        timestamp: new Date().getTime() / 1000
                    },
                    (err, req, res, result) => {
                        assert.isNull(err);

                        assert.isObject(result);
                        assert.isFalse(result.result);

                        callback();
                    }
                );
            }
        ], done);
    });
});