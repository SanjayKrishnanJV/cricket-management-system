import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Player Fan Clubs Service
 * Feature 3.2 - Create fan clubs for popular players
 */
export class FanClubService {
  /**
   * Create a fan club for a player
   */
  async createFanClub(playerId: string, name: string, description?: string, badge?: string) {
    // Check if fan club already exists
    const existing = await prisma.fanClub.findUnique({
      where: { playerId },
    });

    if (existing) {
      throw new AppError('Fan club already exists for this player', 400);
    }

    // Verify player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    const fanClub = await prisma.fanClub.create({
      data: {
        playerId,
        name,
        description,
        badge,
      },
      include: {
        player: true,
      },
    });

    return {
      success: true,
      data: fanClub,
    };
  }

  /**
   * Join a fan club
   */
  async joinFanClub(userId: string, fanClubId: string) {
    // Check if already a member
    const existing = await prisma.fanClubMember.findUnique({
      where: {
        userId_fanClubId: {
          userId,
          fanClubId,
        },
      },
    });

    if (existing) {
      throw new AppError('Already a member of this fan club', 400);
    }

    // Add member and increment count
    const [member] = await prisma.$transaction([
      prisma.fanClubMember.create({
        data: {
          userId,
          fanClubId,
        },
        include: {
          fanClub: {
            include: {
              player: true,
            },
          },
        },
      }),
      prisma.fanClub.update({
        where: { id: fanClubId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return {
      success: true,
      data: member,
      message: `Joined ${member.fanClub.name} successfully!`,
    };
  }

  /**
   * Leave a fan club
   */
  async leaveFanClub(userId: string, fanClubId: string) {
    const member = await prisma.fanClubMember.findUnique({
      where: {
        userId_fanClubId: {
          userId,
          fanClubId,
        },
      },
    });

    if (!member) {
      throw new AppError('Not a member of this fan club', 400);
    }

    await prisma.$transaction([
      prisma.fanClubMember.delete({
        where: {
          userId_fanClubId: {
            userId,
            fanClubId,
          },
        },
      }),
      prisma.fanClub.update({
        where: { id: fanClubId },
        data: {
          memberCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Left fan club successfully',
    };
  }

  /**
   * Get fan club by player ID
   */
  async getFanClubByPlayer(playerId: string) {
    const fanClub = await prisma.fanClub.findUnique({
      where: { playerId },
      include: {
        player: true,
        members: {
          take: 10, // Top 10 members
          orderBy: {
            points: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: fanClub,
    };
  }

  /**
   * Get all fan clubs with member counts
   */
  async getAllFanClubs() {
    const fanClubs = await prisma.fanClub.findMany({
      include: {
        player: true,
      },
      orderBy: {
        memberCount: 'desc',
      },
    });

    return {
      success: true,
      data: fanClubs,
    };
  }

  /**
   * Get user's fan club memberships
   */
  async getUserMemberships(userId: string) {
    const memberships = await prisma.fanClubMember.findMany({
      where: { userId },
      include: {
        fanClub: {
          include: {
            player: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return {
      success: true,
      data: memberships,
    };
  }

  /**
   * Get fan club leaderboard
   */
  async getFanClubLeaderboard(fanClubId: string, limit: number = 50) {
    const members = await prisma.fanClubMember.findMany({
      where: { fanClubId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
      take: limit,
    });

    // Calculate ranks
    const leaderboard = members.map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

    return {
      success: true,
      data: leaderboard,
    };
  }

  /**
   * Add points to a fan club member (for activities)
   */
  async addMemberPoints(userId: string, fanClubId: string, points: number) {
    const member = await prisma.fanClubMember.update({
      where: {
        userId_fanClubId: {
          userId,
          fanClubId,
        },
      },
      data: {
        points: {
          increment: points,
        },
      },
    });

    return {
      success: true,
      data: member,
    };
  }
}

export const fanClubService = new FanClubService();
