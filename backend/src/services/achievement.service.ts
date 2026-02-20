import prisma from '../config/database';
import { io } from '../server';

export class AchievementService {
  /**
   * Check and unlock achievements for a player after a match
   */
  async checkPlayerAchievements(playerId: string, matchId: string) {
    const achievements = [];

    // Get player's performance in this match
    const battingPerf = await prisma.battingPerformance.findFirst({
      where: { playerId, innings: { matchId } },
    });

    const bowlingPerf = await prisma.bowlingPerformance.findFirst({
      where: { playerId, innings: { matchId } },
    });

    // Check batting achievements
    if (battingPerf) {
      // Century (100+ runs)
      if (battingPerf.runs >= 100) {
        await this.unlockAchievement(playerId, 'century', matchId, battingPerf.runs);
        achievements.push('Century King');
      }

      // Half-century (50-99 runs)
      if (battingPerf.runs >= 50 && battingPerf.runs < 100) {
        await this.unlockAchievement(playerId, 'half_century', matchId, battingPerf.runs);
        achievements.push('Half-Century Hero');
      }

      // Strike Master (SR >= 200 with min 20 balls)
      if (battingPerf.ballsFaced >= 20 && battingPerf.strikeRate >= 200) {
        await this.unlockAchievement(playerId, 'strike_master', matchId, battingPerf.strikeRate);
        achievements.push('Strike Master');
      }
    }

    // Check bowling achievements
    if (bowlingPerf) {
      // Five-wicket haul
      if (bowlingPerf.wickets >= 5) {
        await this.unlockAchievement(playerId, 'fifer', matchId, bowlingPerf.wickets);
        achievements.push('Five-Wicket Hero');
      }

      // Hat-trick
      const hatTrick = await this.checkHatTrick(playerId, matchId);
      if (hatTrick) {
        await this.unlockAchievement(playerId, 'hat_trick', matchId, 3);
        achievements.push('Hat-Trick Hero');
      }

      // Economy King (ER <= 6 with min 4 overs)
      if (bowlingPerf.oversBowled >= 4 && bowlingPerf.economyRate <= 6) {
        await this.unlockAchievement(playerId, 'economy_king', matchId, bowlingPerf.economyRate);
        achievements.push('Economy King');
      }
    }

    return achievements;
  }

  /**
   * Unlock a specific achievement for a player
   */
  async unlockAchievement(
    playerId: string,
    achievementCode: string,
    matchId?: string,
    statValue?: number
  ) {
    const achievement = await prisma.achievement.findUnique({
      where: { name: achievementCode },
    });

    if (!achievement) {
      console.log(`Achievement ${achievementCode} not found`);
      return null;
    }

    // Check if already unlocked for this match
    const existing = await prisma.playerAchievement.findUnique({
      where: {
        playerId_achievementId_matchId: {
          playerId,
          achievementId: achievement.id,
          matchId: matchId || '',
        },
      },
    });

    if (existing) {
      return null;
    }

    // Create achievement unlock
    const unlock = await prisma.playerAchievement.create({
      data: {
        playerId,
        achievementId: achievement.id,
        matchId,
        statValue: statValue ? Math.floor(statValue) : null,
        unlockedAt: new Date(),
      },
      include: {
        achievement: true,
        player: true,
      },
    });

    // Emit real-time notification
    if (matchId) {
      io.to(`match-${matchId}`).emit('achievement-unlocked', {
        playerId,
        playerName: unlock.player.name,
        achievement: unlock.achievement,
        statValue,
      });
    }

    console.log(
      `✨ Achievement unlocked: ${unlock.player.name} - ${unlock.achievement.name}`
    );

    return unlock;
  }

