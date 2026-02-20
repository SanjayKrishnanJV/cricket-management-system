"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performancePredictionService = exports.PerformancePredictionService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
class PerformancePredictionService {
    async predictPerformance(matchId, playerId) {
        const [match, player] = await Promise.all([
            database_1.default.match.findUnique({ where: { id: matchId } }),
            database_1.default.player.findUnique({
                where: { id: playerId },
                include: {
                    battingStats: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    bowlingStats: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            }),
        ]);
        if (!match)
            throw new errorHandler_1.AppError('Match not found', 404);
        if (!player)
            throw new errorHandler_1.AppError('Player not found', 404);
        const battingPrediction = this.predictBatting(player);
        const bowlingPrediction = this.predictBowling(player);
        const confidence = this.calculateConfidence(player);
        const factors = this.generateFactors(player, battingPrediction, bowlingPrediction);
        const prediction = await database_1.default.performancePrediction.create({
            data: {
                matchId,
                playerId,
                ...battingPrediction,
                ...bowlingPrediction,
                confidence,
                factors: JSON.stringify(factors),
            },
        });
        return {
            success: true,
            data: {
                ...prediction,
                factors: JSON.parse(prediction.factors || '{}'),
            },
        };
    }
    predictBatting(player) {
        const recentStats = player.battingStats.slice(0, 5);
        if (recentStats.length === 0) {
            return {
                expectedRuns: player.battingAverage || 20,
                expectedBalls: 15,
                expectedSR: player.strikeRate || 120,
                boundaryProb: 30,
            };
        }
        const avgRuns = recentStats.reduce((sum, s) => sum + s.runs, 0) / recentStats.length;
        const avgBalls = recentStats.reduce((sum, s) => sum + s.ballsFaced, 0) / recentStats.length;
        const avgSR = recentStats.reduce((sum, s) => sum + s.strikeRate, 0) / recentStats.length;
        const boundaries = recentStats.reduce((sum, s) => sum + s.fours + s.sixes, 0);
        const totalBalls = recentStats.reduce((sum, s) => sum + s.ballsFaced, 0);
        const boundaryProb = totalBalls > 0 ? (boundaries / totalBalls) * 100 : 30;
        const formTrend = this.calculateFormTrend(recentStats);
        return {
            expectedRuns: parseFloat((avgRuns * (1 + formTrend)).toFixed(2)),
            expectedBalls: parseFloat(avgBalls.toFixed(2)),
            expectedSR: parseFloat((avgSR * (1 + formTrend * 0.5)).toFixed(2)),
            boundaryProb: parseFloat(Math.min(60, Math.max(10, boundaryProb)).toFixed(2)),
        };
    }
    predictBowling(player) {
        const recentStats = player.bowlingStats.slice(0, 5);
        if (recentStats.length === 0) {
            return {
                expectedWickets: player.totalWickets > 0 ? 1.5 : 0,
                expectedOvers: 4,
                expectedEconomy: player.economyRate || 7.5,
                wicketProb: 40,
            };
        }
        const avgWickets = recentStats.reduce((sum, s) => sum + s.wickets, 0) / recentStats.length;
        const avgOvers = recentStats.reduce((sum, s) => sum + s.overs, 0) / recentStats.length;
        const avgEconomy = recentStats.reduce((sum, s) => sum + s.economyRate, 0) / recentStats.length;
        const matchesWithWickets = recentStats.filter((s) => s.wickets > 0).length;
        const wicketProb = (matchesWithWickets / recentStats.length) * 100;
        const formTrend = this.calculateBowlingFormTrend(recentStats);
        return {
            expectedWickets: parseFloat((avgWickets * (1 + formTrend)).toFixed(2)),
            expectedOvers: parseFloat(avgOvers.toFixed(2)),
            expectedEconomy: parseFloat((avgEconomy * (1 - formTrend * 0.3)).toFixed(2)),
            wicketProb: parseFloat(Math.min(80, Math.max(20, wicketProb * (1 + formTrend))).toFixed(2)),
        };
    }
    calculateFormTrend(stats) {
        if (stats.length < 3)
            return 0;
        const recent = stats.slice(0, 2);
        const older = stats.slice(2, 4);
        const recentAvg = recent.reduce((sum, s) => sum + s.runs, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.runs, 0) / older.length;
        if (olderAvg === 0)
            return 0;
        const trend = (recentAvg - olderAvg) / olderAvg;
        return Math.max(-0.3, Math.min(0.3, trend));
    }
    calculateBowlingFormTrend(stats) {
        if (stats.length < 3)
            return 0;
        const recent = stats.slice(0, 2);
        const older = stats.slice(2, 4);
        const recentAvg = recent.reduce((sum, s) => sum + s.wickets, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.wickets, 0) / older.length;
        if (olderAvg === 0)
            return 0;
        const trend = (recentAvg - olderAvg) / olderAvg;
        return Math.max(-0.3, Math.min(0.3, trend));
    }
    calculateConfidence(player) {
        let confidence = 50;
        if (player.totalMatches > 20)
            confidence += 20;
        else if (player.totalMatches > 10)
            confidence += 10;
        if (player.battingStats.length >= 5)
            confidence += 10;
        if (player.bowlingStats.length >= 5)
            confidence += 10;
        const battingVariance = this.calculateVariance(player.battingStats);
        if (battingVariance < 20)
            confidence += 10;
        return Math.min(90, confidence);
    }
    calculateVariance(stats) {
        if (stats.length === 0)
            return 100;
        const runs = stats.map((s) => s.runs || 0);
        const avg = runs.reduce((sum, r) => sum + r, 0) / runs.length;
        const variance = runs.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / runs.length;
        return Math.sqrt(variance);
    }
    generateFactors(player, batting, bowling) {
        return {
            recentForm: player.battingStats.length > 0 ? 'good' : 'unknown',
            careerAverage: player.battingAverage,
            careerStrikeRate: player.strikeRate,
            totalMatches: player.totalMatches,
            totalRuns: player.totalRuns,
            totalWickets: player.totalWickets,
            battingTrend: batting.expectedRuns > player.battingAverage ? 'improving' : 'declining',
            bowlingTrend: bowling.expectedWickets > 1 ? 'improving' : 'stable',
        };
    }
    async getPerformancePrediction(matchId, playerId) {
        const prediction = await database_1.default.performancePrediction.findFirst({
            where: { matchId, playerId },
            orderBy: { predictedAt: 'desc' },
            include: {
                match: true,
                player: true,
            },
        });
        if (!prediction) {
            return this.predictPerformance(matchId, playerId);
        }
        return {
            success: true,
            data: {
                ...prediction,
                factors: JSON.parse(prediction.factors || '{}'),
            },
        };
    }
    async getMatchPredictions(matchId) {
        const predictions = await database_1.default.performancePrediction.findMany({
            where: { matchId },
            include: {
                player: true,
            },
            orderBy: {
                expectedRuns: 'desc',
            },
        });
        return {
            success: true,
            data: predictions.map((p) => ({
                ...p,
                factors: JSON.parse(p.factors || '{}'),
            })),
        };
    }
}
exports.PerformancePredictionService = PerformancePredictionService;
exports.performancePredictionService = new PerformancePredictionService();
//# sourceMappingURL=performancePrediction.service.js.map