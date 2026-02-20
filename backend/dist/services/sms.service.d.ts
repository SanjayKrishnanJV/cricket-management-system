declare class SMSService {
    private client;
    private enabled;
    constructor();
    sendSMS(to: string, message: string): Promise<boolean>;
    sendMatchStartSMS(phone: string, match: any): Promise<boolean>;
    sendMatchResultSMS(phone: string, match: any): Promise<boolean>;
}
export declare const smsService: SMSService;
export {};
//# sourceMappingURL=sms.service.d.ts.map