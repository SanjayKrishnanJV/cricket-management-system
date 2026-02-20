import { Request, Response, NextFunction } from 'express';
import { PlayerService } from '../services/player.service';

const playerService = new PlayerService();

export class PlayerController {
  async createPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const player = await playerService.createPlayer(req.body);
      res.status(201).json({
        status: 'success',
        data: player,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as string,
        nationality: req.query.nationality as string,
        available: req.query.available === 'true',
      };
      const players = await playerService.getAllPlayers(filters);
      res.status(200).json({
        status: 'success',
        data: players,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlayerById(req: Request, res: Response, next: NextFunction) {
    try {
      const player = await playerService.getPlayerById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: player,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const player = await playerService.updatePlayer(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: player,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePlayer(req: Request, res: Response, next: NextFunction) {
    try {
      await playerService.deletePlayer(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Player deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlayerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await playerService.getPlayerAnalytics(req.params.id);
      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
