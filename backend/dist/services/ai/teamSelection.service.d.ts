export declare class TeamSelectionService {
    suggestTeam(matchId: string, teamId: string, options?: {
        pitchType?: 'batting' | 'bowling' | 'balanced';
        weather?: 'sunny' | 'overcast' | 'rainy';
        oppositionId?: string;
    }): Promise<{
        success: boolean;
        data: {
            suggestedXI: any[];
            substitutes: any[];
            reasoning: any;
            id: string;
            createdAt: Date;
            matchId: string;
            teamId: string;
            opposition: string | null;
            pitchType: string | null;
            weather: string | null;
            balanceScore: number | null;
            strengthScore: number | null;
            acceptedAt: Date | null;
        };
    }>;
    private selectBestXI;
    private selectBest;
    private calculatePlayerScore;
    private calculateRecentForm;
    private selectSubstitutes;
    private calculateTeamBalance;
    private calculateTeamStrength;
    private generateReasoning;
    private getSelectionReason;
    getTeamSuggestion(matchId: string, teamId: string): Promise<{
        success: boolean;
        data: {
            suggestedXI: any[];
            substitutes: any[];
            reasoning: any;
            id: string;
            createdAt: Date;
            matchId: string;
            teamId: string;
            opposition: string | null;
            pitchType: string | null;
            weather: string | null;
            balanceScore: number | null;
            strengthScore: number | null;
            acceptedAt: Date | null;
        };
    } | {
        success: boolean;
        data: {
            suggestedXI: any;
            substitutes: any;
            reasoning: any;
            match: {
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
            id: string;
            createdAt: Date;
            matchId: string;
            teamId: string;
            opposition: string | null;
            pitchType: string | null;
            weather: string | null;
            balanceScore: number | null;
            strengthScore: number | null;
            acceptedAt: Date | null;
        };
    }>;
}
export declare const teamSelectionService: TeamSelectionService;
//# sourceMappingURL=teamSelection.service.d.ts.map