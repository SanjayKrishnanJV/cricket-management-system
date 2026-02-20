import cron from 'node-cron';
import { challengeService } from '../services/challenge.service';
import { leaderboardService } from '../services/leaderboard.service';
import prisma from '../config/database';

/**
 * Gamification Cron Jobs
 *
 * Jobs scheduled:
 * - Generate daily challenges at midnight
 * - Recalculate leaderboards every hour
 * - Expire old challenges at midnight
 */

console.log('🕐 Initializing gamification cron jobs...');

// Generate daily challenges at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 [CRON] Generating daily challenges...');
    const result = await challengeService.generateDailyChallenges();
    console.log(`✅ [CRON] Generated ${result.count} daily challenges`);
  } catch (error) {
    console.error('❌ [CRON] Error generating daily challenges:', error);
  }
}, {
  timezone: 'UTC',
});

// Recalculate leaderboards every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 [CRON] Recalculating leaderboards...');
    await leaderboardService.recalculateLeaderboards();
    console.log('✅ [CRON] Leaderboards recalculated successfully');
  } catch (error) {
    console.error('❌ [CRON] Error recalculating leaderboards:', error);
  }
}, {
  timezone: 'UTC',
});

// Expire old challenges at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 [CRON] Expiring old challenges...');
    const now = new Date();
    const result = await prisma.challenge.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });
    console.log(`✅ [CRON] Expired ${result.count} challenges`);
  } catch (error) {
    console.error('❌ [CRON] Error expiring challenges:', error);
  }
}, {
  timezone: 'UTC',
});

console.log('✅ Gamification cron jobs initialized');
console.log('  - Daily challenges: 00:00 UTC');
console.log('  - Leaderboards: Every hour');
console.log('  - Challenge expiry: 00:00 UTC');
