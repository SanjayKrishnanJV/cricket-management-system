import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller';

const router = Router();

// Get leaderboard by type (RUNS_ALL_TIME, WICKETS_ALL_TIME, STRIKE_RATE, ECONOMY_RATE)
router.get('/:type', leaderboardController.getLeaderboard);

// Get player rank in a specific leaderboard
router.get('/player/:playerId/rank/:type', leaderboardController.getPlayerRank);

// Recalculate all leaderboards (admin/cron)
router.post('/recalculate', leaderboardController.recalculateLeaderboards);

export default router;
