import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export class VisualizationController {
  async getWagonWheel(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const filters = {
        batsmanId: req.query.batsmanId as string,
        bowlerId: req.query.bowlerId as string,
        inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber as string) : undefined,
        minRuns: req.query.minRuns ? parseInt(req.query.minRuns as string) : undefined,
      };

      const data = await analyticsService.getWagonWheel(matchId, filters);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPitchMap(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const filters = {
        bowlerId: req.query.bowlerId as string,
        batsmanId: req.query.batsmanId as string,
        inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber as string) : undefined,
      };

      const data = await analyticsService.getPitchMap(matchId, filters);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFieldPlacements(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const overNumber = req.query.overNumber ? parseInt(req.query.overNumber as string) : undefined;

      const data = await analyticsService.getFieldPlacements(matchId, overNumber);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveFieldPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const { inningsId, overNumber, ballNumber, positions } = req.body;

      const data = await analyticsService.saveFieldPlacement({
        matchId,
        inningsId,
        overNumber,
        ballNumber,
        positions,
      });

      res.status(201).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async get3DReplayData(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const filters = {
        overNumber: req.query.overNumber ? parseInt(req.query.overNumber as string) : undefined,
        ballNumber: req.query.ballNumber ? parseInt(req.query.ballNumber as string) : undefined,
        inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber as string) : undefined,
      };

      const data = await analyticsService.get3DReplayData(matchId, filters);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VisualizationController();
