export declare class AuctionService {
    placeBid(playerId: string, bidderId: string, amount: number): Promise<{
        id: string;
        playerId: string;
        timestamp: Date;
        amount: number;
        bidderId: string;
        isWinning: boolean;
    }>;
    getCurrentBids(playerId: string): Promise<({
        bidder: {
            name: string;
            ownedTeams: {
                name: string;
                shortName: string;
            }[];
        };
    } & {
        id: string;
        playerId: string;
        timestamp: Date;
        amount: number;
        bidderId: string;
        isWinning: boolean;
    })[]>;
    getHighestBid(playerId: string): Promise<{
        bidder: {
            name: string;
            ownedTeams: {
                name: string;
                shortName: string;
            }[];
        };
    } & {
        id: string;
        playerId: string;
        timestamp: Date;
        amount: number;
        bidderId: string;
        isWinning: boolean;
    }>;
    sellPlayer(playerId: string): Promise<{
        contract: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            playerId: string;
            teamId: string;
            amount: number;
            isActive: boolean;
        };
        soldTo: string;
        amount: number;
    }>;
    getAvailablePlayers(): Promise<({
        auctionBids: ({
            bidder: {
                name: string;
                ownedTeams: {
                    name: string;
                }[];
            };
        } & {
            id: string;
            playerId: string;
            timestamp: Date;
            amount: number;
            bidderId: string;
            isWinning: boolean;
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
    resetAuction(playerId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auction.service.d.ts.map