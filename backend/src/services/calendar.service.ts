import { google } from 'googleapis';
import ICAL from 'ical.js';
import prisma from '../config/database';

class CalendarService {
  private oauth2Client: any = null;

  constructor() {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      console.log('✅ Google Calendar integration initialized');
    } else {
      console.log('ℹ️  Google Calendar not configured');
    }
  }

  async generateICalForMatch(matchId: string): Promise<string> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
    });

    if (!match) throw new Error('Match not found');

    const comp = new ICAL.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', '-//Cricket Management System//EN');
    comp.updatePropertyWithValue('version', '2.0');

    const vevent = new ICAL.Component('vevent');
    const event = new ICAL.Event(vevent);

    event.summary = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    event.description = `${match.tournament.name} - ${match.tournament.format} match\nVenue: ${match.venue}`;
    event.location = match.venue;
    event.startDate = ICAL.Time.fromJSDate(match.matchDate, false);
    event.endDate = ICAL.Time.fromJSDate(
      new Date(match.matchDate.getTime() + 4 * 60 * 60 * 1000),
      false
    );
    event.uid = `match-${match.id}@cricketapp.com`;

    comp.addSubcomponent(vevent);

    return comp.toString();
  }

  async generateICalForTournament(tournamentId: string): Promise<string> {
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
      orderBy: { matchDate: 'asc' },
    });

    const comp = new ICAL.Component(['vcalendar', [], []]);
    comp.updatePropertyWithValue('prodid', '-//Cricket Management System//EN');
    comp.updatePropertyWithValue('version', '2.0');

    for (const match of matches) {
      const vevent = new ICAL.Component('vevent');
      const event = new ICAL.Event(vevent);

      event.summary = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
      event.description = `${match.tournament.name} - ${match.tournament.format} match`;
      event.location = match.venue;
      event.startDate = ICAL.Time.fromJSDate(match.matchDate, false);
      event.endDate = ICAL.Time.fromJSDate(
        new Date(match.matchDate.getTime() + 4 * 60 * 60 * 1000),
        false
      );
      event.uid = `match-${match.id}@cricketapp.com`;

      comp.addSubcomponent(vevent);
    }

    return comp.toString();
  }
}

export const calendarService = new CalendarService();
