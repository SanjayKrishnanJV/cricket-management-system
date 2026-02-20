"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
class AnalyticsController {
    async getMatchAnalytics(req, res, next) {
        try {
            const analytics = await analyticsService.getMatchAnalytics(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPlayerAnalytics(req, res, next) {
        try {
            const analytics = await analyticsService.getPlayerAnalytics(req.params.playerId);
            res.status(200).json({
                status: 'success',
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTeamAnalytics(req, res, next) {
        try {
            const analytics = await analyticsService.getTeamAnalytics(req.params.teamId);
            res.status(200).json({
                status: 'success',
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTournamentAnalytics(req, res, next) {
        try {
            const analytics = await analyticsService.getTournamentAnalytics(req.params.tournamentId);
            res.status(200).json({
                status: 'success',
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getManhattanChart(req, res, next) {
        try {
            const data = await analyticsService.getManhattanChart(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWormChart(req, res, next) {
        try {
            const data = await analyticsService.getWormChart(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPartnershipAnalysis(req, res, next) {
        try {
            const data = await analyticsService.getPartnershipAnalysis(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPhaseAnalysis(req, res, next) {
        try {
            const data = await analyticsService.getPhaseAnalysis(req.params.matchId);
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
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map