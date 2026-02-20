"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class TeamService {
    async createTeam(data) {
        const team = await database_1.default.team.create({
            data: {
                name: data.name,
                shortName: data.shortName,
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor,
                budget: data.budget || 10000000,
                ownerId: data.ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await database_1.default.teamStats.create({
            data: {
                teamId: team.id,
            },
        });
        return team;
    }
    async getAllTeams() {
        const teams = await database_1.default.team.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                contracts: {
                    where: { isActive: true },
                    include: {
                        player: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
                teamStats: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return teams;
    }
    async getTeamById(id) {
        const team = await database_1.default.team.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                contracts: {
                    where: { isActive: true },
                    include: {
                        player: true,
                    },
                },
                homeMatches: {
                    include: {
                        awayTeam: { select: { name: true, shortName: true } },
                    },
                    take: 10,
                    orderBy: { matchDate: 'desc' },
                },
                awayMatches: {
                    include: {
                        homeTeam: { select: { name: true, shortName: true } },
                    },
                    take: 10,
                    orderBy: { matchDate: 'desc' },
                },
                teamStats: true,
            },
        });
        if (!team) {
            throw new errorHandler_1.AppError('Team not found', 404);
        }
        let captain = null;
        let viceCaptain = null;
        if (team.captainId) {
            captain = await database_1.default.player.findUnique({
                where: { id: team.captainId },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    imageUrl: true,
                },
            });
        }
        if (team.viceCaptainId) {
            viceCaptain = await database_1.default.player.findUnique({
                where: { id: team.viceCaptainId },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    imageUrl: true,
                },
            });
        }
        return {
            ...team,
            captain,
            viceCaptain,
        };
    }
    async updateTeam(id, data) {
        const team = await database_1.default.team.update({
            where: { id },
            data,
        });
        return team;
    }
    async deleteTeam(id) {
        await database_1.default.team.delete({
            where: { id },
        });
        return { message: 'Team deleted successfully' };
    }
    async getTeamSquad(teamId) {
        const contracts = await database_1.default.contract.findMany({
            where: {
                teamId,
                isActive: true,
            },
            include: {
                player: true,
            },
            orderBy: {
                player: {
                    role: 'asc',
                },
            },
        });
        const squad = {
            batsmen: contracts.filter(c => c.player.role === 'BATSMAN'),
            bowlers: contracts.filter(c => c.player.role === 'BOWLER'),
            allRounders: contracts.filter(c => c.player.role === 'ALL_ROUNDER'),
            wicketkeepers: contracts.filter(c => c.player.role === 'WICKETKEEPER'),
        };
        return squad;
    }
    async addPlayerToTeam(teamId, playerId, amount) {
        const team = await database_1.default.team.findUnique({ where: { id: teamId } });
        const player = await database_1.default.player.findUnique({ where: { id: playerId } });
        if (!team || !player) {
            throw new errorHandler_1.AppError('Team or Player not found', 404);
        }
        if (amount < player.basePrice) {
            throw new errorHandler_1.AppError(`Contract amount (₹${(amount / 100000).toFixed(2)}L) cannot be below player's base price (₹${(player.basePrice / 100000).toFixed(2)}L)`, 400);
        }
        if (team.budget < amount) {
            throw new errorHandler_1.AppError('Insufficient budget', 400);
        }
        const existingContract = await database_1.default.contract.findFirst({
            where: {
                playerId,
                isActive: true,
            },
        });
        if (existingContract) {
            throw new errorHandler_1.AppError('Player already contracted to a team', 400);
        }
        const contract = await database_1.default.contract.create({
            data: {
                playerId,
                teamId,
                amount,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
        await database_1.default.team.update({
            where: { id: teamId },
            data: {
                budget: team.budget - amount,
            },
        });
        return contract;
    }
    async removePlayerFromTeam(contractId) {
        const contract = await database_1.default.contract.findUnique({
            where: { id: contractId },
            include: {
                team: true,
            },
        });
        if (!contract) {
            throw new errorHandler_1.AppError('Contract not found', 404);
        }
        await database_1.default.contract.update({
            where: { id: contractId },
            data: { isActive: false },
        });
        await database_1.default.team.update({
            where: { id: contract.teamId },
            data: {
                budget: contract.team.budget + contract.amount,
            },
        });
        return { message: 'Player removed from team' };
    }
    async setCaptain(teamId, playerId) {
        if (playerId) {
            const contract = await database_1.default.contract.findFirst({
                where: {
                    teamId,
                    playerId,
                    isActive: true,
                },
            });
            if (!contract) {
                throw new errorHandler_1.AppError('Player must be in the team squad to be captain', 400);
            }
        }
        const team = await database_1.default.team.update({
            where: { id: teamId },
            data: { captainId: playerId },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                contracts: {
                    where: { isActive: true },
                    include: {
                        player: true,
                    },
                },
            },
        });
        return team;
    }
    async setViceCaptain(teamId, playerId) {
        if (playerId) {
            const contract = await database_1.default.contract.findFirst({
                where: {
                    teamId,
                    playerId,
                    isActive: true,
                },
            });
            if (!contract) {
                throw new errorHandler_1.AppError('Player must be in the team squad to be vice-captain', 400);
            }
        }
        const team = await database_1.default.team.update({
            where: { id: teamId },
            data: { viceCaptainId: playerId },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                contracts: {
                    where: { isActive: true },
                    include: {
                        player: true,
                    },
                },
            },
        });
        return team;
    }
}
exports.TeamService = TeamService;
//# sourceMappingURL=team.service.js.map