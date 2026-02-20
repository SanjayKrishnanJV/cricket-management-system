import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { VisualizationController } from '../controllers/visualization.controller';

const router = Router();
const controller = new AnalyticsController();
const visualizationController = new VisualizationController();

router.get('/match/:matchId', controller.getMatchAnalytics);
router.get('/player/:playerId', controller.getPlayerAnalytics);
router.get('/team/:teamId', controller.getTeamAnalytics);
router.get('/tournament/:tournamentId', controller.getTournamentAnalytics);

// Advanced Match Analytics
router.get('/match/:matchId/manhattan', controller.getManhattanChart);
router.get('/match/:matchId/worm', controller.getWormChart);
router.get('/match/:matchId/partnerships', controller.getPartnershipAnalysis);
router.get('/match/:matchId/phases', controller.getPhaseAnalysis);

// Visualization Routes
router.get('/matches/:matchId/wagon-wheel', visualizationController.getWagonWheel);
router.get('/matches/:matchId/pitch-map', visualizationController.getPitchMap);
router.get('/matches/:matchId/field-placements', visualizationController.getFieldPlacements);
router.post('/matches/:matchId/field-placements', visualizationController.saveFieldPlacement);
router.get('/matches/:matchId/3d-replay', visualizationController.get3DReplayData);

export default router;
