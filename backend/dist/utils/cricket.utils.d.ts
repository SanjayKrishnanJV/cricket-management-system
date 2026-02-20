export declare class CricketUtils {
    static calculateStrikeRate(runs: number, balls: number): number;
    static calculateBattingAverage(runs: number, dismissals: number): number;
    static calculateBowlingAverage(runs: number, wickets: number): number;
    static calculateEconomyRate(runs: number, overs: number): number;
    static calculateNetRunRate(runsScored: number, oversPlayed: number, runsConceded: number, oversFaced: number): number;
    static ballsToOvers(balls: number): number;
    static oversToBalls(overs: number): number;
    static calculateCurrentRunRate(runs: number, overs: number): number;
    static calculateRequiredRunRate(target: number, currentRuns: number, oversRemaining: number): number;
    static isPowerplay(overNumber: number, format: string): boolean;
    static isDeathOvers(overNumber: number, format: string): boolean;
    static calculateProjectedScore(currentRuns: number, currentOvers: number, totalOvers: number): number;
    static generateResultText(winningTeamName: string, losingTeamName: string, margin: number, isWicketMargin: boolean, isDraw?: boolean): string;
    static calculateWinProbability(target: number, currentRuns: number, wicketsLost: number, oversRemaining: number): number;
    static determineManOfMatch(performances: {
        playerId: string;
        runs?: number;
        wickets?: number;
        economyRate?: number;
        strikeRate?: number;
    }[]): string | null;
}
//# sourceMappingURL=cricket.utils.d.ts.map