export declare class TournamentService {
    createTournament(data: {
        name: string;
        format: string;
        type: string;
        startDate: string;
        endDate: string;
        prizePool?: number;
        description?: string;
        adminId: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        format: import(".prisma/client").$Enums.TournamentFormat;
        type: import(".prisma/client").$Enums.TournamentType;
        startDate: Date;
        endDate: Date;
        prizePool: number | null;
        description: string | null;
        adminId: string;
        oversPerMatch: number | null;
        powerplayOvers: number | null;
        maxPlayersPerTeam: number | null;
        minPlayersPerTeam: number | null;
        rules: string | null;
    }>;
    getAllTournaments(): Promise<({
        admin: {
            name: string;
            email: string;
        };
        teams: ({
            team: {
                name: string;
                id: string;
                shortName: string;
                logoUrl: string;
            };
        } & {
            id: string;
            tournamentId: string;
            createdAt: Date;
            teamId: string;
        })[];
        matches: {
            id: string;
            status: import(".prisma/client").$Enums.MatchStatus;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        format: import(".prisma/client").$Enums.TournamentFormat;
        type: import(".prisma/client").$Enums.TournamentType;
        startDate: Date;
        endDate: Date;
        prizePool: number | null;
        description: string | null;
        adminId: string;
        oversPerMatch: number | null;
        powerplayOvers: number | null;
        maxPlayersPerTeam: number | null;
        minPlayersPerTeam: number | null;
        rules: string | null;
    })[]>;
    getTournamentById(id: string): Promise<{
        admin: {
            name: string;
            email: string;
        };
        teams: ({
            team: {
                contracts: ({
                    player: {
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        role: import(".prisma/client").$Enums.PlayerRole;
                        age: number;
                        nationality: string;
                        imageUrl: string | null;
                        basePrice: number;
                        totalMatches: number;
                        totalRuns: number;
                        totalWickets: number;
                        battingAverage: number;
                        bowlingAverage: number;
                        strikeRate: number;
                        economyRate: number;
                        highestScore: number;
                        bestBowlingFigures: string | null;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    startDate: Date;
                    endDate: Date;
                    playerId: string;
                    teamId: string;
                    amount: number;
                    isActive: boolean;
                })[];
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shortName: string;
                logoUrl: string | null;
                primaryColor: string | null;
                budget: number;
                ownerId: string;
                captainId: string | null;
                viceCaptainId: string | null;
            };
        } & {
            id: string;
            tournamentId: string;
            createdAt: Date;
            teamId: string;
        })[];
        matches: ({
            homeTeam: {
                name: string;
                shortName: string;
            };
            awayTeam: {
                name: string;
                shortName: string;
            };
        } & {
            id: string;
            tournamentId: string | null;
            homeTeamId: string;
            awayTeamId: string;
            venue: string;
            matchDate: Date;
            status: import(".prisma/client").$Enums.MatchStatus;
            isQuickMatch: boolean;
            customOvers: number | null;
            tossWinnerId: string | null;
            tossDecision: string | null;
            winnerId: string | null;
            winMargin: string | null;
            resultText: string | null;
            manOfMatch: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pointsTable: {
            id: string;
            tournamentId: string;
            teamId: string;
            runsScored: number;
            runsConceded: number;
            points: number;
            netRunRate: number;
            played: number;
            won: number;
            lost: number;
            tied: number;
            noResult: number;
            oversPlayed: number;
            oversFaced: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        format: import(".prisma/client").$Enums.TournamentFormat;
        type: import(".prisma/client").$Enums.TournamentType;
        startDate: Date;
        endDate: Date;
        prizePool: number | null;
        description: string | null;
        adminId: string;
        oversPerMatch: number | null;
        powerplayOvers: number | null;
        maxPlayersPerTeam: number | null;
        minPlayersPerTeam: number | null;
        rules: string | null;
    }>;
    updateTournament(id: string, data: {
        name?: string;
        format?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        prizePool?: number;
        description?: string;
    }): Promise<{
        admin: {
            name: string;
            email: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        format: import(".prisma/client").$Enums.TournamentFormat;
        type: import(".prisma/client").$Enums.TournamentType;
        startDate: Date;
        endDate: Date;
        prizePool: number | null;
        description: string | null;
        adminId: string;
        oversPerMatch: number | null;
        powerplayOvers: number | null;
        maxPlayersPerTeam: number | null;
        minPlayersPerTeam: number | null;
        rules: string | null;
    }>;
    deleteTournament(id: string): Promise<void>;
    addTeamToTournament(tournamentId: string, teamId: string): Promise<{
        id: string;
        tournamentId: string;
        createdAt: Date;
        teamId: string;
    }>;
    generateFixtures(tournamentId: string): Promise<any[]>;
    getPointsTable(tournamentId: string): Promise<{
        team: {
            name: string;
            shortName: string;
            logoUrl: string;
        };
        id: string;
        tournamentId: string;
        teamId: string;
        runsScored: number;
        runsConceded: number;
        points: number;
        netRunRate: number;
        played: number;
        won: number;
        lost: number;
        tied: number;
        noResult: number;
        oversPlayed: number;
        oversFaced: number;
    }[]>;
    updatePointsTable(tournamentId: string, matchId: string): Promise<void>;
}
//# sourceMappingURL=tournament.service.d.ts.map