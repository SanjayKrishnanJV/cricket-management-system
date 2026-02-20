"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const player_service_1 = require("../services/player.service");
const playerService = new player_service_1.PlayerService();
class PlayerController {
    async createPlayer(req, res, next) {
        try {
            const player = await playerService.createPlayer(req.body);
            res.status(201).json({
                status: 'success',
                data: player,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllPlayers(req, res, next) {
        try {
            const filters = {
                role: req.query.role,
                nationality: req.query.nationality,
                available: req.query.available === 'true',
            };
            const players = await playerService.getAllPlayers(filters);
            res.status(200).json({
                status: 'success',
                data: players,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPlayerById(req, res, next) {
        try {
            const player = await playerService.getPlayerById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: player,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePlayer(req, res, next) {
        try {
            const player = await playerService.updatePlayer(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: player,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deletePlayer(req, res, next) {
        try {
            await playerService.deletePlayer(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Player deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPlayerAnalytics(req, res, next) {
        try {
            const analytics = await playerService.getPlayerAnalytics(req.params.id);
            res.status(200).json({
                status: 'success',
                data: analytics,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlayerController = PlayerController;
//# sourceMappingURL=player.controller.js.map