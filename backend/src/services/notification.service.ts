import { emailService } from './email.service';
import { smsService } from './sms.service';
import prisma from '../config/database';

class NotificationService {
  async notifyMatchStart(matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
      });

      if (!match) return;

      // Get all users (in future, filter by followers)
      const users = await prisma.user.findMany({
        where: {
          // In future: Add followers filtering
          // For now, send to all users
        },
      });

      // Send notifications in parallel
      const notifications = users.map(async (user) => {
        if (user.email) {
          await emailService.sendMatchStartNotification(user.email, match);
        }
        // SMS notifications (if user has phone and enabled SMS)
        // if (user.phone && user.smsNotifications) {
        //   await smsService.sendMatchStartSMS(user.phone, match);
        // }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Match start notification error:', error);
    }
  }

  async notifyMatchEnd(matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });

      if (!match) return;

      const users = await prisma.user.findMany({
        where: {
          email: {
            not: null,
          },
        },
      });

      const notifications = users.map(async (user) => {
        if (user.email) {
          await emailService.sendMatchResultNotification(user.email, match);
        }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Match end notification error:', error);
    }
  }
}

export const notificationService = new NotificationService();
