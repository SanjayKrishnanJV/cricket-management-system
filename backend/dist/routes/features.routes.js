"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const features_controller_1 = require("../controllers/features.controller");
const router = (0, express_1.Router)();
const controller = new features_controller_1.FeaturesController();
router.get('/players/:playerId/milestones', controller.getPlayerMilestones);
router.get('/tournaments/:tournamentId/awards', controller.getTournamentAwards);
router.get('/players/compare', controller.comparePlayers);
router.get('/teams/head-to-head', controller.getHeadToHead);
router.get('/venues/:venue/statistics', controller.getVenueStatistics);
router.get('/matches/:matchId/prediction', controller.predictMatchOutcome);
router.get('/matches/:matchId/fantasy-points', controller.calculateFantasyPoints);
exports.default = router;
//# sourceMappingURL=features.routes.js.map