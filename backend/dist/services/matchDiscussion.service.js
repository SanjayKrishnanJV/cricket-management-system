"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchDiscussionService = exports.MatchDiscussionService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class MatchDiscussionService {
    async postComment(matchId, userId, message, replyToId) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        if (replyToId) {
            const parentComment = await database_1.default.matchComment.findUnique({
                where: { id: replyToId },
            });
            if (!parentComment) {
                throw new errorHandler_1.AppError('Parent comment not found', 404);
            }
            if (parentComment.matchId !== matchId) {
                throw new errorHandler_1.AppError('Parent comment is from a different match', 400);
            }
        }
        const comment = await database_1.default.matchComment.create({
            data: {
                matchId,
                userId,
                message,
                replyToId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reactions: true,
            },
        });
        return {
            success: true,
            data: comment,
        };
    }
    async getMatchComments(matchId, limit = 100, offset = 0) {
        const comments = await database_1.default.matchComment.findMany({
            where: {
                matchId,
                replyToId: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        reactions: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: [
                {
                    isPinned: 'desc',
                },
                {
                    createdAt: 'desc',
                },
            ],
            skip: offset,
            take: limit,
        });
        const totalComments = await database_1.default.matchComment.count({
            where: {
                matchId,
                replyToId: null,
            },
        });
        return {
            success: true,
            data: {
                comments,
                total: totalComments,
                hasMore: offset + limit < totalComments,
            },
        };
    }
    async addReaction(commentId, userId, emoji) {
        const existing = await database_1.default.commentReaction.findUnique({
            where: {
                commentId_userId_emoji: {
                    commentId,
                    userId,
                    emoji,
                },
            },
        });
        if (existing) {
            await database_1.default.commentReaction.delete({
                where: { id: existing.id },
            });
            return {
                success: true,
                action: 'removed',
                message: 'Reaction removed',
            };
        }
        const reaction = await database_1.default.commentReaction.create({
            data: {
                commentId,
                userId,
                emoji,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return {
            success: true,
            action: 'added',
            data: reaction,
        };
    }
    async updateKarma(commentId, action) {
        const increment = action === 'upvote' ? 1 : -1;
        const comment = await database_1.default.matchComment.update({
            where: { id: commentId },
            data: {
                karma: {
                    increment,
                },
            },
        });
        return {
            success: true,
            data: comment,
        };
    }
    async togglePin(commentId) {
        const comment = await database_1.default.matchComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new errorHandler_1.AppError('Comment not found', 404);
        }
        const updated = await database_1.default.matchComment.update({
            where: { id: commentId },
            data: {
                isPinned: !comment.isPinned,
            },
        });
        return {
            success: true,
            data: updated,
            message: updated.isPinned ? 'Comment pinned' : 'Comment unpinned',
        };
    }
    async deleteComment(commentId, userId) {
        const comment = await database_1.default.matchComment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            throw new errorHandler_1.AppError('Comment not found', 404);
        }
        if (comment.userId !== userId) {
            throw new errorHandler_1.AppError('Not authorized to delete this comment', 403);
        }
        await database_1.default.matchComment.delete({
            where: { id: commentId },
        });
        return {
            success: true,
            message: 'Comment deleted',
        };
    }
    async getTopComments(matchId, limit = 10) {
        const comments = await database_1.default.matchComment.findMany({
            where: { matchId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                reactions: true,
            },
            orderBy: {
                karma: 'desc',
            },
            take: limit,
        });
        return {
            success: true,
            data: comments,
        };
    }
}
exports.MatchDiscussionService = MatchDiscussionService;
exports.matchDiscussionService = new MatchDiscussionService();
//# sourceMappingURL=matchDiscussion.service.js.map