export interface ITeltonikaGatewayController {

    sendSignal(correlationId: string, orgId: string, deviceId: string,
        signal: number, timestamp: number,
        callback?: (err: any, result: boolean) => void);

    broadcastSignal(correlationId: string, orgId: string,
        signal: number, timestamp: number,
        callback?: (err: any, result: boolean) => void);

    pingDevice(correlationId: string, orgId: string, deviceId: string,
        callback?: (err: any) => void);
}