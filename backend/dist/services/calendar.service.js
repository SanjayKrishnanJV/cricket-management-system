"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarService = void 0;
const googleapis_1 = require("googleapis");
const ical_js_1 = __importDefault(require("ical.js"));
const database_1 = __importDefault(require("../config/database"));
class CalendarService {
    constructor() {
        this.oauth2Client = null;
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
            console.log('✅ Google Calendar integration initialized');
        }
        else {
            console.log('ℹ️  Google Calendar not configured');
        }
    }
    async generateICalForMatch(matchId) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                tournament: true,
            },
        });
        if (!match)
            throw new Error('Match not found');
        const comp = new ical_js_1.default.Component(['vcalendar', [], []]);
        comp.updatePropertyWithValue('prodid', '-//Cricket Management System//EN');
        comp.updatePropertyWithValue('version', '2.0');
        const vevent = new ical_js_1.default.Component('vevent');
        const event = new ical_js_1.default.Event(vevent);
        event.summary = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
        event.description = `${match.tournament.name} - ${match.tournament.format} match\nVenue: ${match.venue}`;
        event.location = match.venue;
        event.startDate = ical_js_1.default.Time.fromJSDate(match.matchDate, false);
        event.endDate = ical_js_1.default.Time.fromJSDate(new Date(match.matchDate.getTime() + 4 * 60 * 60 * 1000), false);
        event.uid = `match-${match.id}@cricketapp.com`;
        comp.addSubcomponent(vevent);
        return comp.toString();
    }
    async generateICalForTournament(tournamentId) {
        const matches = await database_1.default.match.findMany({
            where: { tournamentId },
            include: {
                homeTeam: true,
                awayTeam: true,
                tournament: true,
            },
            orderBy: { matchDate: 'asc' },
        });
        const comp = new ical_js_1.default.Component(['vcalendar', [], []]);
        comp.updatePropertyWithValue('prodid', '-//Cricket Management System//EN');
        comp.updatePropertyWithValue('version', '2.0');
        for (const match of matches) {
            const vevent = new ical_js_1.default.Component('vevent');
            const event = new ical_js_1.default.Event(vevent);
            event.summary = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
            event.description = `${match.tournament.name} - ${match.tournament.format} match`;
            event.location = match.venue;
            event.startDate = ical_js_1.default.Time.fromJSDate(match.matchDate, false);
            event.endDate = ical_js_1.default.Time.fromJSDate(new Date(match.matchDate.getTime() + 4 * 60 * 60 * 1000), false);
            event.uid = `match-${match.id}@cricketapp.com`;
            comp.addSubcomponent(vevent);
        }
        return comp.toString();
    }
}
exports.calendarService = new CalendarService();
//# sourceMappingURL=calendar.service.js.map