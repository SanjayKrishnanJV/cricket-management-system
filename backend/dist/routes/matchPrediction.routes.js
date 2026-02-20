"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchPrediction_controller_1 = require("../controllers/matchPrediction.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', matchPrediction_controller_1.getAllPredictions);
router.get('/accuracy', matchPrediction_controller_1.getPredictionAccuracy);
router.get('/match/:matchId', matchPrediction_controller_1.getPrediction);
router.post('/match/:matchId/generate', auth_1.authenticate, matchPrediction_controller_1.generatePrediction);
exports.default = router;
//# sourceMappingURL=matchPrediction.routes.js.map