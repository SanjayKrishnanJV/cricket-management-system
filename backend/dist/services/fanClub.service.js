"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fanClubService = exports.FanClubService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class FanClubService {
    async createFanClub(playerId, name, description, badge) {
        const existing = await database_1.default.fanClub.findUnique({
            where: { playerId },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Fan club already exists for this player', 400);
        }
        const player = await database_1.default.player.findUnique({
            where: { id: playerId },
        });
        if (!player) {
            throw new errorHandler_1.AppError('Player not found', 404);
        }
        const fanClub = await database_1.default.fanClub.create({
            data: {
                playerId,
                name,
                description,
                badge,
            },
            include: {
                player: true,
            },
        });
        return {
            success: true,
            data: fanClub,
        };
    }
    async joinFanClub(userId, fanClubId) {
        const existing = await database_1.default.fanClubMember.findUnique({
            where: {
                userId_fanClubId: {
                    userId,
                    fanClubId,
                },
            },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Already a member of this fan club', 400);
        }
        const [member] = await database_1.default.$transaction([
            database_1.default.fanClubMember.create({
                data: {
                    userId,
                    fanClubId,
                },
                include: {
                    fanClub: {
                        include: {
                            player: true,
                        },
                    },
                },
            }),
            database_1.default.fanClub.update({
                where: { id: fanClubId },
                data: {
                    memberCount: {
                        increment: 1,
                    },
                },
            }),
        ]);
        return {
            success: true,
            data: member,
            message: `Joined ${member.fanClub.name} successfully!`,
        };
    }
    async leaveFanClub(userId, fanClubId) {
        const member = await database_1.default.fanClubMember.findUnique({
            where: {
                userId_fanClubId: {
                    userId,
                    fanClubId,
                },
            },
        });
        if (!member) {
            throw new errorHandler_1.AppError('Not a member of this fan club', 400);
        }
        await database_1.default.$transaction([
            database_1.default.fanClubMember.delete({
                where: {
                    userId_fanClubId: {
                        userId,
                        fanClubId,
                    },
                },
            }),
            database_1.default.fanClub.update({
                where: { id: fanClubId },
                data: {
                    memberCount: {
                        decrement: 1,
                    },
                },
            }),
        ]);
        return {
            success: true,
            message: 'Left fan club successfully',
        };
    }
    async getFanClubByPlayer(playerId) {
        const fanClub = await database_1.default.fanClub.findUnique({
            where: { playerId },
            include: {
                player: true,
                members: {
                    take: 10,
                    orderBy: {
                        points: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            success: true,
            data: fanClub,
        };
    }
    async getAllFanClubs() {
        const fanClubs = await database_1.default.fanClub.findMany({
            include: {
                player: true,
            },
            orderBy: {
                memberCount: 'desc',
            },
        });
        return {
            success: true,
            data: fanClubs,
        };
    }
    async getUserMemberships(userId) {
        const memberships = await database_1.default.fanClubMember.findMany({
            where: { userId },
            include: {
                fanClub: {
                    include: {
                        player: true,
                    },
                },
            },
            orderBy: {
                joinedAt: 'desc',
            },
        });
        return {
            success: true,
            data: memberships,
        };
    }
    async getFanClubLeaderboard(fanClubId, limit = 50) {
        const members = await database_1.default.fanClubMember.findMany({
            where: { fanClubId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                points: 'desc',
            },
            take: limit,
        });
        const leaderboard = members.map((member, index) => ({
            ...member,
            rank: index + 1,
        }));
        return {
            success: true,
            data: leaderboard,
        };
    }
    async addMemberPoints(userId, fanClubId, points) {
        const member = await database_1.default.fanClubMember.update({
            where: {
                userId_fanClubId: {
                    userId,
                    fanClubId,
                },
            },
            data: {
                points: {
                    increment: points,
                },
            },
        });
        return {
            success: true,
            data: member,
        };
    }
}
exports.FanClubService = FanClubService;
exports.fanClubService = new FanClubService();
//# sourceMappingURL=fanClub.service.js.map