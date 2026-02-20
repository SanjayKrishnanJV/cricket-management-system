"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesController = void 0;
const features_service_1 = require("../services/features.service");
const featuresService = new features_service_1.FeaturesService();
class FeaturesController {
    async getPlayerMilestones(req, res, next) {
        try {
            const milestones = await featuresService.getPlayerMilestones(req.params.playerId);
            res.status(200).json({
                status: 'success',
                data: milestones,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTournamentAwards(req, res, next) {
        try {
            const awards = await featuresService.getTournamentAwards(req.params.tournamentId);
            res.status(200).json({
                status: 'success',
                data: awards,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async comparePlayers(req, res, next) {
        try {
            const { player1Id, player2Id } = req.query;
            const comparison = await featuresService.comparePlayers(player1Id, player2Id);
            res.status(200).json({
                status: 'success',
                data: comparison,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getHeadToHead(req, res, next) {
        try {
            const { team1Id, team2Id } = req.query;
            const headToHead = await featuresService.getHeadToHead(team1Id, team2Id);
            res.status(200).json({
                status: 'success',
                data: headToHead,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getVenueStatistics(req, res, next) {
        try {
            const { venue } = req.params;
            const stats = await featuresService.getVenueStatistics(venue);
            res.status(200).json({
                status: 'success',
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async predictMatchOutcome(req, res, next) {
        try {
            const prediction = await featuresService.predictMatchOutcome(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data: prediction,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async calculateFantasyPoints(req, res, next) {
        try {
            const fantasyPoints = await featuresService.calculateFantasyPoints(req.params.matchId);
            res.status(200).json({
                status: 'success',
                data: fantasyPoints,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FeaturesController = FeaturesController;
//# sourceMappingURL=features.controller.js.map