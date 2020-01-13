"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const pip_clients_organizations_node_1 = require("pip-clients-organizations-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
const iqs_clients_stateupdates_node_1 = require("iqs-clients-stateupdates-node");
const TeltonikaGatewayServiceFactory_1 = require("../build/TeltonikaGatewayServiceFactory");
class TeltonikaGatewayProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("teltonika-gateway", "Teltonika gateway microservice");
        this._factories.add(new TeltonikaGatewayServiceFactory_1.TeltonikaGatewayServiceFactory());
        this._factories.add(new pip_clients_organizations_node_1.OrganizationsClientFactory());
        this._factories.add(new iqs_clients_devices_node_1.DevicesClientFactory());
        this._factories.add(new iqs_clients_stateupdates_node_1.StateUpdatesClientFactory());
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory);
    }
}
exports.TeltonikaGatewayProcess = TeltonikaGatewayProcess;
//# sourceMappingURL=TeltonikaGatewayProcess.js.map