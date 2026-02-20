"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.administrationController = exports.AdministrationController = void 0;
const administration_service_1 = require("../services/administration.service");
class AdministrationController {
    async createDRSReview(req, res, next) {
        try {
            const { matchId } = req.params;
            const review = await administration_service_1.administrationService.createDRSReview({
                matchId,
                ...req.body,
            });
            res.status(201).json({ status: 'success', data: review });
        }
        catch (error) {
            next(error);
        }
    }
    async getDRSReviewsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const reviews = await administration_service_1.administrationService.getDRSReviewsByMatch(matchId);
            res.status(200).json({ status: 'success', data: reviews });
        }
        catch (error) {
            next(error);
        }
    }
    async updateDRSDecision(req, res, next) {
        try {
            const { reviewId } = req.params;
            const review = await administration_service_1.administrationService.updateDRSDecision(reviewId, req.body);
            res.status(200).json({ status: 'success', data: review });
        }
        catch (error) {
            next(error);
        }
    }
    async getDRSStats(req, res, next) {
        try {
            const { matchId } = req.params;
            const stats = await administration_service_1.administrationService.getDRSStats(matchId);
            res.status(200).json({ status: 'success', data: stats });
        }
        catch (error) {
            next(error);
        }
    }
    async recordInjury(req, res, next) {
        try {
            const injury = await administration_service_1.administrationService.recordInjury(req.body);
            res.status(201).json({ status: 'success', data: injury });
        }
        catch (error) {
            next(error);
        }
    }
    async updateInjury(req, res, next) {
        try {
            const { injuryId } = req.params;
            const injury = await administration_service_1.administrationService.updateInjury(injuryId, req.body);
            res.status(200).json({ status: 'success', data: injury });
        }
        catch (error) {
            next(error);
        }
    }
    async getInjuriesByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const injuries = await administration_service_1.administrationService.getInjuriesByMatch(matchId);
            res.status(200).json({ status: 'success', data: injuries });
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveInjuries(req, res, next) {
        try {
            const injuries = await administration_service_1.administrationService.getActiveInjuries();
            res.status(200).json({ status: 'success', data: injuries });
        }
        catch (error) {
            next(error);
        }
    }
    async createSubstitution(req, res, next) {
        try {
            const substitution = await administration_service_1.administrationService.createSubstitution(req.body);
            res.status(201).json({ status: 'success', data: substitution });
        }
        catch (error) {
            next(error);
        }
    }
    async endSubstitution(req, res, next) {
        try {
            const { substituteId } = req.params;
            const substitution = await administration_service_1.administrationService.endSubstitution(substituteId);
            res.status(200).json({ status: 'success', data: substitution });
        }
        catch (error) {
            next(error);
        }
    }
    async getSubstitutionsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const substitutions = await administration_service_1.administrationService.getSubstitutionsByMatch(matchId);
            res.status(200).json({ status: 'success', data: substitutions });
        }
        catch (error) {
            next(error);
        }
    }
    async recordWeather(req, res, next) {
        try {
            const weather = await administration_service_1.administrationService.recordWeather(req.body);
            res.status(201).json({ status: 'success', data: weather });
        }
        catch (error) {
            next(error);
        }
    }
    async getWeatherByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const weather = await administration_service_1.administrationService.getWeatherByMatch(matchId);
            res.status(200).json({ status: 'success', data: weather });
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentWeather(req, res, next) {
        try {
            const { matchId } = req.params;
            const weather = await administration_service_1.administrationService.getCurrentWeather(matchId);
            res.status(200).json({ status: 'success', data: weather });
        }
        catch (error) {
            next(error);
        }
    }
    async recordPitchCondition(req, res, next) {
        try {
            const pitch = await administration_service_1.administrationService.recordPitchCondition(req.body);
            res.status(201).json({ status: 'success', data: pitch });
        }
        catch (error) {
            next(error);
        }
    }
    async getPitchConditionsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const pitch = await administration_service_1.administrationService.getPitchConditionsByMatch(matchId);
            res.status(200).json({ status: 'success', data: pitch });
        }
        catch (error) {
            next(error);
        }
    }
    async calculateDLS(req, res, next) {
        try {
            const dls = await administration_service_1.administrationService.calculateDLS(req.body);
            res.status(201).json({ status: 'success', data: dls });
        }
        catch (error) {
            next(error);
        }
    }
    async getDLSCalculationsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const dls = await administration_service_1.administrationService.getDLSCalculationsByMatch(matchId);
            res.status(200).json({ status: 'success', data: dls });
        }
        catch (error) {
            next(error);
        }
    }
    async createRefereeReport(req, res, next) {
        try {
            const report = await administration_service_1.administrationService.createRefereeReport(req.body);
            res.status(201).json({ status: 'success', data: report });
        }
        catch (error) {
            next(error);
        }
    }
    async updateRefereeReport(req, res, next) {
        try {
            const { reportId } = req.params;
            const report = await administration_service_1.administrationService.updateRefereeReport(reportId, req.body);
            res.status(200).json({ status: 'success', data: report });
        }
        catch (error) {
            next(error);
        }
    }
    async getRefereeReport(req, res, next) {
        try {
            const { matchId } = req.params;
            const report = await administration_service_1.administrationService.getRefereeReport(matchId);
            res.status(200).json({ status: 'success', data: report });
        }
        catch (error) {
            next(error);
        }
    }
    async submitReport(req, res, next) {
        try {
            const { reportId } = req.params;
            const report = await administration_service_1.administrationService.submitReport(reportId);
            res.status(200).json({ status: 'success', data: report });
        }
        catch (error) {
            next(error);
        }
    }
    async recordIncident(req, res, next) {
        try {
            const incident = await administration_service_1.administrationService.recordIncident(req.body);
            res.status(201).json({ status: 'success', data: incident });
        }
        catch (error) {
            next(error);
        }
    }
    async updateIncident(req, res, next) {
        try {
            const { incidentId } = req.params;
            const incident = await administration_service_1.administrationService.updateIncident(incidentId, req.body);
            res.status(200).json({ status: 'success', data: incident });
        }
        catch (error) {
            next(error);
        }
    }
    async getIncidentsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const incidents = await administration_service_1.administrationService.getIncidentsByMatch(matchId);
            res.status(200).json({ status: 'success', data: incidents });
        }
        catch (error) {
            next(error);
        }
    }
    async recordViolation(req, res, next) {
        try {
            const violation = await administration_service_1.administrationService.recordViolation(req.body);
            res.status(201).json({ status: 'success', data: violation });
        }
        catch (error) {
            next(error);
        }
    }
    async updateViolation(req, res, next) {
        try {
            const { violationId } = req.params;
            const violation = await administration_service_1.administrationService.updateViolation(violationId, req.body);
            res.status(200).json({ status: 'success', data: violation });
        }
        catch (error) {
            next(error);
        }
    }
    async getViolationsByMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const violations = await administration_service_1.administrationService.getViolationsByMatch(matchId);
            res.status(200).json({ status: 'success', data: violations });
        }
        catch (error) {
            next(error);
        }
    }
    async getViolationsByPlayer(req, res, next) {
        try {
            const { playerId } = req.params;
            const violations = await administration_service_1.administrationService.getViolationsByPlayer(playerId);
            res.status(200).json({ status: 'success', data: violations });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdministrationController = AdministrationController;
exports.administrationController = new AdministrationController();
//# sourceMappingURL=administration.controller.js.map