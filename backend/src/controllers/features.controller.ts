import { Request, Response, NextFunction } from 'express';
import { FeaturesService } from '../services/features.service';

const featuresService = new FeaturesService();

export class FeaturesController {
  async getPlayerMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      const milestones = await featuresService.getPlayerMilestones(req.params.playerId);
      res.status(200).json({
        status: 'success',
        data: milestones,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTournamentAwards(req: Request, res: Response, next: NextFunction) {
    try {
      const awards = await featuresService.getTournamentAwards(req.params.tournamentId);
      res.status(200).json({
        status: 'success',
        data: awards,
      });
    } catch (error) {
      next(error);
    }
  }

  async comparePlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const { player1Id, player2Id } = req.query;
      const comparison = await featuresService.comparePlayers(
        player1Id as string,
        player2Id as string
      );
      res.status(200).json({
        status: 'success',
        data: comparison,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeadToHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { team1Id, team2Id } = req.query;
      const headToHead = await featuresService.getHeadToHead(
        team1Id as string,
        team2Id as string
      );
      res.status(200).json({
        status: 'success',
        data: headToHead,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVenueStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { venue } = req.params;
      const stats = await featuresService.getVenueStatistics(venue);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async predictMatchOutcome(req: Request, res: Response, next: NextFunction) {
    try {
      const prediction = await featuresService.predictMatchOutcome(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateFantasyPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const fantasyPoints = await featuresService.calculateFantasyPoints(req.params.matchId);
      res.status(200).json({
        status: 'success',
        data: fantasyPoints,
      });
    } catch (error) {
      next(error);
    }
  }
}
