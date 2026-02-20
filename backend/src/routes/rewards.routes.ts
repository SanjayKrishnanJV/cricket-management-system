import { Router } from 'express';
import * as rewardsController from '../controllers/rewards.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user profile with XP/level (public)
router.get('/profile/:userId', rewardsController.getUserProfile);

// Update login streak (authenticated)
router.post('/streak', authenticate, rewardsController.updateLoginStreak);

// Set current title (authenticated)
router.post('/title', authenticate, rewardsController.setTitle);

// Get level leaderboard
router.get('/leaderboard/levels', rewardsController.getLevelLeaderboard);

// Get XP leaderboard
router.get('/leaderboard/xp', rewardsController.getXPLeaderboard);

export default router;
