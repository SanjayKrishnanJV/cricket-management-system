"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjuryRiskTrends = exports.getHighRiskPlayers = exports.getInjuryRisk = exports.assessInjuryRisk = exports.getMatchPredictions = exports.getPerformancePrediction = exports.predictPerformance = exports.getTeamSuggestion = exports.suggestTeam = exports.getPredictionTrends = exports.getMatchPrediction = exports.predictMatch = void 0;
const matchPrediction_service_1 = require("../services/ai/matchPrediction.service");
const teamSelection_service_1 = require("../services/ai/teamSelection.service");
const performancePrediction_service_1 = require("../services/ai/performancePrediction.service");
const injuryRisk_service_1 = require("../services/ai/injuryRisk.service");
const predictMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await matchPrediction_service_1.matchPredictionService.predictMatch(matchId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.predictMatch = predictMatch;
const getMatchPrediction = async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await matchPrediction_service_1.matchPredictionService.getMatchPrediction(matchId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getMatchPrediction = getMatchPrediction;
const getPredictionTrends = async (req, res) => {
    try {
        const { limit } = req.query;
        const result = await matchPrediction_service_1.matchPredictionService.getAllPredictions(limit ? parseInt(limit) : 20);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getPredictionTrends = getPredictionTrends;
const suggestTeam = async (req, res) => {
    try {
        const { matchId, teamId } = req.params;
        const { pitchType, weather, oppositionTeamId } = req.body;
        const result = await teamSelection_service_1.teamSelectionService.suggestTeam(matchId, teamId, {
            pitchType,
            weather,
            oppositionId: oppositionTeamId,
        });
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.suggestTeam = suggestTeam;
const getTeamSuggestion = async (req, res) => {
    try {
        const { matchId, teamId } = req.params;
        const result = await teamSelection_service_1.teamSelectionService.getTeamSuggestion(matchId, teamId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getTeamSuggestion = getTeamSuggestion;
const predictPerformance = async (req, res) => {
    try {
        const { matchId, playerId } = req.params;
        const result = await performancePrediction_service_1.performancePredictionService.predictPerformance(matchId, playerId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.predictPerformance = predictPerformance;
const getPerformancePrediction = async (req, res) => {
    try {
        const { matchId, playerId } = req.params;
        const result = await performancePrediction_service_1.performancePredictionService.getPerformancePrediction(matchId, playerId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getPerformancePrediction = getPerformancePrediction;
const getMatchPredictions = async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await performancePrediction_service_1.performancePredictionService.getMatchPredictions(matchId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getMatchPredictions = getMatchPredictions;
const assessInjuryRisk = async (req, res) => {
    try {
        const { playerId } = req.params;
        const result = await injuryRisk_service_1.injuryRiskService.assessInjuryRisk(playerId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.assessInjuryRisk = assessInjuryRisk;
const getInjuryRisk = async (req, res) => {
    try {
        const { playerId } = req.params;
        const result = await injuryRisk_service_1.injuryRiskService.getInjuryRisk(playerId);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getInjuryRisk = getInjuryRisk;
const getHighRiskPlayers = async (req, res) => {
    try {
        const result = await injuryRisk_service_1.injuryRiskService.getHighRiskPlayers();
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getHighRiskPlayers = getHighRiskPlayers;
const getInjuryRiskTrends = async (req, res) => {
    try {
        const { playerId } = req.params;
        const { limit } = req.query;
        const result = await injuryRisk_service_1.injuryRiskService.getInjuryRiskTrends(playerId, limit ? parseInt(limit) : undefined);
        res.json(result);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getInjuryRiskTrends = getInjuryRiskTrends;
//# sourceMappingURL=ai.controller.js.map