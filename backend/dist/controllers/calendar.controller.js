"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTournamentIcal = exports.exportMatchIcal = void 0;
const calendar_service_1 = require("../services/calendar.service");
const exportMatchIcal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const icalData = await calendar_service_1.calendarService.generateICalForMatch(id);
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="match-${id}.ics"`);
        res.send(icalData);
    }
    catch (error) {
        next(error);
    }
};
exports.exportMatchIcal = exportMatchIcal;
const exportTournamentIcal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const icalData = await calendar_service_1.calendarService.generateICalForTournament(id);
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="tournament-${id}.ics"`);
        res.send(icalData);
    }
    catch (error) {
        next(error);
    }
};
exports.exportTournamentIcal = exportTournamentIcal;
//# sourceMappingURL=calendar.controller.js.map