"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const auction_service_1 = require("../services/auction.service");
const auctionService = new auction_service_1.AuctionService();
class AuctionController {
    async placeBid(req, res, next) {
        try {
            const { playerId, amount } = req.body;
            const bid = await auctionService.placeBid(playerId, req.user.id, amount);
            res.status(201).json({
                status: 'success',
                data: bid,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentBids(req, res, next) {
        try {
            const bids = await auctionService.getCurrentBids(req.params.playerId);
            res.status(200).json({
                status: 'success',
                data: bids,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getHighestBid(req, res, next) {
        try {
            const bid = await auctionService.getHighestBid(req.params.playerId);
            res.status(200).json({
                status: 'success',
                data: bid,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sellPlayer(req, res, next) {
        try {
            const result = await auctionService.sellPlayer(req.params.playerId);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAvailablePlayers(req, res, next) {
        try {
            const players = await auctionService.getAvailablePlayers();
            res.status(200).json({
                status: 'success',
                data: players,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetAuction(req, res, next) {
        try {
            await auctionService.resetAuction(req.params.playerId);
            res.status(200).json({
                status: 'success',
                message: 'Auction reset successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuctionController = AuctionController;
//# sourceMappingURL=auction.controller.js.map