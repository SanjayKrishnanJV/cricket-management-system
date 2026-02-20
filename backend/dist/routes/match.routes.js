"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const match_controller_1 = require("../controllers/match.controller");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const cache_middleware_1 = require("../middleware/cache.middleware");
const cache_service_1 = require("../services/cache.service");
const router = (0, express_1.Router)();
const controller = new match_controller_1.MatchController();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, validator_1.validate)(validator_1.schemas.createMatch), controller.createMatch);
router.get('/', (0, cache_middleware_1.cacheMiddleware)(60), controller.getAllMatches);
router.get('/live/all', (0, cache_middleware_1.cacheMiddleware)(5, cache_middleware_1.cacheKeyGenerators.allLiveMatches), controller.getAllLiveMatches);
router.get('/:id', (0, cache_middleware_1.cacheMiddleware)(300, cache_middleware_1.cacheKeyGenerators.match), controller.getMatchById);
router.get('/:id/live', (0, cache_middleware_1.cacheMiddleware)(10, cache_middleware_1.cacheKeyGenerators.liveMatch), controller.getLiveScore);
router.get('/:id/scorecard/pdf', (0, cache_middleware_1.cacheMiddleware)(3600, (req) => `pdf:scorecard:${req.params.id}`), controller.exportScorecardPDF);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, validator_1.validate)(validator_1.schemas.createMatch), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.updateMatch);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.deleteMatch);
router.post('/:id/cancel', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.cancelMatch);
router.post('/:id/toss', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'), (0, validator_1.validate)(validator_1.schemas.recordToss), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.recordToss);
router.post('/:id/innings', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.startInnings);
router.post('/:id/ball', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'), (0, validator_1.validate)(validator_1.schemas.recordBall), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.recordBall);
router.post('/:id/complete-innings', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.completeInnings);
router.post('/:id/complete', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateMatch(req.params.id);
}), controller.completeMatch);
exports.default = router;
//# sourceMappingURL=match.routes.js.map