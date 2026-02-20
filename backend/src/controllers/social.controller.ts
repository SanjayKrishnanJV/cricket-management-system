import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { socialService } from '../services/social.service';
import { fanClubService } from '../services/fanClub.service';
import { matchDiscussionService } from '../services/matchDiscussion.service';
import { highlightService } from '../services/highlight.service';

/**
 * Social Media Integration Controllers
 */
export class SocialController {
  // Social Media Sharing
  async generateShareImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const { type } = req.body;
      const userId = req.user!.id;

      const result = await socialService.generateShareImage(matchId, userId, type);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsShared(req: Request, res: Response, next: NextFunction) {
    try {
      const { shareImageId } = req.params;
      const { platform } = req.body;

      const result = await socialService.markAsShared(shareImageId, platform);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getShareHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await socialService.getShareHistory(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMatchShareStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;

      const result = await socialService.getMatchShareStats(matchId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Fan Clubs
  async createFanClub(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId, name, description, badge } = req.body;

      const result = await fanClubService.createFanClub(playerId, name, description, badge);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async joinFanClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fanClubId } = req.params;
      const userId = req.user!.id;

      const result = await fanClubService.joinFanClub(userId, fanClubId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async leaveFanClub(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fanClubId } = req.params;
      const userId = req.user!.id;

      const result = await fanClubService.leaveFanClub(userId, fanClubId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getFanClubByPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.params;

      const result = await fanClubService.getFanClubByPlayer(playerId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllFanClubs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await fanClubService.getAllFanClubs();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const result = await fanClubService.getUserMemberships(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getFanClubLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { fanClubId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await fanClubService.getFanClubLeaderboard(fanClubId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Match Discussion
  async postComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const { message, replyToId } = req.body;
      const userId = req.user!.id;

      const result = await matchDiscussionService.postComment(matchId, userId, message, replyToId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMatchComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await matchDiscussionService.getMatchComments(matchId, limit, offset);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const { emoji } = req.body;
      const userId = req.user!.id;

      const result = await matchDiscussionService.addReaction(commentId, userId, emoji);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateKarma(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const { action } = req.body;

      const result = await matchDiscussionService.updateKarma(commentId, action);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async togglePin(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;

      const result = await matchDiscussionService.togglePin(commentId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const userId = req.user!.id;

      const result = await matchDiscussionService.deleteComment(commentId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTopComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await matchDiscussionService.getTopComments(matchId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Highlights
  async createHighlight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const { title, description, category, ballId, tags } = req.body;
      const userId = req.user!.id;

      const result = await highlightService.createHighlight(
        matchId,
        userId,
        title,
        category,
        description,
        ballId,
        tags
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMatchHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const category = req.query.category as string;

      const result = await highlightService.getMatchHighlights(matchId, category);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const { highlightId } = req.params;

      const result = await highlightService.getHighlight(highlightId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const result = await highlightService.getUserHighlights(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTrendingHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await highlightService.getTrendingHighlights(limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchByTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { tag } = req.query;

      const result = await highlightService.searchByTag(tag as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async shareHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const { highlightId } = req.params;

      const result = await highlightService.shareHighlight(highlightId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleVisibility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { highlightId } = req.params;
      const userId = req.user!.id;

      const result = await highlightService.toggleVisibility(highlightId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteHighlight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { highlightId } = req.params;
      const userId = req.user!.id;

      const result = await highlightService.deleteHighlight(highlightId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHighlightStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;

      const result = await highlightService.getHighlightStats(matchId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const socialController = new SocialController();
