import prisma from '../config/database';
import { io } from '../server';

export class RewardsService {
  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string) {
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Create profile if it doesn't exist
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          totalXP: 0,
          level: 1,
          xpToNextLevel: 100,
          totalPoints: 0,
        },
        include: {
          transactions: true,
        },
      });
    }

    return { success: true, data: profile };
  }

  /**
   * Award XP to a user
   */
  async awardXP(
    userId: string,
    amount: number,
    reason: string,
    context?: { matchId?: string; achievementId?: string; challengeId?: string }
  ) {
    // Get or create profile
    const profileResult = await this.getUserProfile(userId);
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    const newTotalXP = profile.totalXP + amount;
    let newLevel = profile.level;
    let xpToNextLevel = profile.xpToNextLevel;

    // Check for level up
    while (newTotalXP >= xpToNextLevel) {
      newLevel++;
      xpToNextLevel = this.calculateXPForLevel(newLevel);
    }

    const leveledUp = newLevel > profile.level;

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        totalXP: newTotalXP,
        level: newLevel,
        xpToNextLevel,
      },
    });

    // Create transaction record
    await prisma.xPTransaction.create({
      data: {
        userProfileId: profile.id,
        type: 'XP',
        amount,
        reason,
        matchId: context?.matchId,
        achievementId: context?.achievementId,
        challengeId: context?.challengeId,
      },
    });

    // Emit level up event
    if (leveledUp) {
      io.emit(`user-${userId}-level-up`, {
        userId,
        newLevel,
        rewards: {
          xp: amount,
        },
      });

      console.log(`🎉 User ${userId} leveled up to level ${newLevel}!`);
    }

    return {
      success: true,
      data: {
        profile: updatedProfile,
        leveledUp,
        xpAwarded: amount,
      },
    };
  }

  /**
   * Award points to a user
   */
  async awardPoints(
    userId: string,
    amount: number,
    reason: string,
    context?: { matchId?: string; achievementId?: string; challengeId?: string }
  ) {
    const profileResult = await this.getUserProfile(userId);
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        totalPoints: profile.totalPoints + amount,
      },
    });

    await prisma.xPTransaction.create({
      data: {
        userProfileId: profile.id,
        type: 'POINTS',
        amount,
        reason,
        matchId: context?.matchId,
        achievementId: context?.achievementId,
        challengeId: context?.challengeId,
      },
    });

    return { success: true, data: updatedProfile };
  }

  /**
   * Update login streak for a user
   */
  async updateLoginStreak(userId: string) {
    const profileResult = await this.getUserProfile(userId);
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    const now = new Date();
    const lastLogin = profile.lastLoginDate;

    let newStreak = profile.loginStreak;

    if (!lastLogin) {
      // First login
      newStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        newStreak++;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // daysDiff === 0 means already logged in today, keep streak
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        loginStreak: newStreak,
        lastLoginDate: now,
      },
    });

    // Award XP for login streak milestones
    if (newStreak % 7 === 0) {
      // Weekly streak
      await this.awardXP(userId, 50, `${newStreak} day login streak`);
    } else if (newStreak > 1) {
      // Daily streak
      await this.awardXP(userId, 10, 'Daily login');
    }

    return { success: true, data: updatedProfile };
  }

  /**
   * Calculate XP required for a level using exponential formula
   */
  calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Set current title for user
   */
  async setTitle(userId: string, title: string) {
    const profileResult = await this.getUserProfile(userId);
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    const unlockedTitles = JSON.parse(profile.unlockedTitles || '[]');

    if (!unlockedTitles.includes(title)) {
      throw new Error('Title not unlocked');
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        currentTitle: title,
      },
    });

    return { success: true, data: updatedProfile };
  }

  /**
   * Unlock a new title for user
   */
  async unlockTitle(userId: string, title: string) {
    const profileResult = await this.getUserProfile(userId);
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    const unlockedTitles = JSON.parse(profile.unlockedTitles || '[]');

    if (!unlockedTitles.includes(title)) {
      unlockedTitles.push(title);

      await prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          unlockedTitles: JSON.stringify(unlockedTitles),
        },
      });

      console.log(`🏆 User ${userId} unlocked title: ${title}`);
    }

    return { success: true, title };
  }

  /**
   * Get level leaderboard
   */
  async getLevelLeaderboard(limit: number = 50) {
    const profiles = await prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ level: 'desc' }, { totalXP: 'desc' }],
      take: limit,
    });

    return { success: true, data: profiles };
  }

  /**
   * Get XP leaderboard
   */
  async getXPLeaderboard(limit: number = 50) {
    const profiles = await prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { totalXP: 'desc' },
      take: limit,
    });

    return { success: true, data: profiles };
  }
}

export const rewardsService = new RewardsService();
