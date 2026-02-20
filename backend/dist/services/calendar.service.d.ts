declare class CalendarService {
    private oauth2Client;
    constructor();
    generateICalForMatch(matchId: string): Promise<string>;
    generateICalForTournament(tournamentId: string): Promise<string>;
}
export declare const calendarService: CalendarService;
export {};
//# sourceMappingURL=calendar.service.d.ts.map