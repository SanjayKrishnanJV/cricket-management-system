export declare class PlayerService {
    createPlayer(data: {
        name: string;
        role: string;
        age: number;
        nationality: string;
        basePrice: number;
        imageUrl?: string;
    }): Promise<{
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
    }>;
    getAllPlayers(filters?: {
        role?: string;
        nationality?: string;
        available?: boolean;
    }): Promise<({
        contracts: ({
            team: {
                name: string;
                shortName: string;
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
    })[]>;
    getPlayerById(id: string): Promise<{
        contracts: ({
            team: {
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
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            playerId: string;
            teamId: string;
            amount: number;
            isActive: boolean;
        })[];
        battingStats: ({
            innings: {
                match: {
                    venue: string;
                    matchDate: Date;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.InningsStatus;
                createdAt: Date;
                updatedAt: Date;
                matchId: string;
                totalRuns: number;
                totalWickets: number;
                inningsNumber: number;
                battingTeamId: string;
                bowlingTeamId: string;
                totalOvers: number;
                extras: number;
                currentStrikerId: string | null;
                currentNonStrikerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            strikeRate: number;
            ballsFaced: number;
            playerId: string;
            teamId: string;
            inningsId: string;
            runs: number;
            fours: number;
            sixes: number;
            isOut: boolean;
            dismissal: string | null;
        })[];
        bowlingStats: ({
            innings: {
                match: {
                    venue: string;
                    matchDate: Date;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.InningsStatus;
                createdAt: Date;
                updatedAt: Date;
                matchId: string;
                totalRuns: number;
                totalWickets: number;
                inningsNumber: number;
                battingTeamId: string;
                bowlingTeamId: string;
                totalOvers: number;
                extras: number;
                currentStrikerId: string | null;
                currentNonStrikerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            economyRate: number;
            playerId: string;
            teamId: string;
            inningsId: string;
            wickets: number;
            oversBowled: number;
            runsConceded: number;
            maidens: number;
        })[];
    } & {
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
    }>;
    updatePlayer(id: string, data: any): Promise<{
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
    }>;
    deletePlayer(id: string): Promise<{
        message: string;
    }>;
    updatePlayerStats(playerId: string): Promise<void>;
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
        recentPerformances: {
            batting: ({
                innings: {
                    match: {
                        venue: string;
                        matchDate: Date;
                        homeTeam: {
                            name: string;
                        };
                        awayTeam: {
                            name: string;
                        };
                    };
                } & {
                    id: string;
                    status: import(".prisma/client").$Enums.InningsStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    matchId: string;
                    totalRuns: number;
                    totalWickets: number;
                    inningsNumber: number;
                    battingTeamId: string;
                    bowlingTeamId: string;
                    totalOvers: number;
                    extras: number;
                    currentStrikerId: string | null;
                    currentNonStrikerId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                strikeRate: number;
                ballsFaced: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                runs: number;
                fours: number;
                sixes: number;
                isOut: boolean;
                dismissal: string | null;
            })[];
            bowling: ({
                innings: {
                    match: {
                        venue: string;
                        matchDate: Date;
                    };
                } & {
                    id: string;
                    status: import(".prisma/client").$Enums.InningsStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    matchId: string;
                    totalRuns: number;
                    totalWickets: number;
                    inningsNumber: number;
                    battingTeamId: string;
                    bowlingTeamId: string;
                    totalOvers: number;
                    extras: number;
                    currentStrikerId: string | null;
                    currentNonStrikerId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                economyRate: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                wickets: number;
                oversBowled: number;
                runsConceded: number;
                maidens: number;
            })[];
        };
    }>;
}
//# sourceMappingURL=player.service.d.ts.map