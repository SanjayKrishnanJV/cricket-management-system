import { Request, Response, NextFunction } from 'express';
import { rewardsService } from '../services/rewards.service';
import { AppError } from '../middleware/errorHandler';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || req.params.userId;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const result = await rewardsService.getUserProfile(userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateLoginStreak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const result = await rewardsService.updateLoginStreak(userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setTitle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { title } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!title) {
      throw new AppError('Title is required', 400);
    }

    const result = await rewardsService.setTitle(userId, title);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLevelLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;

    const result = await rewardsService.getLevelLeaderboard(
      limit ? parseInt(limit as string) : 50
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getXPLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;

    const result = await rewardsService.getXPLeaderboard(
      limit ? parseInt(limit as string) : 50
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};
