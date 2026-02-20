import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Social Media Integration Service
 * Feature 3.1 - Share scorecard, highlights, and milestones on social media
 */
export class SocialService {
  /**
   * Generate shareable scorecard data
   */
  async generateShareImage(matchId: string, userId: string, type: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        innings: {
          include: {
            battingPerformances: {
              include: {
                player: true,
              },
            },
            bowlingPerformances: {
              include: {
                player: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Generate title based on type
    let title = '';
    const imageData: any = {};

    switch (type) {
      case 'scorecard':
        title = `${match.homeTeam.name} vs ${match.awayTeam.name} Scorecard`;
        imageData.type = 'scorecard';
        imageData.homeTeam = match.homeTeam.name;
        imageData.awayTeam = match.awayTeam.name;
        imageData.innings = match.innings.map((inning) => ({
          totalRuns: inning.totalRuns,
          totalWickets: inning.totalWickets,
          totalOvers: inning.totalOvers,
        }));
        break;

      case 'milestone':
        title = `Milestone achieved in ${match.homeTeam.name} vs ${match.awayTeam.name}`;
        imageData.type = 'milestone';
        break;

      case 'summary':
        title = match.resultText || `${match.homeTeam.name} vs ${match.awayTeam.name}`;
        imageData.type = 'summary';
        imageData.result = match.resultText;
        imageData.manOfMatch = match.manOfMatch;
        break;

      case 'highlight':
        title = `Highlight from ${match.homeTeam.name} vs ${match.awayTeam.name}`;
        imageData.type = 'highlight';
        break;

      default:
        title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    }

    // Save share image record
    const shareImage = await prisma.shareImage.create({
      data: {
        matchId,
        userId,
        type,
        title,
        imageData: JSON.stringify(imageData),
        shared: false,
      },
    });

    return {
      success: true,
      data: {
        ...shareImage,
        imageData: imageData,
      },
    };
  }

  /**
   * Mark image as shared on a platform
   */
  async markAsShared(shareImageId: string, platform: string) {
    const shareImage = await prisma.shareImage.update({
      where: { id: shareImageId },
      data: {
        shared: true,
        platform,
      },
    });

    return {
      success: true,
      data: shareImage,
    };
  }

  /**
   * Get share history for a user
   */
  async getShareHistory(userId: string, limit: number = 20) {
    const shareImages = await prisma.shareImage.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: shareImages,
    };
  }

  /**
   * Get share statistics for a match
   */
  async getMatchShareStats(matchId: string) {
    const shares = await prisma.shareImage.groupBy({
      by: ['platform'],
      where: {
        matchId,
        shared: true,
      },
      _count: {
        id: true,
      },
    });

    const totalShares = shares.reduce((sum, s) => sum + s._count.id, 0);

    return {
      success: true,
      data: {
        totalShares,
        byPlatform: shares.map((s) => ({
          platform: s.platform,
          count: s._count.id,
        })),
      },
    };
  }
}

export const socialService = new SocialService();
