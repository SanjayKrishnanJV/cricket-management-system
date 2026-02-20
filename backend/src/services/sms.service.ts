import twilio from 'twilio';

class SMSService {
  private client: any = null;
  private enabled: boolean = false;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.enabled = true;
      console.log('✅ Twilio SMS service initialized');
    } else {
      console.log('ℹ️  Twilio not configured - SMS disabled');
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
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
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  async sendMatchStartSMS(phone: string, match: any): Promise<boolean> {
    const message = `🏏 Match Started! ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} at ${match.venue}. Watch live: ${process.env.FRONTEND_URL}/matches/${match.id}/live`;
    return this.sendSMS(phone, message);
  }

  async sendMatchResultSMS(phone: string, match: any): Promise<boolean> {
    const message = `🏆 ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}: ${match.result}`;
    return this.sendSMS(phone, message);
  }
}

export const smsService = new SMSService();
