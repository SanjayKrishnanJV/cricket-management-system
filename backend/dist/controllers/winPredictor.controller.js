"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.winPredictorController = exports.WinPredictorController = void 0;
const winPredictor_service_1 = require("../services/winPredictor.service");
class WinPredictorController {
    async calculateProbability(req, res) {
        try {
            const { matchId } = req.params;
            const { inningsId, overNumber, ballNumber } = req.body;
            if (!inningsId || overNumber === undefined || ballNumber === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: inningsId, overNumber, ballNumber',
                });
            }
            const result = await winPredictor_service_1.winPredictorService.calculateWinProbability(matchId, inningsId, overNumber, ballNumber);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in calculateProbability:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
    async getProbabilityHistory(req, res) {
        try {
            const { matchId } = req.params;
            const result = await winPredictor_service_1.winPredictorService.getWinProbabilityHistory(matchId);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in getProbabilityHistory:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
    async getLatestProbability(req, res) {
        try {
            const { matchId } = req.params;
            const result = await winPredictor_service_1.winPredictorService.getLatestWinProbability(matchId);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in getLatestProbability:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
exports.WinPredictorController = WinPredictorController;
exports.winPredictorController = new WinPredictorController();
//# sourceMappingURL=winPredictor.controller.js.map