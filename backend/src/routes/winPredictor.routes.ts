import { Router } from 'express';
import { winPredictorController } from '../controllers/winPredictor.controller';

const router = Router();

// Calculate win probability for a ball
router.post('/matches/:matchId/win-probability', winPredictorController.calculateProbability);

// Get win probability history for a match
router.get('/matches/:matchId/win-probability/history', winPredictorController.getProbabilityHistory);

// Get latest win probability for a match
router.get('/matches/:matchId/win-probability/latest', winPredictorController.getLatestProbability);

export default router;
