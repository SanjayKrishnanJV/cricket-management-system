export declare class InjuryRiskService {
    assessInjuryRisk(playerId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            oversPerMatch: number;
            age: number | null;
            ballsBowled: number;
            playerId: string;
            riskLevel: string;
            riskScore: number;
            matchesPlayed: number;
            restDays: number;
            injuryHistory: string | null;
            workloadTrend: string | null;
            recommendation: string | null;
            daysToRest: number | null;
            assessedAt: Date;
        };
    }>;
    private calculateWorkloadMetrics;
    private calculateRiskScore;
    private determineRiskLevel;
    private analyzeWorkloadTrend;
    private generateRecommendation;
    private calculateRestDays;
    private buildInjuryHistory;
    getInjuryRisk(playerId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            oversPerMatch: number;
            age: number | null;
            ballsBowled: number;
            playerId: string;
            riskLevel: string;
            riskScore: number;
            matchesPlayed: number;
            restDays: number;
            injuryHistory: string | null;
            workloadTrend: string | null;
            recommendation: string | null;
            daysToRest: number | null;
            assessedAt: Date;
        };
    }>;
    getHighRiskPlayers(): Promise<{
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
            id: string;
            oversPerMatch: number;
            age: number | null;
            ballsBowled: number;
            playerId: string;
            riskLevel: string;
            riskScore: number;
            matchesPlayed: number;
            restDays: number;
            injuryHistory: string | null;
            workloadTrend: string | null;
            recommendation: string | null;
            daysToRest: number | null;
            assessedAt: Date;
        })[];
    }>;
    getInjuryRiskTrends(playerId: string, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            oversPerMatch: number;
            age: number | null;
            ballsBowled: number;
            playerId: string;
            riskLevel: string;
            riskScore: number;
            matchesPlayed: number;
            restDays: number;
            injuryHistory: string | null;
            workloadTrend: string | null;
            recommendation: string | null;
            daysToRest: number | null;
            assessedAt: Date;
        }[];
    }>;
}
export declare const injuryRiskService: InjuryRiskService;
//# sourceMappingURL=injuryRisk.service.d.ts.map