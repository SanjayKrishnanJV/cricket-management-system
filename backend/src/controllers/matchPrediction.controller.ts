import { Request, Response, NextFunction } from 'express';
import matchPredictionService from '../services/matchPrediction.service';

/**
 * Generate match prediction
 */
export const generatePrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;

    const prediction = await matchPredictionService.generatePrediction(matchId);

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prediction for a match
 */
export const getPrediction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;

    const prediction = await matchPredictionService.getPrediction(matchId);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'No prediction found for this match',
      });
    }

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all predictions
 */
export const getAllPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const predictions = await matchPredictionService.getAllPredictions();

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get prediction accuracy stats
 */
export const getPredictionAccuracy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await matchPredictionService.getPredictionAccuracy();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
