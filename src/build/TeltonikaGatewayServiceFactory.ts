import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { TeltonikaGatewayConnector } from '../connectors/TeltonikaGatewayConnector';
import { TeltonikaGatewayController } from '../logic/TeltonikaGatewayController';
import { TeltonikaGatewayHttpServiceV1 } from '../services/version1/TeltonikaGatewayHttpServiceV1';

export class TeltonikaGatewayServiceFactory extends Factory {
	public static Descriptor = new Descriptor("iqs-services-teltonikagateway", "factory", "default", "default", "1.0");
	public static ConnectorDescriptor = new Descriptor("iqs-services-teltonikagateway", "connector", "default", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("iqs-services-teltonikagateway", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("iqs-services-teltonikagateway", "service", "http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(TeltonikaGatewayServiceFactory.ConnectorDescriptor, TeltonikaGatewayConnector);
		this.registerAsType(TeltonikaGatewayServiceFactory.ControllerDescriptor, TeltonikaGatewayController);
		this.registerAsType(TeltonikaGatewayServiceFactory.HttpServiceDescriptor, TeltonikaGatewayHttpServiceV1);
	}
	
}
