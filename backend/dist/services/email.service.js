"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
const sgMail = __importStar(require("@sendgrid/mail"));
const emailProvider = process.env.EMAIL_PROVIDER || 'nodemailer';
class EmailService {
    constructor() {
        this.transporter = null;
        if (emailProvider === 'sendgrid') {
            if (process.env.SENDGRID_API_KEY) {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                console.log('✅ SendGrid email service initialized');
            }
        }
        else {
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
            }
            else {
                console.log('ℹ️  Email service not configured');
            }
        }
    }
    async sendEmail(to, subject, html) {
        try {
            if (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
                await sgMail.send({
                    to,
                    from: process.env.EMAIL_FROM || 'noreply@cricketapp.com',
                    subject,
                    html,
                });
            }
            else if (this.transporter) {
                await this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'noreply@cricketapp.com',
                    to,
                    subject,
                    html,
                });
            }
            else {
                console.warn('Email service not configured - email not sent');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Email send error:', error);
            return false;
        }
    }
    async sendMatchStartNotification(userEmail, match) {
        const html = `
      <h2>🏏 Match Started!</h2>
      <p><strong>${match.homeTeam.name}</strong> vs <strong>${match.awayTeam.name}</strong></p>
      <p>Venue: ${match.venue}</p>
      <p>Format: ${match.tournament.format}</p>
      <p><a href="${process.env.FRONTEND_URL}/matches/${match.id}/live">Watch Live</a></p>
    `;
        return this.sendEmail(userEmail, 'Match Started - Live Now!', html);
    }
    async sendMatchResultNotification(userEmail, match) {
        const html = `
      <h2>🏆 Match Completed!</h2>
      <p><strong>${match.homeTeam.name}</strong> vs <strong>${match.awayTeam.name}</strong></p>
      <p>Result: ${match.result}</p>
      <p>Man of the Match: ${match.manOfMatch}</p>
      <p><a href="${process.env.FRONTEND_URL}/matches/${match.id}">View Scorecard</a></p>
    `;
        return this.sendEmail(userEmail, 'Match Result', html);
    }
    async sendPaymentConfirmation(userEmail, payment) {
        const html = `
      <h2>✅ Payment Confirmed</h2>
      <p>Amount: ${payment.currency} ${payment.amount}</p>
      <p>Transaction ID: ${payment.transactionId}</p>
      <p>Thank you for your payment!</p>
    `;
        return this.sendEmail(userEmail, 'Payment Confirmation', html);
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map