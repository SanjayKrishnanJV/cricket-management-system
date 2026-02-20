export class CricketUtils {
  /**
   * Calculate strike rate
   */
  static calculateStrikeRate(runs: number, balls: number): number {
    if (balls === 0) return 0;
    return parseFloat(((runs / balls) * 100).toFixed(2));
  }

  /**
   * Calculate batting average
   */
  static calculateBattingAverage(runs: number, dismissals: number): number {
    if (dismissals === 0) return runs;
    return parseFloat((runs / dismissals).toFixed(2));
  }

  /**
   * Calculate bowling average
   */
  static calculateBowlingAverage(runs: number, wickets: number): number {
    if (wickets === 0) return 0;
    return parseFloat((runs / wickets).toFixed(2));
  }

  /**
   * Calculate economy rate
   */
  static calculateEconomyRate(runs: number, overs: number): number {
    if (overs === 0) return 0;
    return parseFloat((runs / overs).toFixed(2));
  }

  /**
   * Calculate net run rate
   */
  static calculateNetRunRate(
    runsScored: number,
    oversPlayed: number,
    runsConceded: number,
    oversFaced: number
  ): number {
    if (oversPlayed === 0 || oversFaced === 0) return 0;
    const runRate = runsScored / oversPlayed;
    const runRateConceded = runsConceded / oversFaced;
    return parseFloat((runRate - runRateConceded).toFixed(3));
  }

  /**
   * Convert balls to overs (e.g., 38 balls = 6.2 overs)
   */
  static ballsToOvers(balls: number): number {
    const completeOvers = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return parseFloat(`${completeOvers}.${remainingBalls}`);
  }

  /**
   * Convert overs to balls (e.g., 6.2 overs = 38 balls)
   */
  static oversToBalls(overs: number): number {
    const oversStr = overs.toString();
    const [completeOvers, balls] = oversStr.split('.').map(Number);
    return completeOvers * 6 + (balls || 0);
  }

  /**
   * Calculate current run rate
   */
  static calculateCurrentRunRate(runs: number, overs: number): number {
    if (overs === 0) return 0;
    return parseFloat((runs / overs).toFixed(2));
  }

  /**
   * Calculate required run rate
   */
  static calculateRequiredRunRate(
    target: number,
    currentRuns: number,
    oversRemaining: number
  ): number {
    if (oversRemaining === 0) return 0;
    const runsNeeded = target - currentRuns;
    return parseFloat((runsNeeded / oversRemaining).toFixed(2));
  }

  /**
   * Determine if ball is in powerplay
   */
  static isPowerplay(overNumber: number, format: string): boolean {
    if (format === 'T20') return overNumber < 6;
    if (format === 'ODI') return overNumber < 10;
    return false;
  }

  /**
   * Determine if ball is in death overs
   */
  static isDeathOvers(overNumber: number, format: string): boolean {
    if (format === 'T20') return overNumber >= 16;
    if (format === 'ODI') return overNumber >= 40;
    return false;
  }

  /**
   * Calculate projected score
   */
  static calculateProjectedScore(
    currentRuns: number,
    currentOvers: number,
    totalOvers: number
  ): number {
    if (currentOvers === 0) return 0;
    const runRate = currentRuns / currentOvers;
    return Math.round(runRate * totalOvers);
  }

  /**
   * Generate result text
   */
  static generateResultText(
    winningTeamName: string,
    losingTeamName: string,
    margin: number,
    isWicketMargin: boolean,
    isDraw: boolean = false
  ): string {
    if (isDraw) return 'Match Drawn';

    if (isWicketMargin) {
      return `${winningTeamName} won by ${margin} wicket${margin > 1 ? 's' : ''}`;
    } else {
      return `${winningTeamName} won by ${margin} runs`;
    }
  }

  /**
   * Calculate win probability (basic model)
   */
  static calculateWinProbability(
    target: number,
    currentRuns: number,
    wicketsLost: number,
    oversRemaining: number
  ): number {
    if (target === 0) return 50; // First innings

    const runsNeeded = target - currentRuns;
    const wicketsInHand = 10 - wicketsLost;
    const requiredRunRate = oversRemaining > 0 ? runsNeeded / oversRemaining : 0;

    // Simple probability model
    let probability = 50;

    if (runsNeeded <= 0) return 100;
    if (wicketsInHand === 0) return 0;
    if (oversRemaining === 0) return 0;

    // Factor in wickets
    probability += (wicketsInHand - 5) * 5;

    // Factor in required run rate
    if (requiredRunRate < 6) probability += 20;
    else if (requiredRunRate < 8) probability += 10;
    else if (requiredRunRate < 10) probability -= 10;
    else probability -= 20;

    // Factor in runs needed
    if (runsNeeded < 20) probability += 15;
    else if (runsNeeded < 50) probability += 10;
    else if (runsNeeded > 100) probability -= 10;

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Determine Man of the Match (basic algorithm)
   */
  static determineManOfMatch(performances: {
    playerId: string;
    runs?: number;
    wickets?: number;
    economyRate?: number;
    strikeRate?: number;
  }[]): string | null {
    if (performances.length === 0) return null;

    let maxScore = 0;
    let manOfMatch = performances[0].playerId;

    performances.forEach(perf => {
      let score = 0;

      // Runs contribution
      if (perf.runs) score += perf.runs * 1.5;

      // Wickets contribution
      if (perf.wickets) score += perf.wickets * 25;

      // Strike rate bonus
      if (perf.strikeRate && perf.strikeRate > 150) score += 20;

      // Economy rate bonus
      if (perf.economyRate && perf.economyRate < 6) score += 15;

      if (score > maxScore) {
        maxScore = score;
        manOfMatch = perf.playerId;
      }
    });

    return manOfMatch;
  }
}
