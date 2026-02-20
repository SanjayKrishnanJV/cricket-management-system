interface CommentaryContext {
    ballData: {
        runs: number;
        isWicket: boolean;
        wicketType?: string;
        isWide?: boolean;
        isNoBall?: boolean;
        isBye?: boolean;
        isLegBye?: boolean;
        isExtra?: boolean;
        extraType?: string;
    };
    batsman: {
        name: string;
        runs: number;
        ballsFaced: number;
    };
    bowler: {
        name: string;
        oversBowled: number;
        runsConceded: number;
        wickets: number;
    };
    matchSituation: {
        currentRuns: number;
        currentWickets: number;
        overs: number;
        target?: number;
        requiredRunRate?: number;
    };
}
export type CommentaryStyle = 'excited' | 'analytical' | 'neutral' | 'dramatic';
export declare class CommentaryGenerator {
    private styles;
    private currentStyleIndex;
    generateCommentary(context: CommentaryContext, preferredStyle?: CommentaryStyle): string;
    private generateWicketCommentary;
    private generateSixCommentary;
    private generateFourCommentary;
    private generateDotBallCommentary;
    private generateExtraCommentary;
    private generateRunsCommentary;
    private getNextStyle;
    private selectRandomVariation;
    private getOrdinalSuffix;
    generateMilestoneCommentary(type: 'FIFTY' | 'CENTURY' | 'FIVE_WICKETS' | 'HAT_TRICK', playerName: string): string;
}
export declare const commentaryGenerator: CommentaryGenerator;
export {};
//# sourceMappingURL=commentary.generator.d.ts.map