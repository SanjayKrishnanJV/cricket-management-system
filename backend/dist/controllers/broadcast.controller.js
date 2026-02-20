"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastController = exports.BroadcastController = void 0;
const broadcast_service_1 = require("../services/broadcast.service");
class BroadcastController {
    async createVideoHighlight(req, res, next) {
        try {
            const highlight = await broadcast_service_1.broadcastService.createVideoHighlight({
                matchId: req.params.matchId,
                ...req.body,
            });
            res.status(201).json({ status: 'success', data: highlight });
        }
        catch (error) {
            next(error);
        }
    }
    async getVideoHighlights(req, res, next) {
        try {
            const highlights = await broadcast_service_1.broadcastService.getVideoHighlights(req.params.matchId, req.query);
            res.json({ status: 'success', data: highlights });
        }
        catch (error) {
            next(error);
        }
    }
    async linkBallToVideo(req, res, next) {
        try {
            const { videoId, timestamp } = req.body;
            const result = await broadcast_service_1.broadcastService.linkBallToVideo(req.params.ballId, videoId, timestamp);
            res.json({ status: 'success', data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async autoGenerateHighlights(req, res, next) {
        try {
            const result = await broadcast_service_1.broadcastService.autoGenerateHighlights(req.params.matchId);
            res.json({ status: 'success', data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async setupLiveStream(req, res, next) {
        try {
            const stream = await broadcast_service_1.broadcastService.setupLiveStream(req.params.matchId, req.body);
            res.status(201).json({ status: 'success', data: stream });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStreamStatus(req, res, next) {
        try {
            const { status } = req.body;
            const stream = await broadcast_service_1.broadcastService.updateStreamStatus(req.params.matchId, status);
            res.json({ status: 'success', data: stream });
        }
        catch (error) {
            next(error);
        }
    }
    async getStreamInfo(req, res, next) {
        try {
            const stream = await broadcast_service_1.broadcastService.getStreamInfo(req.params.matchId);
            if (!stream) {
                return res.status(404).json({ status: 'error', message: 'Live stream not found' });
            }
            res.json({ status: 'success', data: stream });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStreamAnalytics(req, res, next) {
        try {
            const { viewers } = req.body;
            const stream = await broadcast_service_1.broadcastService.updateStreamAnalytics(req.params.matchId, viewers);
            res.json({ status: 'success', data: stream });
        }
        catch (error) {
            next(error);
        }
    }
    async generatePodcast(req, res, next) {
        try {
            const podcast = await broadcast_service_1.broadcastService.generateMatchPodcast(req.params.matchId, req.body);
            res.status(201).json({ status: 'success', data: podcast });
        }
        catch (error) {
            next(error);
        }
    }
    async getPodcastStatus(req, res, next) {
        try {
            const podcast = await broadcast_service_1.broadcastService.getPodcastStatus(req.params.podcastId);
            if (!podcast) {
                return res.status(404).json({ status: 'error', message: 'Podcast not found' });
            }
            res.json({ status: 'success', data: podcast });
        }
        catch (error) {
            next(error);
        }
    }
    async publishPodcast(req, res, next) {
        try {
            const podcast = await broadcast_service_1.broadcastService.publishPodcast(req.params.podcastId);
            res.json({ status: 'success', data: podcast });
        }
        catch (error) {
            next(error);
        }
    }
    async getMatchPodcasts(req, res, next) {
        try {
            const podcasts = await broadcast_service_1.broadcastService.getMatchPodcasts(req.params.matchId);
            res.json({ status: 'success', data: podcasts });
        }
        catch (error) {
            next(error);
        }
    }
    async getBroadcasterSettings(req, res, next) {
        try {
            const settings = await broadcast_service_1.broadcastService.getBroadcasterSettings(req.params.matchId);
            res.json({ status: 'success', data: settings });
        }
        catch (error) {
            next(error);
        }
    }
    async updateBroadcasterSettings(req, res, next) {
        try {
            const settings = await broadcast_service_1.broadcastService.updateBroadcasterSettings(req.params.matchId, req.body);
            res.json({ status: 'success', data: settings });
        }
        catch (error) {
            next(error);
        }
    }
    async getTalkingPoints(req, res, next) {
        try {
            const points = await broadcast_service_1.broadcastService.getTalkingPoints(req.params.matchId);
            res.json({ status: 'success', data: points });
        }
        catch (error) {
            next(error);
        }
    }
    async generateTalkingPoints(req, res, next) {
        try {
            const { overNumber } = req.body;
            const points = await broadcast_service_1.broadcastService.generateTalkingPoints(req.params.matchId, overNumber);
            res.json({ status: 'success', data: points });
        }
        catch (error) {
            next(error);
        }
    }
    async markTalkingPointUsed(req, res, next) {
        try {
            const point = await broadcast_service_1.broadcastService.markTalkingPointUsed(req.params.pointId);
            res.json({ status: 'success', data: point });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BroadcastController = BroadcastController;
exports.broadcastController = new BroadcastController();
//# sourceMappingURL=broadcast.controller.js.map