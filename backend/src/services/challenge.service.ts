import prisma from '../config/database';
import { rewardsService } from './rewards.service';
import { io } from '../server';

export class ChallengeService {
  /**
   * Generate daily challenges
   */
  async generateDailyChallenges() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const dailyChallenges = [
      {
        title: 'Half-Century Hero',
        description: 'Score 50+ runs in a match',
        type: 'DAILY',
        target: 'PLAYER',
        requirements: JSON.stringify({ type: 'runs', value: 50 }),
        xpReward: 50,
        pointsReward: 25,
      },
      {
        title: 'Wicket Hunter',
        description: 'Take 3+ wickets in a match',
        type: 'DAILY',
        target: 'PLAYER',
        requirements: JSON.stringify({ type: 'wickets', value: 3 }),
        xpReward: 50,
        pointsReward: 25,
      },
      {
        title: 'Prediction Master',
        description: 'Make 5 correct predictions',
        type: 'DAILY',
        target: 'USER',
        requirements: JSON.stringify({ type: 'predictions', value: 5 }),
        xpReward: 30,
        pointsReward: 15,
      },
      {
        title: 'Boundary Blaster',
        description: 'Hit 10+ boundaries (4s or 6s) in a match',
        type: 'DAILY',
        target: 'PLAYER',
        requirements: JSON.stringify({ type: 'boundaries', value: 10 }),
        xpReward: 40,
        pointsReward: 20,
      },
      {
        title: 'Economy Expert',
        description: 'Bowl 4 overs with economy rate under 6',
        type: 'DAILY',
        target: 'PLAYER',
        requirements: JSON.stringify({ type: 'economy', value: 6, minOvers: 4 }),
        xpReward: 40,
        pointsReward: 20,
      },
    ];

    // Create challenges
    const created = [];
    for (const challenge of dailyChallenges) {
      const existing = await prisma.challenge.findFirst({
        where: {
          title: challenge.title,
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
      });

      if (!existing) {
        const newChallenge = await prisma.challenge.create({
          data: {
            ...challenge,
            startDate,
            endDate,
          },
        });
        created.push(newChallenge);
      }
    }

    console.log(`✅ Generated ${created.length} daily challenges`);

    return { success: true, count: created.length, data: created };
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(target: string = 'PLAYER') {
    const now = new Date();

    const challenges = await prisma.challenge.findMany({
      where: {
        target: target as any,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: challenges };
  }

  /**
   * Get player's challenge progress
   */
  async getPlayerProgress(playerId: string) {
    const progress = await prisma.challengeProgress.findMany({
      where: { playerId },
      include: { challenge: true },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: progress };
  }

  /**
   * Get user's challenge progress
   */
  async getUserProgress(userId: string) {
    const progress = await prisma.challengeProgress.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, data: progress };
  }

  /**
   * Update challenge progress after a match
   */
  async updateChallengeProgress(playerId: string, matchId: string) {
    const activeChallenges = await this.getActiveChallenges('PLAYER');

    const battingPerf = await prisma.battingPerformance.findFirst({
      where: { playerId, innings: { matchId } },
    });

    const bowlingPerf = await prisma.bowlingPerformance.findFirst({
      where: { playerId, innings: { matchId } },
    });

    for (const challenge of activeChallenges.data) {
      const requirements = JSON.parse(challenge.requirements);

      let currentValue = 0;
      let targetValue = requirements.value;
      let completed = false;

      // Calculate progress based on requirement type
      if (requirements.type === 'runs' && battingPerf) {
        currentValue = battingPerf.runs;
        completed = currentValue >= targetValue;
      } else if (requirements.type === 'wickets' && bowlingPerf) {
        currentValue = bowlingPerf.wickets;
        completed = currentValue >= targetValue;
      } else if (requirements.type === 'boundaries' && battingPerf) {
        currentValue = battingPerf.fours + battingPerf.sixes;
        completed = currentValue >= targetValue;
      } else if (requirements.type === 'economy' && bowlingPerf) {
        if (bowlingPerf.oversBowled >= (requirements.minOvers || 0)) {
          currentValue = bowlingPerf.economyRate;
          completed = currentValue <= targetValue;
        }
      }

      // Upsert progress
      if (currentValue > 0) {
        await prisma.challengeProgress.upsert({
          where: {
            challengeId_playerId_userId: {
              challengeId: challenge.id,
              playerId,
              userId: null,
            },
          },
          update: {
            currentValue,
            status: completed ? 'COMPLETED' : 'ACTIVE',
            completedAt: completed ? new Date() : null,
          },
          create: {
            challengeId: challenge.id,
            playerId,
            currentValue,
            targetValue,
            status: completed ? 'COMPLETED' : 'ACTIVE',
            completedAt: completed ? new Date() : null,
          },
        });

        // Emit socket event for challenge completion
        if (completed) {
          io.to(`match-${matchId}`).emit('challenge-completed', {
            playerId,
            challenge,
          });
        }
      }
    }
  }

  /**
   * Claim reward for completed challenge
   */
  async claimReward(progressId: string) {
    const progress = await prisma.challengeProgress.findUnique({
      where: { id: progressId },
      include: { challenge: true },
    });

    if (!progress) {
      throw new Error('Challenge progress not found');
    }

    if (progress.status !== 'COMPLETED') {
      throw new Error('Challenge not completed');
    }

    if (progress.rewardClaimed) {
      throw new Error('Reward already claimed');
    }

    // Award rewards
    const userId = progress.userId;
    if (userId) {
      await rewardsService.awardXP(
        userId,
        progress.challenge.xpReward,
        `Challenge: ${progress.challenge.title}`,
        { challengeId: progress.challenge.id }
      );

      await rewardsService.awardPoints(
        userId,
        progress.challenge.pointsReward,
        `Challenge: ${progress.challenge.title}`,
        { challengeId: progress.challenge.id }
      );
    }

    // Mark as claimed
    const updatedProgress = await prisma.challengeProgress.update({
      where: { id: progressId },
      data: { rewardClaimed: true },
    });

    return {
      success: true,
      data: updatedProgress,
      rewards: {
        xp: progress.challenge.xpReward,
        points: progress.challenge.pointsReward,
      },
    };
  }

  /**
   * Expire old challenges
   */
  async expireOldChallenges() {
    const now = new Date();

    const result = await prisma.challenge.updateMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    console.log(`✅ Expired ${result.count} challenges`);

    return { success: true, count: result.count };
  }
}

export const challengeService = new ChallengeService();
