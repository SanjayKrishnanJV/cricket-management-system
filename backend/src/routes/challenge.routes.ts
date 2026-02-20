import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get active challenges (optionally filtered by target: PLAYER or USER)
router.get('/active', challengeController.getActiveChallenges);

// Get player progress
router.get('/player/:playerId/progress', challengeController.getPlayerProgress);

// Get user progress (authenticated)
router.get('/user/progress', authenticate, challengeController.getUserProgress);

// Claim reward for completed challenge (authenticated)
router.post('/progress/:progressId/claim', authenticate, challengeController.claimReward);

// Generate daily challenges (admin/cron)
router.post('/daily/generate', challengeController.generateDailyChallenges);

export default router;
