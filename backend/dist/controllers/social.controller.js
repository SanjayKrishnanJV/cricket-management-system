"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialController = exports.SocialController = void 0;
const social_service_1 = require("../services/social.service");
const fanClub_service_1 = require("../services/fanClub.service");
const matchDiscussion_service_1 = require("../services/matchDiscussion.service");
const highlight_service_1 = require("../services/highlight.service");
class SocialController {
    async generateShareImage(req, res, next) {
        try {
            const { matchId } = req.params;
            const { type } = req.body;
            const userId = req.body.userId || 'system';
            const result = await social_service_1.socialService.generateShareImage(matchId, userId, type);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async markAsShared(req, res, next) {
        try {
            const { shareImageId } = req.params;
            const { platform } = req.body;
            const result = await social_service_1.socialService.markAsShared(shareImageId, platform);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getShareHistory(req, res, next) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 20;
            const result = await social_service_1.socialService.getShareHistory(userId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMatchShareStats(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await social_service_1.socialService.getMatchShareStats(matchId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createFanClub(req, res, next) {
        try {
            const { playerId, name, description, badge } = req.body;
            const result = await fanClub_service_1.fanClubService.createFanClub(playerId, name, description, badge);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async joinFanClub(req, res, next) {
        try {
            const { fanClubId } = req.params;
            const userId = req.body.userId || 'system';
            const result = await fanClub_service_1.fanClubService.joinFanClub(userId, fanClubId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async leaveFanClub(req, res, next) {
        try {
            const { fanClubId } = req.params;
            const userId = req.body.userId || 'system';
            const result = await fanClub_service_1.fanClubService.leaveFanClub(userId, fanClubId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getFanClubByPlayer(req, res, next) {
        try {
            const { playerId } = req.params;
            const result = await fanClub_service_1.fanClubService.getFanClubByPlayer(playerId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllFanClubs(req, res, next) {
        try {
            const result = await fanClub_service_1.fanClubService.getAllFanClubs();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserMemberships(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await fanClub_service_1.fanClubService.getUserMemberships(userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getFanClubLeaderboard(req, res, next) {
        try {
            const { fanClubId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const result = await fanClub_service_1.fanClubService.getFanClubLeaderboard(fanClubId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async postComment(req, res, next) {
        try {
            const { matchId } = req.params;
            const { message, replyToId } = req.body;
            const userId = req.body.userId || 'system';
            const result = await matchDiscussion_service_1.matchDiscussionService.postComment(matchId, userId, message, replyToId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMatchComments(req, res, next) {
        try {
            const { matchId } = req.params;
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const result = await matchDiscussion_service_1.matchDiscussionService.getMatchComments(matchId, limit, offset);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async addReaction(req, res, next) {
        try {
            const { commentId } = req.params;
            const { emoji } = req.body;
            const userId = req.body.userId || 'system';
            const result = await matchDiscussion_service_1.matchDiscussionService.addReaction(commentId, userId, emoji);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateKarma(req, res, next) {
        try {
            const { commentId } = req.params;
            const { action } = req.body;
            const result = await matchDiscussion_service_1.matchDiscussionService.updateKarma(commentId, action);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async togglePin(req, res, next) {
        try {
            const { commentId } = req.params;
            const result = await matchDiscussion_service_1.matchDiscussionService.togglePin(commentId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteComment(req, res, next) {
        try {
            const { commentId } = req.params;
            const userId = req.body.userId || 'system';
            const result = await matchDiscussion_service_1.matchDiscussionService.deleteComment(commentId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTopComments(req, res, next) {
        try {
            const { matchId } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            const result = await matchDiscussion_service_1.matchDiscussionService.getTopComments(matchId, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createHighlight(req, res, next) {
        try {
            const { matchId } = req.params;
            const { title, description, category, ballId, tags } = req.body;
            const userId = req.body.userId || 'system';
            const result = await highlight_service_1.highlightService.createHighlight(matchId, userId, title, category, description, ballId, tags);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMatchHighlights(req, res, next) {
        try {
            const { matchId } = req.params;
            const category = req.query.category;
            const result = await highlight_service_1.highlightService.getMatchHighlights(matchId, category);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getHighlight(req, res, next) {
        try {
            const { highlightId } = req.params;
            const result = await highlight_service_1.highlightService.getHighlight(highlightId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserHighlights(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await highlight_service_1.highlightService.getUserHighlights(userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTrendingHighlights(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const result = await highlight_service_1.highlightService.getTrendingHighlights(limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async searchByTag(req, res, next) {
        try {
            const { tag } = req.query;
            const result = await highlight_service_1.highlightService.searchByTag(tag);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async shareHighlight(req, res, next) {
        try {
            const { highlightId } = req.params;
            const result = await highlight_service_1.highlightService.shareHighlight(highlightId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleVisibility(req, res, next) {
        try {
            const { highlightId } = req.params;
            const userId = req.body.userId || 'system';
            const result = await highlight_service_1.highlightService.toggleVisibility(highlightId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteHighlight(req, res, next) {
        try {
            const { highlightId } = req.params;
            const userId = req.body.userId || 'system';
            const result = await highlight_service_1.highlightService.deleteHighlight(highlightId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getHighlightStats(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await highlight_service_1.highlightService.getHighlightStats(matchId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SocialController = SocialController;
exports.socialController = new SocialController();
//# sourceMappingURL=social.controller.js.map