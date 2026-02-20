"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.administrationService = exports.AdministrationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class AdministrationService {
    async createDRSReview(data) {
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        return await database_1.default.dRSReview.create({
            data: {
                ...data,
                status: client_1.DRSStatus.PENDING,
                thirdUmpireDecision: client_1.ThirdUmpireDecision.INCONCLUSIVE,
                finalDecision: data.onFieldDecision,
            },
            include: {
                match: { select: { id: true, venue: true } },
                innings: { select: { id: true, inningsNumber: true } },
            },
        });
    }
    async getDRSReviewsByMatch(matchId) {
        return await database_1.default.dRSReview.findMany({
            where: { matchId },
            include: {},
            orderBy: { reviewedAt: 'desc' },
        });
    }
    async updateDRSDecision(reviewId, data) {
        const review = await database_1.default.dRSReview.findUnique({ where: { id: reviewId } });
        if (!review) {
            throw new errorHandler_1.AppError('DRS Review not found', 404);
        }
        return await database_1.default.dRSReview.update({
            where: { id: reviewId },
            data: data,
            include: {
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async getDRSStats(matchId) {
        const reviews = await database_1.default.dRSReview.findMany({
            where: { matchId },
        });
        const successfulReviews = reviews.filter(r => r.status === client_1.DRSStatus.UPHELD || r.status === client_1.DRSStatus.REVERSED);
        const team1Reviews = reviews.filter(r => r.reviewingTeamId === reviews[0]?.reviewingTeamId);
        const team2Reviews = reviews.filter(r => r.reviewingTeamId !== reviews[0]?.reviewingTeamId);
        return {
            totalReviews: reviews.length,
            successfulReviews: successfulReviews.length,
            successRate: reviews.length > 0 ? (successfulReviews.length / reviews.length) * 100 : 0,
            team1TotalReviews: team1Reviews.length,
            team2TotalReviews: team2Reviews.length,
            team1ReviewsRemaining: Math.max(0, 2 - team1Reviews.length),
            team2ReviewsRemaining: Math.max(0, 2 - team2Reviews.length),
            byType: reviews.reduce((acc, r) => {
                acc[r.drsType] = (acc[r.drsType] || 0) + 1;
                return acc;
            }, {}),
        };
    }
    async recordInjury(data) {
        const player = await database_1.default.player.findUnique({ where: { id: data.playerId } });
        if (!player) {
            throw new errorHandler_1.AppError('Player not found', 404);
        }
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        return await database_1.default.playerInjury.create({
            data: data,
            include: {
                player: { select: { id: true, name: true, role: true } },
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async updateInjury(injuryId, data) {
        const injury = await database_1.default.playerInjury.findUnique({ where: { id: injuryId } });
        if (!injury) {
            throw new errorHandler_1.AppError('Injury record not found', 404);
        }
        return await database_1.default.playerInjury.update({
            where: { id: injuryId },
            data: data,
            include: {
                player: { select: { id: true, name: true, role: true } },
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async getInjuriesByMatch(matchId) {
        return await database_1.default.playerInjury.findMany({
            where: { matchId },
            include: {
                player: { select: { id: true, name: true, role: true } },
            },
            orderBy: { injuredAt: 'desc' },
        });
    }
    async getInjuriesByPlayer(playerId) {
        return await database_1.default.playerInjury.findMany({
            where: { playerId },
            include: {
                match: { select: { id: true, venue: true, matchDate: true } },
            },
            orderBy: { injuredAt: 'desc' },
        });
    }
    async getActiveInjuries() {
        return await database_1.default.playerInjury.findMany({
            where: { status: 'ACTIVE' },
            include: {
                player: { select: { id: true, name: true, role: true } },
                match: { select: { id: true, venue: true, matchDate: true } },
            },
            orderBy: { injuredAt: 'desc' },
        });
    }
    async createSubstitution(data) {
        const replacedPlayer = await database_1.default.player.findUnique({ where: { id: data.replacedPlayerId } });
        if (!replacedPlayer) {
            throw new errorHandler_1.AppError('Replaced player not found', 404);
        }
        const substitutePlayer = await database_1.default.player.findUnique({ where: { id: data.substitutePlayerId } });
        if (!substitutePlayer) {
            throw new errorHandler_1.AppError('Substitute player not found', 404);
        }
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        if (data.substituteType === 'CONCUSSION') {
            if (replacedPlayer.role !== substitutePlayer.role) {
                throw new errorHandler_1.AppError('Concussion substitute must be like-for-like (same player role)', 400);
            }
        }
        return await database_1.default.substitutePlayer.create({
            data: data,
            include: {
                replacedPlayer: { select: { id: true, name: true, role: true } },
                substitutePlayer: { select: { id: true, name: true, role: true } },
                injury: true,
            },
        });
    }
    async endSubstitution(substituteId) {
        const substitute = await database_1.default.substitutePlayer.findUnique({ where: { id: substituteId } });
        if (!substitute) {
            throw new errorHandler_1.AppError('Substitution record not found', 404);
        }
        if (substitute.endedAt) {
            throw new errorHandler_1.AppError('Substitution has already ended', 400);
        }
        return await database_1.default.substitutePlayer.update({
            where: { id: substituteId },
            data: { endedAt: new Date() },
            include: {
                replacedPlayer: { select: { id: true, name: true } },
                substitutePlayer: { select: { id: true, name: true } },
            },
        });
    }
    async getSubstitutionsByMatch(matchId) {
        return await database_1.default.substitutePlayer.findMany({
            where: { matchId },
            include: {
                replacedPlayer: { select: { id: true, name: true, role: true } },
                substitutePlayer: { select: { id: true, name: true, role: true } },
                injury: true,
            },
            orderBy: { substitutedAt: 'desc' },
        });
    }
    async recordWeather(data) {
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        return await database_1.default.weatherRecord.create({
            data: data,
            include: {
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async getWeatherByMatch(matchId) {
        return await database_1.default.weatherRecord.findMany({
            where: { matchId },
            orderBy: { recordedAt: 'desc' },
        });
    }
    async getCurrentWeather(matchId) {
        return await database_1.default.weatherRecord.findFirst({
            where: { matchId },
            orderBy: { recordedAt: 'desc' },
        });
    }
    async recordPitchCondition(data) {
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        return await database_1.default.pitchRecord.create({
            data: data,
            include: {
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async getPitchConditionsByMatch(matchId) {
        return await database_1.default.pitchRecord.findMany({
            where: { matchId },
            orderBy: { assessedAt: 'desc' },
        });
    }
    async getCurrentPitchCondition(matchId) {
        return await database_1.default.pitchRecord.findFirst({
            where: { matchId },
            orderBy: { assessedAt: 'desc' },
        });
    }
    async calculateDLS(data) {
        const innings = await database_1.default.innings.findUnique({ where: { id: data.inningsId } });
        if (!innings) {
            throw new errorHandler_1.AppError('Innings not found', 404);
        }
        const resourcesAvailable = 100 - (data.oversLost / data.originalOvers) * 50 - (data.wicketsLost * 7);
        const parScore = Math.round((data.originalTarget * resourcesAvailable) / 100);
        const revisedTarget = parScore + 1;
        const revisedOvers = data.originalOvers - data.oversLost;
        return await database_1.default.dLSCalculation.create({
            data: {
                ...data,
                resourcesAvailable,
                parScore,
                revisedTarget,
                revisedOvers,
                dlsVersion: data.dlsVersion || 'Standard',
            },
            include: {
                match: { select: { id: true, venue: true } },
            },
        });
    }
    async getDLSCalculationsByMatch(matchId) {
        return await database_1.default.dLSCalculation.findMany({
            where: { matchId },
            include: {},
            orderBy: { calculatedAt: 'desc' },
        });
    }
    async createRefereeReport(data) {
        const match = await database_1.default.match.findUnique({ where: { id: data.matchId } });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        const existing = await database_1.default.matchRefereeReport.findUnique({
            where: { matchId: data.matchId },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Referee report already exists for this match', 400);
        }
        return await database_1.default.matchRefereeReport.create({
            data: data,
            include: {
                match: { select: { id: true, venue: true, matchDate: true } },
            },
        });
    }
    async updateRefereeReport(reportId, data) {
        const report = await database_1.default.matchRefereeReport.findUnique({ where: { id: reportId } });
        if (!report) {
            throw new errorHandler_1.AppError('Referee report not found', 404);
        }
        return await database_1.default.matchRefereeReport.update({
            where: { id: reportId },
            data,
            include: {
                match: { select: { id: true, venue: true } },
                incidents: true,
                violations: true,
            },
        });
    }
    async getRefereeReport(matchId) {
        return await database_1.default.matchRefereeReport.findUnique({
            where: { matchId },
            include: {
                match: { select: { id: true, venue: true, matchDate: true } },
                incidents: {
                    orderBy: { occurredAt: 'desc' },
                },
                violations: {
                    include: {
                        player: { select: { id: true, name: true } },
                    },
                    orderBy: { occurredAt: 'desc' },
                },
            },
        });
    }
    async submitReport(reportId) {
        const report = await database_1.default.matchRefereeReport.findUnique({ where: { id: reportId } });
        if (!report) {
            throw new errorHandler_1.AppError('Referee report not found', 404);
        }
        if (report.status !== 'DRAFT') {
            throw new errorHandler_1.AppError('Report has already been submitted', 400);
        }
        return await database_1.default.matchRefereeReport.update({
            where: { id: reportId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
            },
        });
    }
    async recordIncident(data) {
        const report = await database_1.default.matchRefereeReport.findUnique({ where: { id: data.reportId } });
        if (!report) {
            throw new errorHandler_1.AppError('Referee report not found', 404);
        }
        return await database_1.default.matchIncident.create({
            data: data,
            include: {
                match: { select: { id: true, venue: true } },
                report: { select: { id: true, refereeName: true } },
            },
        });
    }
    async updateIncident(incidentId, data) {
        const incident = await database_1.default.matchIncident.findUnique({ where: { id: incidentId } });
        if (!incident) {
            throw new errorHandler_1.AppError('Incident not found', 404);
        }
        return await database_1.default.matchIncident.update({
            where: { id: incidentId },
            data,
        });
    }
    async getIncidentsByMatch(matchId) {
        return await database_1.default.matchIncident.findMany({
            where: { matchId },
            include: {
                report: { select: { refereeName: true } },
            },
            orderBy: { occurredAt: 'desc' },
        });
    }
    async recordViolation(data) {
        const report = await database_1.default.matchRefereeReport.findUnique({ where: { id: data.reportId } });
        if (!report) {
            throw new errorHandler_1.AppError('Referee report not found', 404);
        }
        return await database_1.default.codeViolation.create({
            data: {
                ...data,
                penaltyPoints: data.penaltyPoints || 0,
                matchBan: data.matchBan || 0,
            },
            include: {
                match: { select: { id: true, venue: true } },
                report: { select: { id: true, refereeName: true } },
                player: { select: { id: true, name: true } },
            },
        });
    }
    async updateViolation(violationId, data) {
        const violation = await database_1.default.codeViolation.findUnique({ where: { id: violationId } });
        if (!violation) {
            throw new errorHandler_1.AppError('Code violation not found', 404);
        }
        return await database_1.default.codeViolation.update({
            where: { id: violationId },
            data,
            include: {
                match: { select: { id: true, venue: true } },
                report: { select: { id: true, refereeName: true } },
                player: { select: { id: true, name: true } },
            },
        });
    }
    async getViolationsByMatch(matchId) {
        return await database_1.default.codeViolation.findMany({
            where: { matchId },
            include: {
                match: { select: { id: true, venue: true } },
                report: { select: { id: true, refereeName: true } },
                player: { select: { id: true, name: true } },
            },
            orderBy: { occurredAt: 'desc' },
        });
    }
    async getViolationsByPlayer(playerId) {
        return await database_1.default.codeViolation.findMany({
            where: { playerId },
            include: {
                match: { select: { id: true, venue: true, matchDate: true } },
                report: { select: { id: true, refereeName: true } },
                player: { select: { id: true, name: true } },
            },
            orderBy: { occurredAt: 'desc' },
        });
    }
}
exports.AdministrationService = AdministrationService;
exports.administrationService = new AdministrationService();
//# sourceMappingURL=administration.service.js.map