import { Request, Response } from 'express';
import { winPredictorService } from '../services/winPredictor.service';

export class WinPredictorController {
  /**
   * Calculate and save win probability for current ball
   */
  async calculateProbability(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { inningsId, overNumber, ballNumber } = req.body;

      if (!inningsId || overNumber === undefined || ballNumber === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: inningsId, overNumber, ballNumber',
        });
      }

      const result = await winPredictorService.calculateWinProbability(
        matchId,
        inningsId,
        overNumber,
        ballNumber
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in calculateProbability:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get win probability history for a match
   */
  async getProbabilityHistory(req: Request, res: Response) {
    try {
      const { matchId } = req.params;

      const result = await winPredictorService.getWinProbabilityHistory(matchId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getProbabilityHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get latest win probability for a match
   */
  async getLatestProbability(req: Request, res: Response) {
    try {
      const { matchId } = req.params;

      const result = await winPredictorService.getLatestWinProbability(matchId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getLatestProbability:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const winPredictorController = new WinPredictorController();
