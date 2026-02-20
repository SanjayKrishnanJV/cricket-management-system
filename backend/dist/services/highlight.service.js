"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightService = exports.HighlightService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class HighlightService {
    async createHighlight(matchId, userId, title, category, description, ballId, tags) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        if (ballId) {
            const ball = await database_1.default.ball.findUnique({
                where: { id: ballId },
            });
            if (!ball) {
                throw new errorHandler_1.AppError('Ball not found', 404);
            }
        }
        const highlight = await database_1.default.highlight.create({
            data: {
                matchId,
                userId,
                title,
                description,
                category,
                ballId,
                tags: tags
                    ? {
                        create: tags.map((tag) => ({
                            tag,
                        })),
                    }
                    : undefined,
            },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
                ball: {
                    include: {
                        batsman: true,
                        bowler: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
            },
        });
        return {
            success: true,
            data: highlight,
            message: 'Highlight created successfully',
        };
    }
    async getMatchHighlights(matchId, category) {
        const highlights = await database_1.default.highlight.findMany({
            where: {
                matchId,
                isPublic: true,
                ...(category && { category }),
            },
            include: {
                ball: {
                    include: {
                        batsman: true,
                        bowler: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
            },
            orderBy: [
                {
                    viewCount: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
        });
        return {
            success: true,
            data: highlights,
        };
    }
    async getHighlight(highlightId) {
        const highlight = await database_1.default.highlight.findUnique({
            where: { id: highlightId },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
                ball: {
                    include: {
                        batsman: true,
                        bowler: true,
                        innings: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
            },
        });
        if (!highlight) {
            throw new errorHandler_1.AppError('Highlight not found', 404);
        }
        await database_1.default.highlight.update({
            where: { id: highlightId },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
        return {
            success: true,
            data: highlight,
        };
    }
    async getUserHighlights(userId) {
        const highlights = await database_1.default.highlight.findMany({
            where: { userId },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
                ball: true,
                tags: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            success: true,
            data: highlights,
        };
    }
    async getTrendingHighlights(limit = 20) {
        const highlights = await database_1.default.highlight.findMany({
            where: {
                isPublic: true,
            },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
                ball: {
                    include: {
                        batsman: true,
                        bowler: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
            },
            orderBy: [
                {
                    shareCount: 'desc',
                },
                {
                    viewCount: 'desc',
                },
            ],
            take: limit,
        });
        return {
            success: true,
            data: highlights,
        };
    }
    async searchByTag(tag) {
        const highlights = await database_1.default.highlight.findMany({
            where: {
                isPublic: true,
                tags: {
                    some: {
                        tag: {
                            contains: tag,
                            mode: 'insensitive',
                        },
                    },
                },
            },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
                ball: {
                    include: {
                        batsman: true,
                        bowler: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            success: true,
            data: highlights,
        };
    }
    async shareHighlight(highlightId) {
        const highlight = await database_1.default.highlight.update({
            where: { id: highlightId },
            data: {
                shareCount: {
                    increment: 1,
                },
            },
        });
        return {
            success: true,
            data: highlight,
            message: 'Highlight shared',
        };
    }
    async toggleVisibility(highlightId, userId) {
        const highlight = await database_1.default.highlight.findUnique({
            where: { id: highlightId },
        });
        if (!highlight) {
            throw new errorHandler_1.AppError('Highlight not found', 404);
        }
        if (highlight.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to edit this highlight', 403);
        }
        const updated = await database_1.default.highlight.update({
            where: { id: highlightId },
            data: {
                isPublic: !highlight.isPublic,
            },
        });
        return {
            success: true,
            data: updated,
            message: updated.isPublic ? 'Highlight is now public' : 'Highlight is now private',
        };
    }
    async deleteHighlight(highlightId, userId) {
        const highlight = await database_1.default.highlight.findUnique({
            where: { id: highlightId },
        });
        if (!highlight) {
            throw new errorHandler_1.AppError('Highlight not found', 404);
        }
        if (highlight.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to delete this highlight', 403);
        }
        await database_1.default.highlight.delete({
            where: { id: highlightId },
        });
        return {
            success: true,
            message: 'Highlight deleted',
        };
    }
    async getHighlightStats(matchId) {
        const stats = await database_1.default.highlight.groupBy({
            by: ['category'],
            where: { matchId },
            _count: {
                id: true,
            },
            _sum: {
                viewCount: true,
                shareCount: true,
            },
        });
        const totalHighlights = stats.reduce((sum, s) => sum + s._count.id, 0);
        const totalViews = stats.reduce((sum, s) => sum + (s._sum.viewCount || 0), 0);
        const totalShares = stats.reduce((sum, s) => sum + (s._sum.shareCount || 0), 0);
        return {
            success: true,
            data: {
                totalHighlights,
                totalViews,
                totalShares,
                byCategory: stats.map((s) => ({
                    category: s.category,
                    count: s._count.id,
                    views: s._sum.viewCount || 0,
                    shares: s._sum.shareCount || 0,
                })),
            },
        };
    }
}
exports.HighlightService = HighlightService;
exports.highlightService = new HighlightService();
//# sourceMappingURL=highlight.service.js.map