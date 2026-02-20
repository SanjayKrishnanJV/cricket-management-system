"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialService = exports.SocialService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class SocialService {
    async generateShareImage(matchId, userId, type) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                innings: {
                    include: {
                        battingPerformances: {
                            include: {
                                player: true,
                            },
                        },
                        bowlingPerformances: {
                            include: {
                                player: true,
                            },
                        },
                    },
                },
            },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        let title = '';
        const imageData = {};
        switch (type) {
            case 'scorecard':
                title = `${match.homeTeam.name} vs ${match.awayTeam.name} Scorecard`;
                imageData.type = 'scorecard';
                imageData.homeTeam = match.homeTeam.name;
                imageData.awayTeam = match.awayTeam.name;
                imageData.innings = match.innings.map((inning) => ({
                    totalRuns: inning.totalRuns,
                    totalWickets: inning.totalWickets,
                    totalOvers: inning.totalOvers,
                }));
                break;
            case 'milestone':
                title = `Milestone achieved in ${match.homeTeam.name} vs ${match.awayTeam.name}`;
                imageData.type = 'milestone';
                break;
            case 'summary':
                title = match.resultText || `${match.homeTeam.name} vs ${match.awayTeam.name}`;
                imageData.type = 'summary';
                imageData.result = match.resultText;
                imageData.manOfMatch = match.manOfMatch;
                break;
            case 'highlight':
                title = `Highlight from ${match.homeTeam.name} vs ${match.awayTeam.name}`;
                imageData.type = 'highlight';
                break;
            default:
                title = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
        }
        const shareImage = await database_1.default.shareImage.create({
            data: {
                matchId,
                userId,
                type,
                title,
                imageData: JSON.stringify(imageData),
                shared: false,
            },
        });
        return {
            success: true,
            data: {
                ...shareImage,
                imageData: imageData,
            },
        };
    }
    async markAsShared(shareImageId, platform) {
        const shareImage = await database_1.default.shareImage.update({
            where: { id: shareImageId },
            data: {
                shared: true,
                platform,
            },
        });
        return {
            success: true,
            data: shareImage,
        };
    }
    async getShareHistory(userId, limit = 20) {
        const shareImages = await database_1.default.shareImage.findMany({
            where: { userId },
            include: {
                match: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
        return {
            success: true,
            data: shareImages,
        };
    }
    async getMatchShareStats(matchId) {
        const shares = await database_1.default.shareImage.groupBy({
            by: ['platform'],
            where: {
                matchId,
                shared: true,
            },
            _count: {
                id: true,
            },
        });
        const totalShares = shares.reduce((sum, s) => sum + s._count.id, 0);
        return {
            success: true,
            data: {
                totalShares,
                byPlatform: shares.map((s) => ({
                    platform: s.platform,
                    count: s._count.id,
                })),
            },
        };
    }
}
exports.SocialService = SocialService;
exports.socialService = new SocialService();
//# sourceMappingURL=social.service.js.map