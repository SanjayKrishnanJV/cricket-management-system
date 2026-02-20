"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournament_controller_1 = require("../controllers/tournament.controller");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const cache_middleware_1 = require("../middleware/cache.middleware");
const cache_service_1 = require("../services/cache.service");
const router = (0, express_1.Router)();
const controller = new tournament_controller_1.TournamentController();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, validator_1.validate)(validator_1.schemas.createTournament), controller.createTournament);
router.get('/', (0, cache_middleware_1.cacheMiddleware)(300), controller.getAllTournaments);
router.get('/:id', (0, cache_middleware_1.cacheMiddleware)(300, (req) => `tournament:${req.params.id}:details`), controller.getTournamentById);
router.get('/:id/points-table', (0, cache_middleware_1.cacheMiddleware)(120, cache_middleware_1.cacheKeyGenerators.tournamentStandings), controller.getPointsTable);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, validator_1.validate)(validator_1.schemas.createTournament), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateTournament(req.params.id);
}), controller.updateTournament);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateTournament(req.params.id);
}), controller.deleteTournament);
router.post('/:id/teams', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateTournament(req.params.id);
}), controller.addTeamToTournament);
router.post('/:id/generate-fixtures', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), (0, cache_middleware_1.invalidateCacheMiddleware)(async (req) => {
    await cache_service_1.cacheService.invalidateTournament(req.params.id);
}), controller.generateFixtures);
exports.default = router;
//# sourceMappingURL=tournament.routes.js.map