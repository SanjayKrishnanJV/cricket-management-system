export declare class WinPredictorService {
    calculateWinProbability(matchId: string, inningsId: string, overNumber: number, ballNumber: number): Promise<{
        success: boolean;
        data: {
            id: string;
            matchId: string;
            overNumber: number;
            inningsId: string | null;
            ballNumber: number;
            target: number | null;
            requiredRunRate: number | null;
            team1Probability: number;
            team2Probability: number;
            tieDrawProbability: number;
            currentScore: number;
            wicketsLost: number;
            ballsRemaining: number;
            calculatedAt: Date;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    private calculateFirstInningsProbability;
    private calculateSecondInningsProbability;
    getWinProbabilityHistory(matchId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            matchId: string;
            overNumber: number;
            inningsId: string | null;
            ballNumber: number;
            target: number | null;
            requiredRunRate: number | null;
            team1Probability: number;
            team2Probability: number;
            tieDrawProbability: number;
            currentScore: number;
            wicketsLost: number;
            ballsRemaining: number;
            calculatedAt: Date;
        }[];
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getLatestWinProbability(matchId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            matchId: string;
            overNumber: number;
            inningsId: string | null;
            ballNumber: number;
            target: number | null;
            requiredRunRate: number | null;
            team1Probability: number;
            team2Probability: number;
            tieDrawProbability: number;
            currentScore: number;
            wicketsLost: number;
            ballsRemaining: number;
            calculatedAt: Date;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
export declare const winPredictorService: WinPredictorService;
//# sourceMappingURL=winPredictor.service.d.ts.map