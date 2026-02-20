import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { cacheMiddleware, invalidateCacheMiddleware, cacheKeyGenerators } from '../middleware/cache.middleware';
import { cacheService } from '../services/cache.service';

const router = Router();
const controller = new MatchController();

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  validate(schemas.createMatch),
  controller.createMatch
);

// GET endpoints with caching
router.get('/', cacheMiddleware(60), controller.getAllMatches);
router.get('/live/all', cacheMiddleware(5, cacheKeyGenerators.allLiveMatches), controller.getAllLiveMatches);
router.get('/:id', cacheMiddleware(300, cacheKeyGenerators.match), controller.getMatchById);
router.get('/:id/live', cacheMiddleware(10, cacheKeyGenerators.liveMatch), controller.getLiveScore);
router.get('/:id/scorecard/pdf', cacheMiddleware(3600, (req) => `pdf:scorecard:${req.params.id}`), controller.exportScorecardPDF);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  validate(schemas.createMatch),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.updateMatch
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.deleteMatch
);

router.post(
  '/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.cancelMatch
);

router.post(
  '/:id/toss',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'),
  validate(schemas.recordToss),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.recordToss
);

router.post(
  '/:id/innings',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.startInnings
);

router.post(
  '/:id/ball',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'),
  validate(schemas.recordBall),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.recordBall
);

router.post(
  '/:id/complete-innings',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.completeInnings
);

router.post(
  '/:id/complete',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidateMatch(req.params.id);
  }),
  controller.completeMatch
);

export default router;
