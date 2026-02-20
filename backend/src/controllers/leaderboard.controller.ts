import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { AppError } from '../middleware/errorHandler';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const { period, tournamentId, limit } = req.query;

    const result = await leaderboardService.getLeaderboard(
      type,
      (period as string) || 'ALL_TIME',
      tournamentId as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlayerRank = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId, type } = req.params;
    const { tournamentId } = req.query;

    const result = await leaderboardService.getPlayerRank(
      playerId,
      type,
      tournamentId as string
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const recalculateLeaderboards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await leaderboardService.recalculateLeaderboards();

    res.json(result);
  } catch (error) {
    next(error);
  }
};
