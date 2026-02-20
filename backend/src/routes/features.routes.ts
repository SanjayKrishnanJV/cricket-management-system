import { Router } from 'express';
import { FeaturesController } from '../controllers/features.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new FeaturesController();

// Player Milestones
router.get('/players/:playerId/milestones', controller.getPlayerMilestones);

// Tournament Awards (Orange Cap, Purple Cap, etc.)
router.get('/tournaments/:tournamentId/awards', controller.getTournamentAwards);

// Player Comparison
router.get('/players/compare', controller.comparePlayers);

// Head-to-Head Records
router.get('/teams/head-to-head', controller.getHeadToHead);

// Venue Statistics
router.get('/venues/:venue/statistics', controller.getVenueStatistics);

// Match Prediction
router.get('/matches/:matchId/prediction', controller.predictMatchOutcome);

// Fantasy Points
router.get('/matches/:matchId/fantasy-points', controller.calculateFantasyPoints);

export default router;
