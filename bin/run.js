let TeltonikaGatewayProcess = require('../obj/src/container/TeltonikaGatewayProcess').TeltonikaGatewayProcess;

try {
    new TeltonikaGatewayProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
