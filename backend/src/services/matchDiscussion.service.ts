import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Match Discussion Forums Service
 * Feature 3.3 - Real-time chat and discussion during matches
 */
export class MatchDiscussionService {
  /**
   * Post a comment on a match
   */
  async postComment(matchId: string, userId: string, message: string, replyToId?: string) {
    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // If replying, verify parent comment exists
    if (replyToId) {
      const parentComment = await prisma.matchComment.findUnique({
        where: { id: replyToId },
      });

      if (!parentComment) {
        throw new AppError('Parent comment not found', 404);
      }

      if (parentComment.matchId !== matchId) {
        throw new AppError('Parent comment is from a different match', 400);
      }
    }

    const comment = await prisma.matchComment.create({
      data: {
        matchId,
        userId,
        message,
        replyToId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
      },
    });

    return {
      success: true,
      data: comment,
    };
  }

  /**
   * Get comments for a match
   */
  async getMatchComments(matchId: string, limit: number = 100, offset: number = 0) {
    const comments = await prisma.matchComment.findMany({
      where: {
        matchId,
        replyToId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            reactions: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        {
          isPinned: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      skip: offset,
      take: limit,
    });

    const totalComments = await prisma.matchComment.count({
      where: {
        matchId,
        replyToId: null,
      },
    });

    return {
      success: true,
      data: {
        comments,
        total: totalComments,
        hasMore: offset + limit < totalComments,
      },
    };
  }

  /**
   * Add emoji reaction to a comment
   */
  async addReaction(commentId: string, userId: string, emoji: string) {
    // Check if reaction already exists
    const existing = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      // Remove reaction (toggle)
      await prisma.commentReaction.delete({
        where: { id: existing.id },
      });

      return {
        success: true,
        action: 'removed',
        message: 'Reaction removed',
      };
    }

    // Add new reaction
    const reaction = await prisma.commentReaction.create({
      data: {
        commentId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      action: 'added',
      data: reaction,
    };
  }

  /**
   * Update karma for a comment (upvote/downvote)
   */
  async updateKarma(commentId: string, action: 'upvote' | 'downvote') {
    const increment = action === 'upvote' ? 1 : -1;

    const comment = await prisma.matchComment.update({
      where: { id: commentId },
      data: {
        karma: {
          increment,
        },
      },
    });

    return {
      success: true,
      data: comment,
    };
  }

  /**
   * Pin/unpin a comment (admin only)
   */
  async togglePin(commentId: string) {
    const comment = await prisma.matchComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const updated = await prisma.matchComment.update({
      where: { id: commentId },
      data: {
        isPinned: !comment.isPinned,
      },
    });

    return {
      success: true,
      data: updated,
      message: updated.isPinned ? 'Comment pinned' : 'Comment unpinned',
    };
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.matchComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.userId !== userId) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    // Delete comment and all replies
    await prisma.matchComment.delete({
      where: { id: commentId },
    });

    return {
      success: true,
      message: 'Comment deleted',
    };
  }

  /**
   * Get top comments by karma
   */
  async getTopComments(matchId: string, limit: number = 10) {
    const comments = await prisma.matchComment.findMany({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reactions: true,
      },
      orderBy: {
        karma: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: comments,
    };
  }
}

export const matchDiscussionService = new MatchDiscussionService();
