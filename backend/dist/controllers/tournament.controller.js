"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentController = void 0;
const tournament_service_1 = require("../services/tournament.service");
const tournamentService = new tournament_service_1.TournamentService();
class TournamentController {
    async createTournament(req, res, next) {
        try {
            const data = {
                ...req.body,
                adminId: req.user.id,
            };
            const tournament = await tournamentService.createTournament(data);
            res.status(201).json({
                status: 'success',
                data: tournament,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllTournaments(req, res, next) {
        try {
            const tournaments = await tournamentService.getAllTournaments();
            res.status(200).json({
                status: 'success',
                data: tournaments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTournamentById(req, res, next) {
        try {
            const tournament = await tournamentService.getTournamentById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: tournament,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTournament(req, res, next) {
        try {
            const tournament = await tournamentService.updateTournament(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: tournament,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTournament(req, res, next) {
        try {
            await tournamentService.deleteTournament(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Tournament deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addTeamToTournament(req, res, next) {
        try {
            const { teamId } = req.body;
            const result = await tournamentService.addTeamToTournament(req.params.id, teamId);
            res.status(201).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generateFixtures(req, res, next) {
        try {
            const matches = await tournamentService.generateFixtures(req.params.id);
            res.status(201).json({
                status: 'success',
                data: matches,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPointsTable(req, res, next) {
        try {
            const pointsTable = await tournamentService.getPointsTable(req.params.id);
            res.status(200).json({
                status: 'success',
                data: pointsTable,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TournamentController = TournamentController;
//# sourceMappingURL=tournament.controller.js.map