"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamSelectionService = exports.TeamSelectionService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
class TeamSelectionService {
    async suggestTeam(matchId, teamId, options) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
            },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        const contracts = await database_1.default.contract.findMany({
            where: {
                teamId,
                isActive: true,
            },
            include: {
                player: {
                    include: {
                        battingStats: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                        },
                        bowlingStats: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                        },
                    },
                },
            },
        });
        const availablePlayers = contracts.map((c) => c.player);
        const batsmen = availablePlayers.filter((p) => p.role === 'BATSMAN');
        const bowlers = availablePlayers.filter((p) => p.role === 'BOWLER');
        const allRounders = availablePlayers.filter((p) => p.role === 'ALL_ROUNDER');
        const wicketKeepers = availablePlayers.filter((p) => p.role === 'WICKETKEEPER');
        const selectedXI = this.selectBestXI({
            batsmen,
            bowlers,
            allRounders,
            wicketKeepers,
            pitchType: options?.pitchType || 'balanced',
            weather: options?.weather || 'sunny',
        });
        const substitutes = this.selectSubstitutes(availablePlayers, selectedXI);
        const balanceScore = this.calculateTeamBalance(selectedXI);
        const strengthScore = this.calculateTeamStrength(selectedXI);
        const reasoning = this.generateReasoning(selectedXI, options);
        const suggestion = await database_1.default.teamSuggestion.create({
            data: {
                matchId,
                teamId,
                suggestedXI: JSON.stringify(selectedXI.map((p) => p.id)),
                substitutes: JSON.stringify(substitutes.map((p) => p.id)),
                pitchType: options?.pitchType,
                weather: options?.weather,
                opposition: options?.oppositionId,
                reasoning: JSON.stringify(reasoning),
                balanceScore,
                strengthScore,
            },
        });
        return {
            success: true,
            data: {
                ...suggestion,
                suggestedXI: selectedXI,
                substitutes: substitutes,
                reasoning: JSON.parse(suggestion.reasoning || '{}'),
            },
        };
    }
    selectBestXI(options) {
        const selected = [];
        const keeper = this.selectBest(options.wicketKeepers, 1, 'batting')[0];
        if (keeper)
            selected.push(keeper);
        let numBatsmen = 5;
        let numBowlers = 4;
        let numAllRounders = 1;
        if (options.pitchType === 'batting') {
            numBatsmen = 6;
            numBowlers = 3;
            numAllRounders = 1;
        }
        else if (options.pitchType === 'bowling') {
            numBatsmen = 4;
            numBowlers = 5;
            numAllRounders = 1;
        }
        const selectedBatsmen = this.selectBest(options.batsmen, numBatsmen, 'batting');
        selected.push(...selectedBatsmen);
        const selectedAllRounders = this.selectBest(options.allRounders, numAllRounders, 'allRound');
        selected.push(...selectedAllRounders);
        const selectedBowlers = this.selectBest(options.bowlers, numBowlers, 'bowling');
        selected.push(...selectedBowlers);
        return selected.slice(0, 11);
    }
    selectBest(players, count, criterion) {
        return players
            .map((player) => ({
            ...player,
            score: this.calculatePlayerScore(player, criterion),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, count);
    }
    calculatePlayerScore(player, criterion) {
        let score = 0;
        if (criterion === 'batting' || criterion === 'allRound') {
            score += player.battingAverage * 0.4;
            score += player.strikeRate * 0.3;
            score += player.totalRuns / 100;
        }
        if (criterion === 'bowling' || criterion === 'allRound') {
            score += (40 - player.bowlingAverage) * 0.4;
            score += (10 - player.economyRate) * 0.3;
            score += player.totalWickets * 2;
        }
        const recentForm = this.calculateRecentForm(player);
        score += recentForm * 0.2;
        return score;
    }
    calculateRecentForm(player) {
        if (player.battingStats && player.battingStats.length > 0) {
            const recentAvg = player.battingStats.reduce((sum, s) => sum + s.runs, 0) / player.battingStats.length;
            return recentAvg;
        }
        if (player.bowlingStats && player.bowlingStats.length > 0) {
            const recentWickets = player.bowlingStats.reduce((sum, s) => sum + s.wickets, 0) / player.bowlingStats.length;
            return recentWickets * 10;
        }
        return 0;
    }
    selectSubstitutes(allPlayers, selectedXI) {
        const selectedIds = new Set(selectedXI.map((p) => p.id));
        const remaining = allPlayers.filter((p) => !selectedIds.has(p.id));
        return remaining
            .map((p) => ({
            ...p,
            score: this.calculatePlayerScore(p, 'allRound'),
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
    }
    calculateTeamBalance(team) {
        const batsmen = team.filter((p) => p.role === 'BATSMAN' || p.role === 'WICKETKEEPER').length;
        const bowlers = team.filter((p) => p.role === 'BOWLER').length;
        const allRounders = team.filter((p) => p.role === 'ALL_ROUNDER').length;
        let score = 100;
        if (batsmen < 4 || batsmen > 7)
            score -= 20;
        if (bowlers < 3 || bowlers > 6)
            score -= 20;
        if (allRounders < 1 || allRounders > 3)
            score -= 10;
        return Math.max(0, score);
    }
    calculateTeamStrength(team) {
        const avgBattingAverage = team.reduce((sum, p) => sum + p.battingAverage, 0) / team.length;
        const avgStrikeRate = team.reduce((sum, p) => sum + p.strikeRate, 0) / team.length;
        const bowlers = team.filter((p) => p.role === 'BOWLER' || p.role === 'ALL_ROUNDER');
        const avgBowlingAverage = bowlers.length > 0 ? bowlers.reduce((sum, p) => sum + p.bowlingAverage, 0) / bowlers.length : 0;
        const avgEconomy = bowlers.length > 0 ? bowlers.reduce((sum, p) => sum + p.economyRate, 0) / bowlers.length : 0;
        const battingStrength = Math.min(100, (avgBattingAverage / 40) * 50 + (avgStrikeRate / 150) * 50);
        const bowlingStrength = Math.min(100, ((40 - avgBowlingAverage) / 40) * 50 + ((10 - avgEconomy) / 10) * 50);
        return parseFloat(((battingStrength + bowlingStrength) / 2).toFixed(2));
    }
    generateReasoning(team, options) {
        const reasoning = {};
        team.forEach((player) => {
            reasoning[player.id] = {
                name: player.name,
                role: player.role,
                reason: this.getSelectionReason(player, options),
            };
        });
        return reasoning;
    }
    getSelectionReason(player, options) {
        const reasons = [];
        if (player.battingAverage > 35) {
            reasons.push('Strong batting average');
        }
        if (player.strikeRate > 130) {
            reasons.push('High strike rate');
        }
        if (player.totalWickets > 20) {
            reasons.push('Consistent wicket-taker');
        }
        if (player.economyRate < 7.5) {
            reasons.push('Economical bowler');
        }
        if (player.role === 'ALL_ROUNDER') {
            reasons.push('Provides balance');
        }
        if (options?.pitchType === 'batting' && player.role === 'BATSMAN') {
            reasons.push('Suited for batting pitch');
        }
        if (options?.pitchType === 'bowling' && player.role === 'BOWLER') {
            reasons.push('Effective on bowling pitch');
        }
        return reasons.join(', ') || 'Selected based on overall performance';
    }
    async getTeamSuggestion(matchId, teamId) {
        const suggestion = await database_1.default.teamSuggestion.findFirst({
            where: { matchId, teamId },
            orderBy: { createdAt: 'desc' },
            include: {
                match: true,
                team: true,
            },
        });
        if (!suggestion) {
            return this.suggestTeam(matchId, teamId);
        }
        const playerIds = JSON.parse(suggestion.suggestedXI);
        const substituteIds = JSON.parse(suggestion.substitutes || '[]');
        const players = await database_1.default.player.findMany({
            where: { id: { in: [...playerIds, ...substituteIds] } },
        });
        const suggestedXI = playerIds.map((id) => players.find((p) => p.id === id));
        const substitutes = substituteIds.map((id) => players.find((p) => p.id === id));
        return {
            success: true,
            data: {
                ...suggestion,
                suggestedXI,
                substitutes,
                reasoning: JSON.parse(suggestion.reasoning || '{}'),
            },
        };
    }
}
exports.TeamSelectionService = TeamSelectionService;
exports.teamSelectionService = new TeamSelectionService();
//# sourceMappingURL=teamSelection.service.js.map