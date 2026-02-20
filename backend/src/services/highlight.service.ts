import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * User-Generated Highlights Service
 * Feature 3.4 - Let users mark and share their favorite moments
 */
export class HighlightService {
  /**
   * Create a highlight
   */
  async createHighlight(
    matchId: string,
    userId: string,
    title: string,
    category: string,
    description?: string,
    ballId?: string,
    tags?: string[]
  ) {
    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // If ballId provided, verify it exists
    if (ballId) {
      const ball = await prisma.ball.findUnique({
        where: { id: ballId },
      });

      if (!ball) {
        throw new AppError('Ball not found', 404);
      }
    }

    const highlight = await prisma.highlight.create({
      data: {
        matchId,
        userId,
        title,
        description,
        category,
        ballId,
        tags: tags
          ? {
              create: tags.map((tag) => ({
                tag,
              })),
            }
          : undefined,
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        ball: {
          include: {
            batsman: true,
            bowler: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });

    return {
      success: true,
      data: highlight,
      message: 'Highlight created successfully',
    };
  }

  /**
   * Get highlights for a match
   */
  async getMatchHighlights(matchId: string, category?: string) {
    const highlights = await prisma.highlight.findMany({
      where: {
        matchId,
        isPublic: true,
        ...(category && { category }),
      },
      include: {
        ball: {
          include: {
            batsman: true,
            bowler: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
      orderBy: [
        {
          viewCount: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return {
      success: true,
      data: highlights,
    };
  }

  /**
   * Get a single highlight by ID
   */
  async getHighlight(highlightId: string) {
    const highlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        ball: {
          include: {
            batsman: true,
            bowler: true,
            innings: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    // Increment view count
    await prisma.highlight.update({
      where: { id: highlightId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      data: highlight,
    };
  }

  /**
   * Get user's highlights
   */
  async getUserHighlights(userId: string) {
    const highlights = await prisma.highlight.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        ball: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: highlights,
    };
  }

  /**
   * Get trending highlights
   */
  async getTrendingHighlights(limit: number = 20) {
    const highlights = await prisma.highlight.findMany({
      where: {
        isPublic: true,
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        ball: {
          include: {
            batsman: true,
            bowler: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
      orderBy: [
        {
          shareCount: 'desc',
        },
        {
          viewCount: 'desc',
        },
      ],
      take: limit,
    });

    return {
      success: true,
      data: highlights,
    };
  }

  /**
   * Search highlights by tag
   */
  async searchByTag(tag: string) {
    const highlights = await prisma.highlight.findMany({
      where: {
        isPublic: true,
        tags: {
          some: {
            tag: {
              contains: tag,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        ball: {
          include: {
            batsman: true,
            bowler: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: highlights,
    };
  }

  /**
   * Increment share count for a highlight
   */
  async shareHighlight(highlightId: string) {
    const highlight = await prisma.highlight.update({
      where: { id: highlightId },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      data: highlight,
      message: 'Highlight shared',
    };
  }

  /**
   * Update highlight visibility
   */
  async toggleVisibility(highlightId: string, userId: string) {
    const highlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    if (highlight.userId !== userId) {
      throw new AppError('Not authorized to edit this highlight', 403);
    }

    const updated = await prisma.highlight.update({
      where: { id: highlightId },
      data: {
        isPublic: !highlight.isPublic,
      },
    });

    return {
      success: true,
      data: updated,
      message: updated.isPublic ? 'Highlight is now public' : 'Highlight is now private',
    };
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(highlightId: string, userId: string) {
    const highlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    if (highlight.userId !== userId) {
      throw new AppError('Not authorized to delete this highlight', 403);
    }

    await prisma.highlight.delete({
      where: { id: highlightId },
    });

    return {
      success: true,
      message: 'Highlight deleted',
    };
  }

  /**
   * Get highlight statistics
   */
  async getHighlightStats(matchId: string) {
    const stats = await prisma.highlight.groupBy({
      by: ['category'],
      where: { matchId },
      _count: {
        id: true,
      },
      _sum: {
        viewCount: true,
        shareCount: true,
      },
    });

    const totalHighlights = stats.reduce((sum, s) => sum + s._count.id, 0);
    const totalViews = stats.reduce((sum, s) => sum + (s._sum.viewCount || 0), 0);
    const totalShares = stats.reduce((sum, s) => sum + (s._sum.shareCount || 0), 0);

    return {
      success: true,
      data: {
        totalHighlights,
        totalViews,
        totalShares,
        byCategory: stats.map((s) => ({
          category: s.category,
          count: s._count.id,
          views: s._sum.viewCount || 0,
          shares: s._sum.shareCount || 0,
        })),
      },
    };
  }
}

export const highlightService = new HighlightService();
