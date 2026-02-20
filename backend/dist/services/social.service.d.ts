export declare class SocialService {
    generateShareImage(matchId: string, userId: string, type: string): Promise<{
        success: boolean;
        data: {
            imageData: any;
            id: string;
            createdAt: Date;
            matchId: string;
            type: string;
            imageUrl: string | null;
            userId: string;
            title: string;
            platform: string | null;
            shared: boolean;
        };
    }>;
    markAsShared(shareImageId: string, platform: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            matchId: string;
            type: string;
            imageUrl: string | null;
            userId: string;
            title: string;
            imageData: string | null;
            platform: string | null;
            shared: boolean;
        };
    }>;
    getShareHistory(userId: string, limit?: number): Promise<{
        success: boolean;
        data: ({
            match: {
                homeTeam: {
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
                awayTeam: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            matchId: string;
            type: string;
            imageUrl: string | null;
            userId: string;
            title: string;
            imageData: string | null;
            platform: string | null;
            shared: boolean;
        })[];
    }>;
    getMatchShareStats(matchId: string): Promise<{
        success: boolean;
        data: {
            totalShares: number;
            byPlatform: {
                platform: string;
                count: number;
            }[];
        };
    }>;
}
export declare const socialService: SocialService;
//# sourceMappingURL=social.service.d.ts.map