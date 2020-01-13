"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const TeltonikaGatewayConnector_1 = require("../connectors/TeltonikaGatewayConnector");
const TeltonikaGatewayController_1 = require("../logic/TeltonikaGatewayController");
const TeltonikaGatewayHttpServiceV1_1 = require("../services/version1/TeltonikaGatewayHttpServiceV1");
class TeltonikaGatewayServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(TeltonikaGatewayServiceFactory.ConnectorDescriptor, TeltonikaGatewayConnector_1.TeltonikaGatewayConnector);
        this.registerAsType(TeltonikaGatewayServiceFactory.ControllerDescriptor, TeltonikaGatewayController_1.TeltonikaGatewayController);
        this.registerAsType(TeltonikaGatewayServiceFactory.HttpServiceDescriptor, TeltonikaGatewayHttpServiceV1_1.TeltonikaGatewayHttpServiceV1);
    }
}
exports.TeltonikaGatewayServiceFactory = TeltonikaGatewayServiceFactory;
TeltonikaGatewayServiceFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-teltonikagateway", "factory", "default", "default", "1.0");
TeltonikaGatewayServiceFactory.ConnectorDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-teltonikagateway", "connector", "default", "*", "1.0");
TeltonikaGatewayServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-teltonikagateway", "controller", "default", "*", "1.0");
TeltonikaGatewayServiceFactory.HttpServiceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-teltonikagateway", "service", "http", "*", "1.0");
//# sourceMappingURL=TeltonikaGatewayServiceFactory.js.map