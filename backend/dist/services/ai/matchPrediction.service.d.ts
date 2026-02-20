export declare class MatchPredictionService {
    predictMatch(matchId: string): Promise<{
        success: boolean;
        data: {
            headToHead: any;
            factors: any;
            id: string;
            matchId: string;
            team1WinProb: number;
            team2WinProb: number;
            tieDrawProb: number;
            team1Form: number | null;
            team2Form: number | null;
            venueAdvantage: number | null;
            tossAdvantage: number | null;
            weatherImpact: number | null;
            confidence: number;
            modelVersion: string;
            predictedAt: Date;
        };
    }>;
    private calculateTeamForm;
    private calculateVenueAdvantage;
    private getHeadToHead;
    private calculateWinProbabilities;
    private calculateConfidence;
    getMatchPrediction(matchId: string): Promise<{
        success: boolean;
        data: {
            headToHead: any;
            factors: any;
            id: string;
            matchId: string;
            team1WinProb: number;
            team2WinProb: number;
            tieDrawProb: number;
            team1Form: number | null;
            team2Form: number | null;
            venueAdvantage: number | null;
            tossAdvantage: number | null;
            weatherImpact: number | null;
            confidence: number;
            modelVersion: string;
            predictedAt: Date;
        };
    }>;
    getAllPredictions(limit?: number): Promise<{
        success: boolean;
        data: {
            headToHead: any;
            factors: any;
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
            id: string;
            matchId: string;
            team1WinProb: number;
            team2WinProb: number;
            tieDrawProb: number;
            team1Form: number | null;
            team2Form: number | null;
            venueAdvantage: number | null;
            tossAdvantage: number | null;
            weatherImpact: number | null;
            confidence: number;
            modelVersion: string;
            predictedAt: Date;
        }[];
    }>;
}
export declare const matchPredictionService: MatchPredictionService;
//# sourceMappingURL=matchPrediction.service.d.ts.map