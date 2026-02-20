"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchPredictionService = exports.MatchPredictionService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const errorHandler_1 = require("../../middleware/errorHandler");
class MatchPredictionService {
    async predictMatch(matchId) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: {
                    include: {
                        homeMatches: {
                            orderBy: { matchDate: 'desc' },
                            take: 5,
                        },
                    },
                },
                awayTeam: {
                    include: {
                        awayMatches: {
                            orderBy: { matchDate: 'desc' },
                            take: 5,
                        },
                    },
                },
            },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        const team1Form = this.calculateTeamForm(match.homeTeam.homeMatches, match.homeTeamId);
        const team2Form = this.calculateTeamForm(match.awayTeam.awayMatches, match.awayTeamId);
        const venueAdvantage = this.calculateVenueAdvantage(match.venue, match.homeTeamId, match.awayTeamId);
        const tossAdvantage = 5;
        const headToHead = await this.getHeadToHead(match.homeTeamId, match.awayTeamId);
        const weatherImpact = 0;
        const { team1WinProb, team2WinProb, tieDrawProb } = this.calculateWinProbabilities({
            team1Form,
            team2Form,
            venueAdvantage,
            tossAdvantage,
            weatherImpact,
            headToHead,
        });
        const confidence = this.calculateConfidence(team1Form, team2Form, headToHead);
        const prediction = await database_1.default.matchPrediction.create({
            data: {
                matchId,
                team1WinProb,
                team2WinProb,
                tieDrawProb,
                team1Form,
                team2Form,
                venueAdvantage,
                tossAdvantage,
                weatherImpact,
                headToHead: JSON.stringify(headToHead),
                confidence,
                factors: JSON.stringify({
                    formDifference: team1Form - team2Form,
                    venueImpact: venueAdvantage * 10,
                    h2hFactor: headToHead.team1Wins - headToHead.team2Wins,
                }),
            },
        });
        return {
            success: true,
            data: {
                ...prediction,
                headToHead: JSON.parse(prediction.headToHead || '{}'),
                factors: JSON.parse(prediction.factors || '{}'),
            },
        };
    }
    calculateTeamForm(recentMatches, teamId) {
        if (recentMatches.length === 0)
            return 50;
        let formScore = 0;
        let totalMatches = 0;
        for (const match of recentMatches) {
            if (match.status !== 'COMPLETED')
                continue;
            totalMatches++;
            if (match.winnerId === teamId) {
                formScore += 100;
            }
            else if (!match.winnerId) {
                formScore += 50;
            }
            else {
                formScore += 0;
            }
        }
        return totalMatches > 0 ? formScore / totalMatches : 50;
    }
    calculateVenueAdvantage(venue, homeTeamId, awayTeamId) {
        return 0.2;
    }
    async getHeadToHead(team1Id, team2Id) {
        const matches = await database_1.default.match.findMany({
            where: {
                OR: [
                    { homeTeamId: team1Id, awayTeamId: team2Id },
                    { homeTeamId: team2Id, awayTeamId: team1Id },
                ],
                status: 'COMPLETED',
            },
        });
        let team1Wins = 0;
        let team2Wins = 0;
        let draws = 0;
        for (const match of matches) {
            if (match.winnerId === team1Id)
                team1Wins++;
            else if (match.winnerId === team2Id)
                team2Wins++;
            else
                draws++;
        }
        return { team1Wins, team2Wins, draws, total: matches.length };
    }
    calculateWinProbabilities(factors) {
        let team1Prob = factors.team1Form;
        let team2Prob = factors.team2Form;
        team1Prob += factors.venueAdvantage * 10;
        if (factors.headToHead.total > 0) {
            const h2hFactor = (factors.headToHead.team1Wins - factors.headToHead.team2Wins) / factors.headToHead.total;
            team1Prob += h2hFactor * 5;
            team2Prob -= h2hFactor * 5;
        }
        team1Prob += factors.weatherImpact * 3;
        team2Prob -= factors.weatherImpact * 3;
        const total = team1Prob + team2Prob;
        team1Prob = (team1Prob / total) * 100;
        team2Prob = (team2Prob / total) * 100;
        const tieDrawProb = 0;
        team1Prob = Math.max(5, Math.min(95, team1Prob));
        team2Prob = Math.max(5, Math.min(95, team2Prob));
        const finalTotal = team1Prob + team2Prob + tieDrawProb;
        team1Prob = (team1Prob / finalTotal) * 100;
        team2Prob = (team2Prob / finalTotal) * 100;
        return {
            team1WinProb: parseFloat(team1Prob.toFixed(2)),
            team2WinProb: parseFloat(team2Prob.toFixed(2)),
            tieDrawProb: parseFloat(tieDrawProb.toFixed(2)),
        };
    }
    calculateConfidence(team1Form, team2Form, headToHead) {
        let confidence = 50;
        if (team1Form !== 50 && team2Form !== 50)
            confidence += 20;
        if (headToHead.total >= 5)
            confidence += 20;
        else if (headToHead.total >= 2)
            confidence += 10;
        const formDiff = Math.abs(team1Form - team2Form);
        if (formDiff < 10)
            confidence -= 10;
        return Math.max(30, Math.min(90, confidence));
    }
    async getMatchPrediction(matchId) {
        const prediction = await database_1.default.matchPrediction.findFirst({
            where: { matchId },
            orderBy: { predictedAt: 'desc' },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
            },
        });
        if (!prediction) {
            return this.predictMatch(matchId);
        }
        return {
            success: true,
            data: {
                ...prediction,
                headToHead: JSON.parse(prediction.headToHead || '{}'),
                factors: JSON.parse(prediction.factors || '{}'),
            },
        };
    }
    async getAllPredictions(limit = 20) {
        const predictions = await database_1.default.matchPrediction.findMany({
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
            },
            orderBy: {
                predictedAt: 'desc',
            },
            take: limit,
        });
        return {
            success: true,
            data: predictions.map((p) => ({
                ...p,
                headToHead: JSON.parse(p.headToHead || '{}'),
                factors: JSON.parse(p.factors || '{}'),
            })),
        };
    }
}
exports.MatchPredictionService = MatchPredictionService;
exports.matchPredictionService = new MatchPredictionService();
//# sourceMappingURL=matchPrediction.service.js.map