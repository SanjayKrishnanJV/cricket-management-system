"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizationController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
class VisualizationController {
    async getWagonWheel(req, res, next) {
        try {
            const { matchId } = req.params;
            const filters = {
                batsmanId: req.query.batsmanId,
                bowlerId: req.query.bowlerId,
                inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber) : undefined,
                minRuns: req.query.minRuns ? parseInt(req.query.minRuns) : undefined,
            };
            const data = await analyticsService.getWagonWheel(matchId, filters);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPitchMap(req, res, next) {
        try {
            const { matchId } = req.params;
            const filters = {
                bowlerId: req.query.bowlerId,
                batsmanId: req.query.batsmanId,
                inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber) : undefined,
            };
            const data = await analyticsService.getPitchMap(matchId, filters);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getFieldPlacements(req, res, next) {
        try {
            const { matchId } = req.params;
            const overNumber = req.query.overNumber ? parseInt(req.query.overNumber) : undefined;
            const data = await analyticsService.getFieldPlacements(matchId, overNumber);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async saveFieldPlacement(req, res, next) {
        try {
            const { matchId } = req.params;
            const { inningsId, overNumber, ballNumber, positions } = req.body;
            const data = await analyticsService.saveFieldPlacement({
                matchId,
                inningsId,
                overNumber,
                ballNumber,
                positions,
            });
            res.status(201).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async get3DReplayData(req, res, next) {
        try {
            const { matchId } = req.params;
            const filters = {
                overNumber: req.query.overNumber ? parseInt(req.query.overNumber) : undefined,
                ballNumber: req.query.ballNumber ? parseInt(req.query.ballNumber) : undefined,
                inningsNumber: req.query.inningsNumber ? parseInt(req.query.inningsNumber) : undefined,
            };
            const data = await analyticsService.get3DReplayData(matchId, filters);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VisualizationController = VisualizationController;
exports.default = new VisualizationController();
//# sourceMappingURL=visualization.controller.js.map