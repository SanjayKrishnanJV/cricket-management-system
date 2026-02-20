import { Request, Response, NextFunction } from 'express';
import { achievementService } from '../services/achievement.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Get all available achievements
 */
export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await achievementService.getAllAchievements();

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get achievements for a specific player
 */
export const getPlayerAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      throw new AppError('Player ID is required', 400);
    }

    const result = await achievementService.getPlayerAchievements(playerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get achievement statistics for a player
 */
export const getPlayerAchievementStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      throw new AppError('Player ID is required', 400);
    }

    const result = await achievementService.getPlayerAchievementStats(playerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Seed predefined achievements (Admin only)
 */
export const seedAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await achievementService.seedAchievements();

    res.json(result);
  } catch (error) {
    next(error);
  }
};
