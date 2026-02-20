import { Router } from 'express';
import * as achievementController from '../controllers/achievement.controller';

const router = Router();

// Get all available achievements
router.get('/', achievementController.getAllAchievements);

// Get achievements for a specific player
router.get('/player/:playerId', achievementController.getPlayerAchievements);

// Get achievement statistics for a player
router.get('/player/:playerId/stats', achievementController.getPlayerAchievementStats);

// Seed predefined achievements (should be admin-only in production)
router.post('/seed', achievementController.seedAchievements);

export default router;
