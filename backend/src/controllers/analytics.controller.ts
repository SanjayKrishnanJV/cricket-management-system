import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getMatchAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getMatchAnalytics(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlayerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getPlayerAnalytics(req.params.playerId);
      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getTeamAnalytics(req.params.teamId);
      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTournamentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getTournamentAnalytics(req.params.tournamentId);
      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getManhattanChart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getManhattanChart(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWormChart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getWormChart(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPartnershipAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getPartnershipAnalysis(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPhaseAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getPhaseAnalysis(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
