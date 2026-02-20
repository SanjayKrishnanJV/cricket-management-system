import { Router } from 'express';
import {
  generatePrediction,
  getPrediction,
  getAllPredictions,
  getPredictionAccuracy,
} from '../controllers/matchPrediction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all predictions
router.get('/', getAllPredictions);

// Get prediction accuracy stats
router.get('/accuracy', getPredictionAccuracy);

// Get prediction for specific match
router.get('/match/:matchId', getPrediction);

// Generate/update prediction for specific match (authenticated)
router.post('/match/:matchId/generate', authenticate, generatePrediction);

export default router;
