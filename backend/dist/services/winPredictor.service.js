"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.winPredictorService = exports.WinPredictorService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class WinPredictorService {
    async calculateWinProbability(matchId, inningsId, overNumber, ballNumber) {
        try {
            const match = await prisma.match.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    innings: {
                        include: {
                            battingPerformances: true,
                            bowlingPerformances: true,
                        },
                    },
                },
            });
            if (!match) {
                throw new Error('Match not found');
            }
            const currentInnings = match.innings.find((i) => i.id === inningsId);
            if (!currentInnings) {
                throw new Error('Innings not found');
            }
            const inningsNumber = currentInnings.inningsNumber;
            const currentScore = currentInnings.totalRuns;
            const wicketsLost = currentInnings.totalWickets;
            const totalBalls = Math.floor(currentInnings.totalOvers) * 6 + Math.round((currentInnings.totalOvers % 1) * 10);
            const totalOvers = match.customOvers || 20;
            const totalBallsInInnings = totalOvers * 6;
            const ballsRemaining = totalBallsInInnings - totalBalls;
            let team1Probability;
            let team2Probability;
            let target = null;
            let requiredRunRate = null;
            if (inningsNumber === 1) {
                team1Probability = this.calculateFirstInningsProbability(currentScore, wicketsLost, ballsRemaining, totalBallsInInnings);
                team2Probability = 100 - team1Probability;
            }
            else {
                const firstInnings = match.innings.find((i) => i.inningsNumber === 1);
                if (!firstInnings) {
                    throw new Error('First innings not found');
                }
                target = firstInnings.totalRuns + 1;
                const runsNeeded = target - currentScore;
                requiredRunRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 0;
                team2Probability = this.calculateSecondInningsProbability(currentScore, target, wicketsLost, ballsRemaining);
                team1Probability = 100 - team2Probability;
            }
            team1Probability = Math.max(0, Math.min(100, team1Probability));
            team2Probability = Math.max(0, Math.min(100, team2Probability));
            const total = team1Probability + team2Probability;
            if (total > 0) {
                team1Probability = (team1Probability / total) * 100;
                team2Probability = (team2Probability / total) * 100;
            }
            const winProbability = await prisma.winProbability.create({
                data: {
                    matchId,
                    inningsId,
                    overNumber,
                    ballNumber,
                    team1Probability,
                    team2Probability,
                    tieDrawProbability: 0,
                    currentScore,
                    wicketsLost,
                    target,
                    ballsRemaining,
                    requiredRunRate,
                },
            });
            return {
                success: true,
                data: winProbability,
            };
        }
        catch (error) {
            console.error('Error calculating win probability:', error);
            return {
                success: false,
                message: error.message || 'Failed to calculate win probability',
            };
        }
    }
    calculateFirstInningsProbability(currentScore, wicketsLost, ballsRemaining, totalBalls) {
        const ballsBowled = totalBalls - ballsRemaining;
        if (ballsBowled === 0)
            return 50;
        const currentRunRate = (currentScore / ballsBowled) * 6;
        const wicketsInHand = 10 - wicketsLost;
        const projectedTotal = currentScore + (currentRunRate * ballsRemaining) / 6;
        const wicketFactor = wicketsInHand / 10;
        const adjustedProjection = projectedTotal * (0.7 + 0.3 * wicketFactor);
        const averageTotal = 160;
        const advantage = adjustedProjection - averageTotal;
        const probabilityShift = (advantage / 10) * 10;
        const probability = 50 + probabilityShift;
        return probability;
    }
    calculateSecondInningsProbability(currentScore, target, wicketsLost, ballsRemaining) {
        const runsNeeded = target - currentScore;
        const wicketsInHand = 10 - wicketsLost;
        if (currentScore >= target)
            return 100;
        if (wicketsInHand === 0)
            return 0;
        if (ballsRemaining === 0)
            return currentScore >= target ? 100 : 0;
        const requiredRunRate = (runsNeeded / ballsRemaining) * 6;
        let probability;
        if (requiredRunRate <= 6) {
            probability = 90 - (6 - requiredRunRate) * 2;
        }
        else if (requiredRunRate <= 10) {
            probability = 70 - (requiredRunRate - 6) * 5;
        }
        else if (requiredRunRate <= 12) {
            probability = 50 - (requiredRunRate - 10) * 10;
        }
        else if (requiredRunRate <= 15) {
            probability = 30 - (requiredRunRate - 12) * 6.67;
        }
        else {
            probability = 10 - Math.min(10, (requiredRunRate - 15) * 2);
        }
        const wicketFactor = wicketsInHand / 10;
        probability = probability * (0.5 + 0.5 * wicketFactor);
        const ballsFactor = Math.min(1, ballsRemaining / 60);
        probability = probability * (0.7 + 0.3 * ballsFactor);
        return probability;
    }
    async getWinProbabilityHistory(matchId) {
        try {
            const probabilities = await prisma.winProbability.findMany({
                where: { matchId },
                orderBy: [{ overNumber: 'asc' }, { ballNumber: 'asc' }],
            });
            return {
                success: true,
                data: probabilities,
            };
        }
        catch (error) {
            console.error('Error fetching win probability history:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch win probability history',
            };
        }
    }
    async getLatestWinProbability(matchId) {
        try {
            const latest = await prisma.winProbability.findFirst({
                where: { matchId },
                orderBy: { calculatedAt: 'desc' },
            });
            if (!latest) {
                return {
                    success: false,
                    message: 'No win probability data found',
                };
            }
            return {
                success: true,
                data: latest,
            };
        }
        catch (error) {
            console.error('Error fetching latest win probability:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch latest win probability',
            };
        }
    }
}
exports.WinPredictorService = WinPredictorService;
exports.winPredictorService = new WinPredictorService();
//# sourceMappingURL=winPredictor.service.js.map