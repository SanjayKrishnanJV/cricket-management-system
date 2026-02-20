"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injuryRiskService = exports.InjuryRiskService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
class InjuryRiskService {
    async assessInjuryRisk(playerId) {
        const player = await database_1.default.player.findUnique({
            where: { id: playerId },
            include: {
                bowlingStats: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                battingStats: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!player)
            throw new errorHandler_1.AppError('Player not found', 404);
        const workloadMetrics = this.calculateWorkloadMetrics(player);
        const riskScore = this.calculateRiskScore(player, workloadMetrics);
        const riskLevel = this.determineRiskLevel(riskScore);
        const workloadTrend = this.analyzeWorkloadTrend(player.bowlingStats);
        const recommendation = this.generateRecommendation(riskLevel, workloadMetrics, workloadTrend);
        const daysToRest = this.calculateRestDays(riskLevel, workloadMetrics);
        const injuryHistory = this.buildInjuryHistory(player);
        const assessment = await database_1.default.injuryRisk.create({
            data: {
                playerId,
                riskLevel,
                riskScore,
                ballsBowled: workloadMetrics.totalBallsBowled,
                oversPerMatch: workloadMetrics.oversPerMatch,
                matchesPlayed: workloadMetrics.matchesPlayed,
                restDays: workloadMetrics.restDays,
                age: player.age,
                injuryHistory,
                workloadTrend,
                recommendation,
                daysToRest,
            },
        });
        return {
            success: true,
            data: assessment,
        };
    }
    calculateWorkloadMetrics(player) {
        const recentStats = player.bowlingStats.slice(0, 10);
        const matchesPlayed = player.totalMatches || 0;
        const totalBallsBowled = recentStats.reduce((sum, s) => {
            return sum + (s.overs ? Math.floor(s.overs) * 6 + (s.overs % 1) * 10 : 0);
        }, 0);
        const oversPerMatch = recentStats.length > 0
            ? recentStats.reduce((sum, s) => sum + (s.overs || 0), 0) / recentStats.length
            : 0;
        const restDays = recentStats.length > 0
            ? Math.floor((Date.now() - new Date(recentStats[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 30;
        return {
            totalBallsBowled,
            oversPerMatch,
            matchesPlayed,
            restDays,
        };
    }
    calculateRiskScore(player, metrics) {
        let riskScore = 0;
        if (metrics.oversPerMatch > 10) {
            riskScore += 30;
        }
        else if (metrics.oversPerMatch > 8) {
            riskScore += 20;
        }
        else if (metrics.oversPerMatch > 6) {
            riskScore += 10;
        }
        if (metrics.restDays < 3) {
            riskScore += 25;
        }
        else if (metrics.restDays < 7) {
            riskScore += 15;
        }
        else if (metrics.restDays < 14) {
            riskScore += 5;
        }
        if (player.age) {
            if (player.age > 35) {
                riskScore += 20;
            }
            else if (player.age > 30) {
                riskScore += 10;
            }
            else if (player.age < 20) {
                riskScore += 5;
            }
        }
        if (metrics.matchesPlayed > 50) {
            riskScore += 15;
        }
        else if (metrics.matchesPlayed > 30) {
            riskScore += 10;
        }
        else if (metrics.matchesPlayed > 15) {
            riskScore += 5;
        }
        const isPaceBowler = player.bowlingAverage > 0 && player.economyRate < 6;
        if (isPaceBowler) {
            riskScore += 10;
        }
        return Math.min(100, riskScore);
    }
    determineRiskLevel(riskScore) {
        if (riskScore >= 70)
            return 'CRITICAL';
        if (riskScore >= 50)
            return 'HIGH';
        if (riskScore >= 30)
            return 'MEDIUM';
        return 'LOW';
    }
    analyzeWorkloadTrend(bowlingStats) {
        if (bowlingStats.length < 6)
            return 'INSUFFICIENT_DATA';
        const recent = bowlingStats.slice(0, 3);
        const older = bowlingStats.slice(3, 6);
        const recentAvgOvers = recent.reduce((sum, s) => sum + (s.overs || 0), 0) / recent.length;
        const olderAvgOvers = older.reduce((sum, s) => sum + (s.overs || 0), 0) / older.length;
        if (olderAvgOvers === 0)
            return 'STABLE';
        const percentageChange = ((recentAvgOvers - olderAvgOvers) / olderAvgOvers) * 100;
        if (percentageChange > 20)
            return 'INCREASING';
        if (percentageChange < -20)
            return 'DECREASING';
        return 'STABLE';
    }
    generateRecommendation(riskLevel, metrics, workloadTrend) {
        if (riskLevel === 'CRITICAL') {
            return 'IMMEDIATE REST REQUIRED - Player should be rested for at least 2-3 weeks. Consult medical team for comprehensive assessment.';
        }
        if (riskLevel === 'HIGH') {
            if (workloadTrend === 'INCREASING') {
                return 'REDUCE WORKLOAD - Limit overs per match and skip next match. Monitor closely for any discomfort.';
            }
            return 'MONITOR CLOSELY - Consider rotation policy and ensure adequate rest between matches.';
        }
        if (riskLevel === 'MEDIUM') {
            if (metrics.oversPerMatch > 8) {
                return 'MANAGE WORKLOAD - Limit to 8 overs per match and ensure 3-4 days rest between games.';
            }
            return 'CONTINUE WITH CAUTION - Maintain current workload but ensure proper warm-up and recovery protocols.';
        }
        return 'LOW RISK - Player can continue current workload. Maintain fitness and recovery routines.';
    }
    calculateRestDays(riskLevel, metrics) {
        if (riskLevel === 'CRITICAL') {
            return 21;
        }
        if (riskLevel === 'HIGH') {
            return 14;
        }
        if (riskLevel === 'MEDIUM') {
            if (metrics.restDays < 7) {
                return 7;
            }
            return 3;
        }
        return 0;
    }
    buildInjuryHistory(player) {
        const history = {
            totalMatches: player.totalMatches || 0,
            bowlingRole: player.bowlingAverage > 0 ? 'active' : 'minimal',
            careerSpan: 'unknown',
        };
        return JSON.stringify(history);
    }
    async getInjuryRisk(playerId) {
        const assessment = await database_1.default.injuryRisk.findFirst({
            where: { playerId },
            orderBy: { assessedAt: 'desc' },
            include: {
                player: true,
            },
        });
        if (!assessment) {
            return this.assessInjuryRisk(playerId);
        }
        return {
            success: true,
            data: assessment,
        };
    }
    async getHighRiskPlayers() {
        const assessments = await database_1.default.injuryRisk.findMany({
            where: {
                riskLevel: {
                    in: ['HIGH', 'CRITICAL'],
                },
            },
            include: {
                player: true,
            },
            orderBy: {
                riskScore: 'desc',
            },
        });
        return {
            success: true,
            data: assessments,
        };
    }
    async getInjuryRiskTrends(playerId, limit = 10) {
        const assessments = await database_1.default.injuryRisk.findMany({
            where: { playerId },
            orderBy: { assessedAt: 'desc' },
            take: limit,
        });
        return {
            success: true,
            data: assessments.reverse(),
        };
    }
}
exports.InjuryRiskService = InjuryRiskService;
exports.injuryRiskService = new InjuryRiskService();
//# sourceMappingURL=injuryRisk.service.js.map