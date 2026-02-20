"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const match_service_1 = require("../services/match.service");
const pdf_utils_1 = require("../utils/pdf.utils");
const cache_service_1 = require("../services/cache.service");
const upload_service_1 = require("../services/upload.service");
const matchService = new match_service_1.MatchService();
class MatchController {
    async createMatch(req, res, next) {
        try {
            const match = await matchService.createMatch(req.body);
            res.status(201).json({
                status: 'success',
                data: match,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllMatches(req, res, next) {
        try {
            const filters = {
                tournamentId: req.query.tournamentId,
                teamId: req.query.teamId,
                status: req.query.status,
            };
            const matches = await matchService.getAllMatches(filters);
            res.status(200).json({
                status: 'success',
                data: matches,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMatchById(req, res, next) {
        try {
            const match = await matchService.getMatchById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: match,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateMatch(req, res, next) {
        try {
            const match = await matchService.updateMatch(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: match,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMatch(req, res, next) {
        try {
            await matchService.deleteMatch(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Match deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelMatch(req, res, next) {
        try {
            const match = await matchService.cancelMatch(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Match cancelled successfully',
                data: match,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async recordToss(req, res, next) {
        try {
            const { tossWinnerId, tossDecision } = req.body;
            const result = await matchService.recordToss(req.params.id, tossWinnerId, tossDecision);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async startInnings(req, res, next) {
        try {
            const { inningsNumber } = req.body;
            const innings = await matchService.startInnings(req.params.id, inningsNumber);
            res.status(201).json({
                status: 'success',
                data: innings,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async recordBall(req, res, next) {
        try {
            const { inningsId, bowlerId, batsmanId, ...ballData } = req.body;
            const ball = await matchService.recordBall(inningsId, bowlerId, batsmanId, ballData);
            res.status(201).json({
                status: 'success',
                data: ball,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async completeInnings(req, res, next) {
        try {
            const { inningsId } = req.body;
            await matchService.completeInnings(inningsId);
            res.status(200).json({
                status: 'success',
                message: 'Innings completed',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async completeMatch(req, res, next) {
        try {
            const result = await matchService.completeMatch(req.params.id);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getLiveScore(req, res, next) {
        try {
            const liveScore = await matchService.getLiveScore(req.params.id);
            res.status(200).json({
                status: 'success',
                data: liveScore,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async exportScorecardPDF(req, res, next) {
        try {
            const matchId = req.params.id;
            const cacheKey = `pdf:scorecard:${matchId}`;
            const cachedPdfUrl = await cache_service_1.cacheService.get(cacheKey);
            if (cachedPdfUrl) {
                console.log('📄 Returning cached PDF for match:', matchId);
                return res.status(200).json({
                    status: 'success',
                    data: { url: cachedPdfUrl },
                });
            }
            const match = await matchService.getMatchById(matchId);
            if (!match.innings || match.innings.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Match has no innings data. Cannot generate scorecard.',
                });
            }
            let tossWinnerName = null;
            if (match.tossWinnerId) {
                tossWinnerName = match.tossWinnerId === match.homeTeamId
                    ? match.homeTeam?.name
                    : match.awayTeam?.name;
            }
            const matchData = {
                homeTeam: match.homeTeam?.name || 'Team A',
                awayTeam: match.awayTeam?.name || 'Team B',
                venue: match.venue || 'Unknown Venue',
                matchDate: match.matchDate,
                format: match.tournament?.format || 'T20',
                tossWinner: tossWinnerName,
                tossDecision: match.tossDecision || null,
                resultText: match.resultText || null,
                manOfMatch: match.manOfMatch || 'N/A',
                innings: match.innings.map((innings) => ({
                    battingTeam: innings.battingTeam?.name || 'Unknown Team',
                    totalRuns: innings.totalRuns || 0,
                    totalWickets: innings.totalWickets || 0,
                    totalOvers: innings.totalOvers || 0,
                    extras: innings.extras || 0,
                    wides: innings.wides || 0,
                    noBalls: innings.noBalls || 0,
                    byes: innings.byes || 0,
                    legByes: innings.legByes || 0,
                    battingPerformances: (innings.battingPerformances || []).map((perf) => ({
                        playerName: perf.player?.name || 'Unknown Player',
                        runs: perf.runs || 0,
                        ballsFaced: perf.ballsFaced || 0,
                        fours: perf.fours || 0,
                        sixes: perf.sixes || 0,
                        strikeRate: perf.strikeRate || 0,
                    })),
                    bowlingPerformances: (innings.bowlingPerformances || []).map((perf) => ({
                        playerName: perf.player?.name || 'Unknown Player',
                        oversBowled: perf.oversBowled || 0,
                        maidens: perf.maidens || 0,
                        runsConceded: perf.runsConceded || 0,
                        wickets: perf.wickets || 0,
                        economyRate: perf.economyRate || 0,
                    })),
                })),
            };
            console.log('📄 Generating PDF for match:', matchId);
            const pdfBuffer = await pdf_utils_1.PDFUtils.generateScorecard(matchData);
            console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
            const pdfUrl = await upload_service_1.uploadService.uploadScorecard(pdfBuffer, matchId);
            console.log('☁️  PDF uploaded to:', pdfUrl);
            await cache_service_1.cacheService.set(cacheKey, pdfUrl, 3600);
            res.status(200).json({
                status: 'success',
                data: { url: pdfUrl },
            });
        }
        catch (error) {
            console.error('PDF Generation Error:', error);
            next(error);
        }
    }
    async getAllLiveMatches(req, res, next) {
        try {
            const matches = await matchService.getAllLiveMatches();
            res.status(200).json({
                status: 'success',
                data: matches,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MatchController = MatchController;
//# sourceMappingURL=match.controller.js.map