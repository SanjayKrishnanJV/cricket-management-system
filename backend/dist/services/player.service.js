"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const cricket_utils_1 = require("../utils/cricket.utils");
class PlayerService {
    async createPlayer(data) {
        const player = await database_1.default.player.create({
            data: {
                name: data.name,
                role: data.role,
                age: data.age,
                nationality: data.nationality,
                basePrice: data.basePrice,
                imageUrl: data.imageUrl,
            },
        });
        return player;
    }
    async getAllPlayers(filters) {
        const where = {};
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.nationality) {
            where.nationality = filters.nationality;
        }
        const players = await database_1.default.player.findMany({
            where,
            include: {
                contracts: {
                    where: { isActive: true },
                    include: {
                        team: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (filters?.available) {
            return players.filter(player => player.contracts.length === 0);
        }
        return players;
    }
    async getPlayerById(id) {
        const player = await database_1.default.player.findUnique({
            where: { id },
            include: {
                contracts: {
                    include: {
                        team: true,
                    },
                },
                battingStats: {
                    include: {
                        innings: {
                            include: {
                                match: {
                                    select: {
                                        venue: true,
                                        matchDate: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                bowlingStats: {
                    include: {
                        innings: {
                            include: {
                                match: {
                                    select: {
                                        venue: true,
                                        matchDate: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!player) {
            throw new errorHandler_1.AppError('Player not found', 404);
        }
        return player;
    }
    async updatePlayer(id, data) {
        const player = await database_1.default.player.update({
            where: { id },
            data,
        });
        return player;
    }
    async deletePlayer(id) {
        await database_1.default.player.delete({
            where: { id },
        });
        return { message: 'Player deleted successfully' };
    }
    async updatePlayerStats(playerId) {
        const battingStats = await database_1.default.battingPerformance.findMany({
            where: { playerId },
        });
        const bowlingStats = await database_1.default.bowlingPerformance.findMany({
            where: { playerId },
        });
        let totalRuns = 0;
        let totalBallsFaced = 0;
        let dismissals = 0;
        let highestScore = 0;
        battingStats.forEach(stat => {
            totalRuns += stat.runs;
            totalBallsFaced += stat.ballsFaced;
            if (stat.isOut)
                dismissals++;
            if (stat.runs > highestScore)
                highestScore = stat.runs;
        });
        let totalWickets = 0;
        let totalRunsConceded = 0;
        let totalOversBowled = 0;
        bowlingStats.forEach(stat => {
            totalWickets += stat.wickets;
            totalRunsConceded += stat.runsConceded;
            totalOversBowled += stat.oversBowled;
        });
        const battingAverage = cricket_utils_1.CricketUtils.calculateBattingAverage(totalRuns, dismissals);
        const strikeRate = cricket_utils_1.CricketUtils.calculateStrikeRate(totalRuns, totalBallsFaced);
        const bowlingAverage = cricket_utils_1.CricketUtils.calculateBowlingAverage(totalRunsConceded, totalWickets);
        const economyRate = cricket_utils_1.CricketUtils.calculateEconomyRate(totalRunsConceded, totalOversBowled);
        await database_1.default.player.update({
            where: { id: playerId },
            data: {
                totalMatches: battingStats.length,
                totalRuns,
                totalWickets,
                battingAverage,
                strikeRate,
                bowlingAverage,
                economyRate,
                highestScore,
            },
        });
    }
    async getPlayerAnalytics(playerId) {
        const player = await database_1.default.player.findUnique({
            where: { id: playerId },
            include: {
                battingStats: {
                    include: {
                        innings: {
                            include: {
                                match: {
                                    select: {
                                        matchDate: true,
                                        venue: true,
                                        homeTeam: { select: { name: true } },
                                        awayTeam: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                bowlingStats: {
                    include: {
                        innings: {
                            include: {
                                match: {
                                    select: {
                                        matchDate: true,
                                        venue: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!player) {
            throw new errorHandler_1.AppError('Player not found', 404);
        }
        return {
            player: {
                id: player.id,
                name: player.name,
                role: player.role,
                totalMatches: player.totalMatches,
                totalRuns: player.totalRuns,
                totalWickets: player.totalWickets,
                battingAverage: player.battingAverage,
                strikeRate: player.strikeRate,
                bowlingAverage: player.bowlingAverage,
                economyRate: player.economyRate,
                highestScore: player.highestScore,
            },
            recentPerformances: {
                batting: player.battingStats.slice(0, 10),
                bowling: player.bowlingStats.slice(0, 10),
            },
        };
    }
}
exports.PlayerService = PlayerService;
//# sourceMappingURL=player.service.js.map