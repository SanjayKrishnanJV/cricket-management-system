"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const player_controller_1 = require("../controllers/player.controller");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const cache_middleware_1 = require("../middleware/cache.middleware");
const cache_service_1 = require("../services/cache.service");
const router = (0, express_1.Router)();
const controller = new player_controller_1.PlayerController();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, validator_1.validate)(validator_1.schemas.createPlayer), controller.createPlayer);
router.get('/', (0, cache_middleware_1.cacheMiddleware)(300), controller.getAllPlayers);
router.get('/:id', (0, cache_middleware_1.cacheMiddleware)(300, cache_middleware_1.cacheKeyGenerators.playerStats), controller.getPlayerById);
router.get('/:id/analytics', (0, cache_middleware_1.cacheMiddleware)(300, (req) => `player:${req.params.id}:analytics`), controller.getPlayerAnalytics);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidatePlayer(req.params.id);
}), controller.updatePlayer);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidatePlayer(req.params.id);
}), controller.deletePlayer);
exports.default = router;
//# sourceMappingURL=player.routes.js.map