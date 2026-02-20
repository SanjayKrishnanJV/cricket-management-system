export declare class PerformancePredictionService {
    predictPerformance(matchId: string, playerId: string): Promise<{
        success: boolean;
        data: {
            factors: any;
            id: string;
            matchId: string;
            playerId: string;
            confidence: number;
            predictedAt: Date;
            expectedRuns: number | null;
            expectedBalls: number | null;
            expectedSR: number | null;
            boundaryProb: number | null;
            expectedWickets: number | null;
            expectedOvers: number | null;
            expectedEconomy: number | null;
            wicketProb: number | null;
        };
    }>;
    private predictBatting;
    private predictBowling;
    private calculateFormTrend;
    private calculateBowlingFormTrend;
    private calculateConfidence;
    private calculateVariance;
    private generateFactors;
    getPerformancePrediction(matchId: string, playerId: string): Promise<{
        success: boolean;
        data: {
            factors: any;
            id: string;
            matchId: string;
            playerId: string;
            confidence: number;
            predictedAt: Date;
            expectedRuns: number | null;
            expectedBalls: number | null;
            expectedSR: number | null;
            boundaryProb: number | null;
            expectedWickets: number | null;
            expectedOvers: number | null;
            expectedEconomy: number | null;
            wicketProb: number | null;
        };
    }>;
    getMatchPredictions(matchId: string): Promise<{
        success: boolean;
        data: {
            factors: any;
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
            id: string;
            matchId: string;
            playerId: string;
            confidence: number;
            predictedAt: Date;
            expectedRuns: number | null;
            expectedBalls: number | null;
            expectedSR: number | null;
            boundaryProb: number | null;
            expectedWickets: number | null;
            expectedOvers: number | null;
            expectedEconomy: number | null;
            wicketProb: number | null;
        }[];
    }>;
}
export declare const performancePredictionService: PerformancePredictionService;
//# sourceMappingURL=performancePrediction.service.d.ts.map