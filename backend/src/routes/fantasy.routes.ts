import { Router } from 'express';
import * as fantasyController from '../controllers/fantasy.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create fantasy league (authenticated)
router.post('/leagues', authenticate, fantasyController.createLeague);

// Join league with code (authenticated)
router.post('/leagues/join', authenticate, fantasyController.joinLeague);

// Get league leaderboard
router.get('/leagues/:leagueId/leaderboard', fantasyController.getLeagueLeaderboard);

// Create fantasy team (authenticated)
router.post('/teams', authenticate, fantasyController.createTeam);

// Get team details
router.get('/teams/:teamId', fantasyController.getTeamDetails);

// Get player values for tournament
router.get('/values/:tournamentId', fantasyController.getPlayerValues);

// Initialize player values for tournament (admin)
router.post('/values/:tournamentId/initialize', fantasyController.initializePlayerValues);

// Calculate match points (admin/cron)
router.post('/matches/:matchId/calculate', fantasyController.calculateMatchPoints);

export default router;
