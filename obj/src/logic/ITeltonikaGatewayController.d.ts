export interface ITeltonikaGatewayController {
    sendSignal(correlationId: string, orgId: string, deviceId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): any;
    broadcastSignal(correlationId: string, orgId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): any;
    pingDevice(correlationId: string, orgId: string, deviceId: string, callback?: (err: any) => void): any;
}
