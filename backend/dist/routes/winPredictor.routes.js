"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const winPredictor_controller_1 = require("../controllers/winPredictor.controller");
const router = (0, express_1.Router)();
router.post('/matches/:matchId/win-probability', winPredictor_controller_1.winPredictorController.calculateProbability);
router.get('/matches/:matchId/win-probability/history', winPredictor_controller_1.winPredictorController.getProbabilityHistory);
router.get('/matches/:matchId/win-probability/latest', winPredictor_controller_1.winPredictorController.getLatestProbability);
exports.default = router;
//# sourceMappingURL=winPredictor.routes.js.map