import { Request, Response, NextFunction } from 'express';
import { challengeService } from '../services/challenge.service';
import { AppError } from '../middleware/errorHandler';

export const getActiveChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { target } = req.query;

    const result = await challengeService.getActiveChallenges((target as string) || 'PLAYER');

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlayerProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      throw new AppError('Player ID is required', 400);
    }

    const result = await challengeService.getPlayerProgress(playerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || req.params.userId;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const result = await challengeService.getUserProgress(userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const claimReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { progressId } = req.params;

    if (!progressId) {
      throw new AppError('Progress ID is required', 400);
    }

    const result = await challengeService.claimReward(progressId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const generateDailyChallenges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await challengeService.generateDailyChallenges();

    res.json(result);
  } catch (error) {
    next(error);
  }
};
