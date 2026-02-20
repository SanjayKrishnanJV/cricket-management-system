import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';
import { cacheMiddleware, invalidateCacheMiddleware, cacheKeyGenerators } from '../middleware/cache.middleware';
import { cacheService } from '../services/cache.service';

const router = Router();
const controller = new PlayerController();

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  validate(schemas.createPlayer),
  controller.createPlayer
);

// GET endpoints with caching
router.get('/', cacheMiddleware(300), controller.getAllPlayers);
router.get('/:id', cacheMiddleware(300, cacheKeyGenerators.playerStats), controller.getPlayerById);
router.get('/:id/analytics', cacheMiddleware(300, (req) => `player:${req.params.id}:analytics`), controller.getPlayerAnalytics);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidatePlayer(req.params.id);
  }),
  controller.updatePlayer
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  invalidateCacheMiddleware(async (req) => {
    await cacheService.invalidatePlayer(req.params.id);
  }),
  controller.deletePlayer
);

export default router;
