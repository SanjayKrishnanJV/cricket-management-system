"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const twilio_1 = __importDefault(require("twilio"));
class SMSService {
    constructor() {
        this.client = null;
        this.enabled = false;
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.enabled = true;
            console.log('✅ Twilio SMS service initialized');
        }
        else {
            console.log('ℹ️  Twilio not configured - SMS disabled');
        }
    }
    async sendSMS(to, message) {
        if (!this.enabled) {
            console.warn('SMS service not configured - message not sent');
            return false;
        }
        try {
            await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to,
            });
            return true;
        }
        catch (error) {
            console.error('SMS send error:', error);
            return false;
        }
    }
    async sendMatchStartSMS(phone, match) {
        const message = `🏏 Match Started! ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} at ${match.venue}. Watch live: ${process.env.FRONTEND_URL}/matches/${match.id}/live`;
        return this.sendSMS(phone, message);
    }
    async sendMatchResultSMS(phone, match) {
        const message = `🏆 ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}: ${match.result}`;
        return this.sendSMS(phone, message);
    }
}
exports.smsService = new SMSService();
//# sourceMappingURL=sms.service.js.map