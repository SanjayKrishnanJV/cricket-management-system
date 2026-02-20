"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const cricket_utils_1 = require("../utils/cricket.utils");
class TournamentService {
    async createTournament(data) {
        const tournament = await database_1.default.tournament.create({
            data: {
                name: data.name,
                format: data.format,
                type: data.type,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                prizePool: data.prizePool,
                description: data.description,
                adminId: data.adminId,
            },
        });
        return tournament;
    }
    async getAllTournaments() {
        const tournaments = await database_1.default.tournament.findMany({
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                teams: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                shortName: true,
                                logoUrl: true,
                            },
                        },
                    },
                },
                matches: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
            orderBy: { startDate: 'desc' },
        });
        return tournaments;
    }
    async getTournamentById(id) {
        const tournament = await database_1.default.tournament.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                teams: {
                    include: {
                        team: {
                            include: {
                                contracts: {
                                    where: { isActive: true },
                                    include: {
                                        player: true,
                                    },
                                },
                            },
                        },
                    },
                },
                matches: {
                    include: {
                        homeTeam: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                        awayTeam: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                    },
                    orderBy: { matchDate: 'asc' },
                },
                pointsTable: {
                    orderBy: [
                        { points: 'desc' },
                        { netRunRate: 'desc' },
                    ],
                },
            },
        });
        if (!tournament) {
            throw new errorHandler_1.AppError('Tournament not found', 404);
        }
        return tournament;
    }
    async updateTournament(id, data) {
        const existingTournament = await database_1.default.tournament.findUnique({
            where: { id },
        });
        if (!existingTournament) {
            throw new errorHandler_1.AppError('Tournament not found', 404);
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.format !== undefined)
            updateData.format = data.format;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.startDate !== undefined)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined)
            updateData.endDate = new Date(data.endDate);
        if (data.prizePool !== undefined)
            updateData.prizePool = data.prizePool;
        if (data.description !== undefined)
            updateData.description = data.description;
        const tournament = await database_1.default.tournament.update({
            where: { id },
            data: updateData,
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return tournament;
    }
    async deleteTournament(id) {
        const tournament = await database_1.default.tournament.findUnique({
            where: { id },
        });
        if (!tournament) {
            throw new errorHandler_1.AppError('Tournament not found', 404);
        }
        await database_1.default.tournament.delete({
            where: { id },
        });
    }
    async addTeamToTournament(tournamentId, teamId) {
        const tournament = await database_1.default.tournament.findUnique({
            where: { id: tournamentId },
        });
        const team = await database_1.default.team.findUnique({
            where: { id: teamId },
        });
        if (!tournament || !team) {
            throw new errorHandler_1.AppError('Tournament or Team not found', 404);
        }
        const tournamentTeam = await database_1.default.tournamentTeam.create({
            data: {
                tournamentId,
                teamId,
            },
        });
        await database_1.default.pointsTable.create({
            data: {
                tournamentId,
                teamId,
            },
        });
        return tournamentTeam;
    }
    async generateFixtures(tournamentId) {
        const tournament = await database_1.default.tournament.findUnique({
            where: { id: tournamentId },
            include: {
                teams: {
                    include: {
                        team: true,
                    },
                },
            },
        });
        if (!tournament) {
            throw new errorHandler_1.AppError('Tournament not found', 404);
        }
        const teams = tournament.teams.map(tt => tt.team);
        if (teams.length < 2) {
            throw new errorHandler_1.AppError('At least 2 teams required', 400);
        }
        const matches = [];
        const startDate = new Date(tournament.startDate);
        if (tournament.type === 'LEAGUE' || tournament.type === 'LEAGUE_KNOCKOUT') {
            let matchCount = 0;
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const matchDate = new Date(startDate);
                    matchDate.setDate(matchDate.getDate() + matchCount * 2);
                    const match = await database_1.default.match.create({
                        data: {
                            tournamentId,
                            homeTeamId: teams[i].id,
                            awayTeamId: teams[j].id,
                            venue: `Stadium ${matchCount + 1}`,
                            matchDate,
                        },
                    });
                    matches.push(match);
                    matchCount++;
                }
            }
        }
        return matches;
    }
    async getPointsTable(tournamentId) {
        const pointsTable = await database_1.default.pointsTable.findMany({
            where: { tournamentId },
            orderBy: [
                { points: 'desc' },
                { netRunRate: 'desc' },
            ],
        });
        const enrichedTable = await Promise.all(pointsTable.map(async (entry) => {
            const team = await database_1.default.team.findUnique({
                where: { id: entry.teamId },
                select: {
                    name: true,
                    shortName: true,
                    logoUrl: true,
                },
            });
            return {
                ...entry,
                team,
            };
        }));
        return enrichedTable;
    }
    async updatePointsTable(tournamentId, matchId) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                innings: true,
            },
        });
        if (!match || match.status !== 'COMPLETED' || !match.winnerId) {
            return;
        }
        const loserId = match.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
        const winnerInnings = match.innings.find(i => i.battingTeamId === match.winnerId);
        const loserInnings = match.innings.find(i => i.battingTeamId === loserId);
        if (winnerInnings && loserInnings) {
            const winnerEntry = await database_1.default.pointsTable.findFirst({
                where: {
                    tournamentId,
                    teamId: match.winnerId,
                },
            });
            const loserEntry = await database_1.default.pointsTable.findFirst({
                where: {
                    tournamentId,
                    teamId: loserId,
                },
            });
            if (winnerEntry) {
                const winnerOvers = cricket_utils_1.CricketUtils.ballsToOvers(cricket_utils_1.CricketUtils.oversToBalls(winnerEntry.oversPlayed) +
                    cricket_utils_1.CricketUtils.oversToBalls(winnerInnings.totalOvers));
                const winnerFaced = cricket_utils_1.CricketUtils.ballsToOvers(cricket_utils_1.CricketUtils.oversToBalls(winnerEntry.oversFaced) +
                    cricket_utils_1.CricketUtils.oversToBalls(loserInnings.totalOvers));
                const newWinnerNRR = cricket_utils_1.CricketUtils.calculateNetRunRate(winnerEntry.runsScored + winnerInnings.totalRuns, winnerOvers, winnerEntry.runsConceded + loserInnings.totalRuns, winnerFaced);
                await database_1.default.pointsTable.update({
                    where: { id: winnerEntry.id },
                    data: {
                        played: winnerEntry.played + 1,
                        won: winnerEntry.won + 1,
                        points: winnerEntry.points + 2,
                        runsScored: winnerEntry.runsScored + winnerInnings.totalRuns,
                        runsConceded: winnerEntry.runsConceded + loserInnings.totalRuns,
                        oversPlayed: winnerOvers,
                        oversFaced: winnerFaced,
                        netRunRate: newWinnerNRR,
                    },
                });
            }
            if (loserEntry) {
                const loserOvers = cricket_utils_1.CricketUtils.ballsToOvers(cricket_utils_1.CricketUtils.oversToBalls(loserEntry.oversPlayed) +
                    cricket_utils_1.CricketUtils.oversToBalls(loserInnings.totalOvers));
                const loserFaced = cricket_utils_1.CricketUtils.ballsToOvers(cricket_utils_1.CricketUtils.oversToBalls(loserEntry.oversFaced) +
                    cricket_utils_1.CricketUtils.oversToBalls(winnerInnings.totalOvers));
                const newLoserNRR = cricket_utils_1.CricketUtils.calculateNetRunRate(loserEntry.runsScored + loserInnings.totalRuns, loserOvers, loserEntry.runsConceded + winnerInnings.totalRuns, loserFaced);
                await database_1.default.pointsTable.update({
                    where: { id: loserEntry.id },
                    data: {
                        played: loserEntry.played + 1,
                        lost: loserEntry.lost + 1,
                        runsScored: loserEntry.runsScored + loserInnings.totalRuns,
                        runsConceded: loserEntry.runsConceded + winnerInnings.totalRuns,
                        oversPlayed: loserOvers,
                        oversFaced: loserFaced,
                        netRunRate: newLoserNRR,
                    },
                });
            }
        }
    }
}
exports.TournamentService = TournamentService;
//# sourceMappingURL=tournament.service.js.map