import { Request, Response, NextFunction } from 'express';
import { broadcastService } from '../services/broadcast.service';

/**
 * Broadcasting & Media Controller
 * Handles REST endpoints for Video Highlights, Live Streaming, Podcasts, and Broadcaster Dashboard
 */
export class BroadcastController {
  // ===== VIDEO HIGHLIGHTS =====

  async createVideoHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const highlight = await broadcastService.createVideoHighlight({
        matchId: req.params.matchId,
        ...req.body,
      });
      res.status(201).json({ status: 'success', data: highlight });
    } catch (error) {
      next(error);
    }
  }

  async getVideoHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const highlights = await broadcastService.getVideoHighlights(
        req.params.matchId,
        req.query as any
      );
      res.json({ status: 'success', data: highlights });
    } catch (error) {
      next(error);
    }
  }

  async linkBallToVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId, timestamp } = req.body;
      const result = await broadcastService.linkBallToVideo(
        req.params.ballId,
        videoId,
        timestamp
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async autoGenerateHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await broadcastService.autoGenerateHighlights(req.params.matchId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  // ===== LIVE STREAMING =====

  async setupLiveStream(req: Request, res: Response, next: NextFunction) {
    try {
      const stream = await broadcastService.setupLiveStream(req.params.matchId, req.body);
      res.status(201).json({ status: 'success', data: stream });
    } catch (error) {
      next(error);
    }
  }

  async updateStreamStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const stream = await broadcastService.updateStreamStatus(req.params.matchId, status);
      res.json({ status: 'success', data: stream });
    } catch (error) {
      next(error);
    }
  }

  async getStreamInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const stream = await broadcastService.getStreamInfo(req.params.matchId);
      if (!stream) {
        return res.status(404).json({ status: 'error', message: 'Live stream not found' });
      }
      res.json({ status: 'success', data: stream });
    } catch (error) {
      next(error);
    }
  }

  async updateStreamAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { viewers } = req.body;
      const stream = await broadcastService.updateStreamAnalytics(req.params.matchId, viewers);
      res.json({ status: 'success', data: stream });
    } catch (error) {
      next(error);
    }
  }

  // ===== PODCASTS =====

  async generatePodcast(req: Request, res: Response, next: NextFunction) {
    try {
      const podcast = await broadcastService.generateMatchPodcast(req.params.matchId, req.body);
      res.status(201).json({ status: 'success', data: podcast });
    } catch (error) {
      next(error);
    }
  }

  async getPodcastStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const podcast = await broadcastService.getPodcastStatus(req.params.podcastId);
      if (!podcast) {
        return res.status(404).json({ status: 'error', message: 'Podcast not found' });
      }
      res.json({ status: 'success', data: podcast });
    } catch (error) {
      next(error);
    }
  }

  async publishPodcast(req: Request, res: Response, next: NextFunction) {
    try {
      const podcast = await broadcastService.publishPodcast(req.params.podcastId);
      res.json({ status: 'success', data: podcast });
    } catch (error) {
      next(error);
    }
  }

  async getMatchPodcasts(req: Request, res: Response, next: NextFunction) {
    try {
      const podcasts = await broadcastService.getMatchPodcasts(req.params.matchId);
      res.json({ status: 'success', data: podcasts });
    } catch (error) {
      next(error);
    }
  }

  // ===== BROADCASTER DASHBOARD =====

  async getBroadcasterSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await broadcastService.getBroadcasterSettings(req.params.matchId);
      res.json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  }

  async updateBroadcasterSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await broadcastService.updateBroadcasterSettings(
        req.params.matchId,
        req.body
      );
      res.json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  }

  async getTalkingPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const points = await broadcastService.getTalkingPoints(req.params.matchId);
      res.json({ status: 'success', data: points });
    } catch (error) {
      next(error);
    }
  }

  async generateTalkingPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { overNumber } = req.body;
      const points = await broadcastService.generateTalkingPoints(
        req.params.matchId,
        overNumber
      );
      res.json({ status: 'success', data: points });
    } catch (error) {
      next(error);
    }
  }

  async markTalkingPointUsed(req: Request, res: Response, next: NextFunction) {
    try {
      const point = await broadcastService.markTalkingPointUsed(req.params.pointId);
      res.json({ status: 'success', data: point });
    } catch (error) {
      next(error);
    }
  }
}

export const broadcastController = new BroadcastController();