  /**
   * Check if a player has taken a hat-trick in the match
   */
  async checkHatTrick(playerId: string, matchId: string): Promise<boolean> {
    const balls = await prisma.ball.findMany({
      where: {
        bowlerId: playerId,
        innings: { matchId },
        isWicket: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (balls.length < 3) return false;

    // Check for 3 consecutive wickets
    for (let i = 0; i <= balls.length - 3; i++) {
      const ball1 = balls[i];
      const ball2 = balls[i + 1];
      const ball3 = balls[i + 2];

      // Check if wickets are consecutive
      const isConsecutive =
        ball2.overNumber === ball1.overNumber &&
        ball2.ballNumber === ball1.ballNumber + 1 &&
        ball3.overNumber === ball2.overNumber &&
        ball3.ballNumber === ball2.ballNumber + 1;

      if (isConsecutive) {
        return true;
      }

      // Also check across overs (last ball of over + first balls of next over)
      const isAcrossOvers =
        (ball2.overNumber === ball1.overNumber + 1 &&
          ball1.ballNumber === 6 &&
          ball2.ballNumber === 1 &&
          ball3.overNumber === ball2.overNumber &&
          ball3.ballNumber === ball2.ballNumber + 1) ||
        (ball3.overNumber === ball2.overNumber + 1 &&
          ball2.ballNumber === 6 &&
          ball3.ballNumber === 1 &&
          ball2.overNumber === ball1.overNumber &&
          ball2.ballNumber === ball1.ballNumber + 1);

      if (isAcrossOvers) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all achievements unlocked by a player
   */
  async getPlayerAchievements(playerId: string) {
    const achievements = await prisma.playerAchievement.findMany({
      where: { playerId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return { success: true, data: achievements };
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements() {
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { tier: 'asc' }],
    });

    return { success: true, data: achievements };
  }

  /**
   * Seed predefined achievements into the database
   */
  async seedAchievements() {
    const achievements = [
      {
        name: 'century',
        description: 'Score a century (100+ runs)',
        category: 'BATTING',
        tier: 'GOLD',
        points: 100,
        criteria: JSON.stringify({ type: 'runs', min: 100 }),
      },
      {
        name: 'half_century',
        description: 'Score a half-century (50+ runs)',
        category: 'BATTING',
        tier: 'SILVER',
        points: 50,
        criteria: JSON.stringify({ type: 'runs', min: 50, max: 99 }),
      },
      {
        name: 'fifer',
        description: 'Take 5 wickets in an innings',
        category: 'BOWLING',
        tier: 'GOLD',
        points: 100,
        criteria: JSON.stringify({ type: 'wickets', min: 5 }),
      },
      {
        name: 'hat_trick',
        description: 'Take 3 consecutive wickets',
        category: 'BOWLING',
        tier: 'PLATINUM',
        points: 150,
        criteria: JSON.stringify({ type: 'hat_trick' }),
      },
      {
        name: 'strike_master',
        description: 'Strike rate above 200 (min 20 balls)',
        category: 'BATTING',
        tier: 'GOLD',
        points: 75,
        criteria: JSON.stringify({ type: 'strike_rate', min: 200, minBalls: 20 }),
      },
      {
        name: 'economy_king',
        description: 'Economy rate below 6 (min 4 overs)',
        category: 'BOWLING',
        tier: 'SILVER',
        points: 60,
        criteria: JSON.stringify({ type: 'economy', max: 6, minOvers: 4 }),
      },
    ];

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
    }

    console.log('✅ Achievements seeded successfully');

    return { success: true, message: 'Achievements seeded', count: achievements.length };
  }

  /**
   * Get achievement statistics for a player
   */
  async getPlayerAchievementStats(playerId: string) {
    const achievements = await prisma.playerAchievement.findMany({
      where: { playerId },
      include: { achievement: true },
    });

    const stats = {
      total: achievements.length,
      byCategory: {} as Record<string, number>,
      byTier: {} as Record<string, number>,
      totalPoints: 0,
    };

    achievements.forEach((pa) => {
      const category = pa.achievement.category;
      const tier = pa.achievement.tier;

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
      stats.totalPoints += pa.achievement.points;
    });

    return { success: true, data: stats };
  }
}

export const achievementService = new AchievementService();
