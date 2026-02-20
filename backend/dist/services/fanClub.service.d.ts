export declare class FanClubService {
    createFanClub(playerId: string, name: string, description?: string, badge?: string): Promise<{
        success: boolean;
        data: {
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            playerId: string;
            badge: string | null;
            memberCount: number;
        };
    }>;
    joinFanClub(userId: string, fanClubId: string): Promise<{
        success: boolean;
        data: {
            fanClub: {
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                playerId: string;
                badge: string | null;
                memberCount: number;
            };
        } & {
            userId: string;
            points: number;
            fanClubId: string;
            joinedAt: Date;
            rank: number | null;
        };
        message: string;
    }>;
    leaveFanClub(userId: string, fanClubId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFanClubByPlayer(playerId: string): Promise<{
        success: boolean;
        data: {
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
            members: ({
                user: {
                    name: string;
                    id: string;
                    email: string;
                };
            } & {
                userId: string;
                points: number;
                fanClubId: string;
                joinedAt: Date;
                rank: number | null;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            playerId: string;
            badge: string | null;
            memberCount: number;
        };
    }>;
    getAllFanClubs(): Promise<{
        success: boolean;
        data: ({
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            playerId: string;
            badge: string | null;
            memberCount: number;
        })[];
    }>;
    getUserMemberships(userId: string): Promise<{
        success: boolean;
        data: ({
            fanClub: {
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
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                playerId: string;
                badge: string | null;
                memberCount: number;
            };
        } & {
            userId: string;
            points: number;
            fanClubId: string;
            joinedAt: Date;
            rank: number | null;
        })[];
    }>;
    getFanClubLeaderboard(fanClubId: string, limit?: number): Promise<{
        success: boolean;
        data: {
            rank: number;
            user: {
                name: string;
                id: string;
                email: string;
            };
            userId: string;
            points: number;
            fanClubId: string;
            joinedAt: Date;
        }[];
    }>;
    addMemberPoints(userId: string, fanClubId: string, points: number): Promise<{
        success: boolean;
        data: {
            userId: string;
            points: number;
            fanClubId: string;
            joinedAt: Date;
            rank: number | null;
        };
    }>;
}
export declare const fanClubService: FanClubService;
//# sourceMappingURL=fanClub.service.d.ts.map