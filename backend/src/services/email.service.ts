import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

const emailProvider = process.env.EMAIL_PROVIDER || 'nodemailer'; // 'nodemailer' or 'sendgrid'

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (emailProvider === 'sendgrid') {
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('✅ SendGrid email service initialized');
      }
    } else {
      // Nodemailer configuration
      if (process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log('✅ Nodemailer email service initialized');
      } else {
        console.log('ℹ️  Email service not configured');
      }
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          to,
          from: process.env.EMAIL_FROM || 'noreply@cricketapp.com',
          subject,
          html,
        });
      } else if (this.transporter) {
        await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@cricketapp.com',
          to,
          subject,
          html,
        });
      } else {
        console.warn('Email service not configured - email not sent');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendMatchStartNotification(userEmail: string, match: any): Promise<boolean> {
    const html = `
      <h2>🏏 Match Started!</h2>
      <p><strong>${match.homeTeam.name}</strong> vs <strong>${match.awayTeam.name}</strong></p>
      <p>Venue: ${match.venue}</p>
      <p>Format: ${match.tournament.format}</p>
      <p><a href="${process.env.FRONTEND_URL}/matches/${match.id}/live">Watch Live</a></p>
    `;
    return this.sendEmail(userEmail, 'Match Started - Live Now!', html);
  }

  async sendMatchResultNotification(userEmail: string, match: any): Promise<boolean> {
    const html = `
      <h2>🏆 Match Completed!</h2>
      <p><strong>${match.homeTeam.name}</strong> vs <strong>${match.awayTeam.name}</strong></p>
      <p>Result: ${match.result}</p>
      <p>Man of the Match: ${match.manOfMatch}</p>
      <p><a href="${process.env.FRONTEND_URL}/matches/${match.id}">View Scorecard</a></p>
    `;
    return this.sendEmail(userEmail, 'Match Result', html);
  }

  async sendPaymentConfirmation(userEmail: string, payment: any): Promise<boolean> {
    const html = `
      <h2>✅ Payment Confirmed</h2>
      <p>Amount: ${payment.currency} ${payment.amount}</p>
      <p>Transaction ID: ${payment.transactionId}</p>
      <p>Thank you for your payment!</p>
    `;
    return this.sendEmail(userEmail, 'Payment Confirmation', html);
  }
}

export const emailService = new EmailService();
