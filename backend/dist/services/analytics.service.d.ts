export declare class AnalyticsService {
    getMatchAnalytics(matchId: string): Promise<any>;
    getPlayerAnalytics(playerId: string): Promise<{
        player: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.PlayerRole;
            totalMatches: number;
            totalRuns: number;
            totalWickets: number;
            battingAverage: number;
            strikeRate: number;
            bowlingAverage: number;
            economyRate: number;
            highestScore: number;
        };
        battingByMatch: {
            matchDate: Date;
            venue: string;
            runs: number;
            balls: number;
            strikeRate: number;
        }[];
        bowlingByMatch: {
            matchDate: Date;
            venue: string;
            wickets: number;
            runs: number;
            overs: number;
            economyRate: number;
        }[];
    }>;
    getTeamAnalytics(teamId: string): Promise<{
        team: {
            id: string;
            name: string;
            shortName: string;
        };
        stats: {
            matchesPlayed: number;
            wins: number;
            losses: number;
            winPercentage: number;
            recentForm: ("W" | "L")[];
        };
        teamStats: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            totalMatches: number;
            totalRuns: number;
            totalWickets: number;
            highestScore: number;
            teamId: string;
            matchesWon: number;
            matchesLost: number;
            lowestScore: number | null;
        }[];
    }>;
    getTournamentAnalytics(tournamentId: string): Promise<{
        tournament: {
            id: string;
            name: string;
            format: import(".prisma/client").$Enums.TournamentFormat;
            type: import(".prisma/client").$Enums.TournamentType;
        };
        stats: {
            totalMatches: number;
            topRunScorers: any;
            topWicketTakers: any;
        };
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
    }>;
    getManhattanChart(matchId: string): Promise<{
        matchId: string;
        data: {
            inningsNumber: number;
            teamName: string;
            teamShortName: string;
            overs: {
                overNumber: number;
                runs: number;
                wickets: number;
                isMaiden: boolean;
            }[];
        }[];
    }>;
    getWormChart(matchId: string): Promise<{
        matchId: string;
        data: {
            inningsNumber: number;
            teamName: string;
            teamShortName: string;
            overs: {
                overNumber: number;
                runs: number;
            }[];
        }[];
    }>;
    getPartnershipAnalysis(matchId: string): Promise<{
        matchId: string;
        data: {
            inningsNumber: number;
            teamName: string;
            partnerships: any[];
        }[];
    }>;
    getPhaseAnalysis(matchId: string): Promise<{
        matchId: string;
        format: import(".prisma/client").$Enums.TournamentFormat;
        data: {
            inningsNumber: number;
            teamName: string;
            powerplay: {
                runs: any;
                wickets: number;
                balls: number;
                overs: number;
                runRate: string;
            };
            middle: {
                runs: any;
                wickets: number;
                balls: number;
                overs: number;
                runRate: string;
            };
            death: {
                runs: any;
                wickets: number;
                balls: number;
                overs: number;
                runRate: string;
            };
        }[];
    }>;
    getWagonWheel(matchId: string, filters?: {
        batsmanId?: string;
        bowlerId?: string;
        inningsNumber?: number;
        minRuns?: number;
    }): Promise<{
        matchId: string;
        totalShots: number;
        data: {
            angle: number;
            distance: number;
            runs: number;
            isExtra: boolean;
            zone: string;
            batsman: string;
            bowler: string;
            over: number;
            ball: number;
        }[];
    }>;
    getPitchMap(matchId: string, filters?: {
        bowlerId?: string;
        batsmanId?: string;
        inningsNumber?: number;
    }): Promise<{
        matchId: string;
        totalBalls: number;
        data: {
            x: number;
            y: number;
            line: string;
            length: string;
            runs: number;
            isWicket: boolean;
            wicketType: import(".prisma/client").$Enums.WicketType;
            batsman: string;
            bowler: string;
            over: number;
        }[];
        heatMap: number[][];
    }>;
    private calculatePitchHeatMap;
    getFieldPlacements(matchId: string, overNumber?: number): Promise<{
        matchId: string;
        data: {
            id: string;
            inningsNumber: number;
            overNumber: number;
            ballNumber: number;
            positions: any;
        }[];
    }>;
    saveFieldPlacement(data: {
        matchId: string;
        inningsId: string;
        overNumber: number;
        ballNumber?: number;
        positions: any[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        overNumber: number;
        inningsId: string;
        ballNumber: number | null;
        positions: string;
    }>;
    get3DReplayData(matchId: string, filters?: {
        overNumber?: number;
        ballNumber?: number;
        inningsNumber?: number;
    }): Promise<{
        matchId: string;
        data: {
            id: string;
            inningsNumber: number;
            overNumber: number;
            ballNumber: number;
            bowler: string;
            batsman: string;
            trajectory: any;
            speed: number;
            shotType: string;
            shotAngle: number;
            shotDistance: number;
            runs: number;
            isWicket: boolean;
        }[];
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map