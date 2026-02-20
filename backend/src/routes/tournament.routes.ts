import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { cacheMiddleware, invalidateCacheMiddleware, cacheKeyGenerators } from '../middleware/cache.middleware';
import { cacheService } from '../services/cache.service';

const router = Router();
const controller = new TournamentController();

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  validate(schemas.createTournament),
  controller.createTournament
);

// GET endpoints with caching
router.get('/', cacheMiddleware(300), controller.getAllTournaments);
router.get('/:id', cacheMiddleware(300, (req) => `tournament:${req.params.id}:details`), controller.getTournamentById);
router.get('/:id/points-table', cacheMiddleware(120, cacheKeyGenerators.tournamentStandings), controller.getPointsTable);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  validate(schemas.createTournament),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.updateTournament
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.deleteTournament
);

router.post(
  '/:id/teams',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.addTeamToTournament
);

router.post(
  '/:id/generate-fixtures',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.generateFixtures
);

// New scheduling routes
router.post(
  '/:id/schedule-matches',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.scheduleMatches
);

router.post(
  '/:id/schedule-playoffs',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateTournament(req.params.id);
  }),
  controller.schedulePlayoffs
);

router.get('/:id/standings', cacheMiddleware(120, cacheKeyGenerators.tournamentStandings), controller.getStandings);

export default router;
