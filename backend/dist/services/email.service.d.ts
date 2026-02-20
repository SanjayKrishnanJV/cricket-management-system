declare class EmailService {
    private transporter;
    constructor();
    sendEmail(to: string, subject: string, html: string): Promise<boolean>;
    sendMatchStartNotification(userEmail: string, match: any): Promise<boolean>;
    sendMatchResultNotification(userEmail: string, match: any): Promise<boolean>;
    sendPaymentConfirmation(userEmail: string, payment: any): Promise<boolean>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=email.service.d.ts.map