export declare class TeamService {
    createTeam(data: {
        name: string;
        shortName: string;
        logoUrl?: string;
        primaryColor?: string;
        budget?: number;
        ownerId: string;
    }): Promise<{
        owner: {
            name: string;
            id: string;
            email: string;
        };
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
    }>;
    getAllTeams(): Promise<({
        owner: {
            name: string;
            email: string;
        };
        contracts: ({
            player: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.PlayerRole;
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
    })[]>;
    getTeamById(id: string): Promise<{
        captain: any;
        viceCaptain: any;
        owner: {
            name: string;
            email: string;
        };
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
        homeMatches: ({
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
        awayMatches: ({
            homeTeam: {
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
    }>;
    updateTeam(id: string, data: any): Promise<{
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
    }>;
    deleteTeam(id: string): Promise<{
        message: string;
    }>;
    getTeamSquad(teamId: string): Promise<{
        batsmen: ({
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
        bowlers: ({
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
        allRounders: ({
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
        wicketkeepers: ({
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
    }>;
    addPlayerToTeam(teamId: string, playerId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date;
        playerId: string;
        teamId: string;
        amount: number;
        isActive: boolean;
    }>;
    removePlayerFromTeam(contractId: string): Promise<{
        message: string;
    }>;
    setCaptain(teamId: string, playerId: string | null): Promise<{
        owner: {
            name: string;
            email: string;
        };
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
    }>;
    setViceCaptain(teamId: string, playerId: string | null): Promise<{
        owner: {
            name: string;
            email: string;
        };
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
    }>;
}
//# sourceMappingURL=team.service.d.ts.map