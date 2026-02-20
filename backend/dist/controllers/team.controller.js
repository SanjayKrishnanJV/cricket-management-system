"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const team_service_1 = require("../services/team.service");
const teamService = new team_service_1.TeamService();
class TeamController {
    async createTeam(req, res, next) {
        try {
            const data = {
                ...req.body,
                ownerId: req.user.id,
            };
            const team = await teamService.createTeam(data);
            res.status(201).json({
                status: 'success',
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllTeams(req, res, next) {
        try {
            const teams = await teamService.getAllTeams();
            res.status(200).json({
                status: 'success',
                data: teams,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTeamById(req, res, next) {
        try {
            const team = await teamService.getTeamById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTeam(req, res, next) {
        try {
            const team = await teamService.updateTeam(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTeam(req, res, next) {
        try {
            await teamService.deleteTeam(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Team deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTeamSquad(req, res, next) {
        try {
            const squad = await teamService.getTeamSquad(req.params.id);
            res.status(200).json({
                status: 'success',
                data: squad,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addPlayerToTeam(req, res, next) {
        try {
            const { playerId, amount } = req.body;
            const contract = await teamService.addPlayerToTeam(req.params.id, playerId, amount);
            res.status(201).json({
                status: 'success',
                data: contract,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removePlayerFromTeam(req, res, next) {
        try {
            await teamService.removePlayerFromTeam(req.params.contractId);
            res.status(200).json({
                status: 'success',
                message: 'Player removed from team',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async setCaptain(req, res, next) {
        try {
            const { playerId } = req.body;
            const team = await teamService.setCaptain(req.params.id, playerId);
            res.status(200).json({
                status: 'success',
                message: 'Captain set successfully',
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async setViceCaptain(req, res, next) {
        try {
            const { playerId } = req.body;
            const team = await teamService.setViceCaptain(req.params.id, playerId);
            res.status(200).json({
                status: 'success',
                message: 'Vice-captain set successfully',
                data: team,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeamController = TeamController;
//# sourceMappingURL=team.controller.js.map