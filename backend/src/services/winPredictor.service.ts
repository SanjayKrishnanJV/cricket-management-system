import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WinPredictorService {
  /**
   * Calculate win probability using statistical model
   * Based on current match situation
   */
  async calculateWinProbability(
    matchId: string,
    inningsId: string,
    overNumber: number,
    ballNumber: number
  ) {
    try {
      // Get match details
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: true,
          awayTeam: true,
          innings: {
            include: {
              battingPerformances: true,
              bowlingPerformances: true,
            },
          },
        },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      const currentInnings = match.innings.find((i) => i.id === inningsId);
      if (!currentInnings) {
        throw new Error('Innings not found');
      }

      const inningsNumber = currentInnings.inningsNumber;
      const currentScore = currentInnings.totalRuns;
      const wicketsLost = currentInnings.totalWickets;
      const totalBalls = Math.floor(currentInnings.totalOvers) * 6 + Math.round((currentInnings.totalOvers % 1) * 10);

      // Determine total overs for the match
      const totalOvers = match.customOvers || 20; // Default to T20
      const totalBallsInInnings = totalOvers * 6;
      const ballsRemaining = totalBallsInInnings - totalBalls;

      let team1Probability: number;
      let team2Probability: number;
      let target: number | null = null;
      let requiredRunRate: number | null = null;

      if (inningsNumber === 1) {
        // First innings - predict based on current score and wickets
        team1Probability = this.calculateFirstInningsProbability(
          currentScore,
          wicketsLost,
          ballsRemaining,
          totalBallsInInnings
        );
        team2Probability = 100 - team1Probability;
      } else {
        // Second innings - predict based on target chase
        const firstInnings = match.innings.find((i) => i.inningsNumber === 1);
        if (!firstInnings) {
          throw new Error('First innings not found');
        }

        target = firstInnings.totalRuns + 1;
        const runsNeeded = target - currentScore;
        requiredRunRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 0;

        team2Probability = this.calculateSecondInningsProbability(
          currentScore,
          target,
          wicketsLost,
          ballsRemaining
        );
        team1Probability = 100 - team2Probability;
      }

      // Ensure probabilities are between 0 and 100
      team1Probability = Math.max(0, Math.min(100, team1Probability));
      team2Probability = Math.max(0, Math.min(100, team2Probability));

      // Normalize to ensure they sum to 100
      const total = team1Probability + team2Probability;
      if (total > 0) {
        team1Probability = (team1Probability / total) * 100;
        team2Probability = (team2Probability / total) * 100;
      }

      // Save to database
      const winProbability = await prisma.winProbability.create({
        data: {
          matchId,
          inningsId,
          overNumber,
          ballNumber,
          team1Probability,
          team2Probability,
          tieDrawProbability: 0, // For T20/ODI, tie probability is very low
          currentScore,
          wicketsLost,
          target,
          ballsRemaining,
          requiredRunRate,
        },
      });

      return {
        success: true,
        data: winProbability,
      };
    } catch (error: any) {
      console.error('Error calculating win probability:', error);
      return {
        success: false,
        message: error.message || 'Failed to calculate win probability',
      };
    }
  }

  /**
   * First innings probability calculation
   * Based on current run rate and wickets in hand
   */
  private calculateFirstInningsProbability(
    currentScore: number,
    wicketsLost: number,
    ballsRemaining: number,
    totalBalls: number
  ): number {
    const ballsBowled = totalBalls - ballsRemaining;
    if (ballsBowled === 0) return 50; // Start of innings

    const currentRunRate = (currentScore / ballsBowled) * 6;
    const wicketsInHand = 10 - wicketsLost;

    // Projected total based on current run rate
    const projectedTotal = currentScore + (currentRunRate * ballsRemaining) / 6;

    // Adjust for wickets lost
    // More wickets lost = lower probability of maintaining run rate
    const wicketFactor = wicketsInHand / 10;
    const adjustedProjection = projectedTotal * (0.7 + 0.3 * wicketFactor);

    // Assume average total is 160 for T20
    const averageTotal = 160;
    const advantage = adjustedProjection - averageTotal;

    // Convert advantage to probability
    // Every 10 runs advantage/disadvantage = ~10% probability change
    const probabilityShift = (advantage / 10) * 10;
    const probability = 50 + probabilityShift;

    return probability;
  }

  /**
   * Second innings probability calculation
   * Based on target chase situation
   */
  private calculateSecondInningsProbability(
    currentScore: number,
    target: number,
    wicketsLost: number,
    ballsRemaining: number
  ): number {
    const runsNeeded = target - currentScore;
    const wicketsInHand = 10 - wicketsLost;

    // If already won or lost
    if (currentScore >= target) return 100;
    if (wicketsInHand === 0) return 0;
    if (ballsRemaining === 0) return currentScore >= target ? 100 : 0;

    // Required run rate
    const requiredRunRate = (runsNeeded / ballsRemaining) * 6;

    // Base probability on required run rate
    // RRR <= 6: Very achievable (90%)
    // RRR = 8: Moderate (70%)
    // RRR = 10: Difficult (50%)
    // RRR = 12: Very difficult (30%)
    // RRR >= 15: Nearly impossible (10%)
    let probability: number;

    if (requiredRunRate <= 6) {
      probability = 90 - (6 - requiredRunRate) * 2;
    } else if (requiredRunRate <= 10) {
      probability = 70 - (requiredRunRate - 6) * 5;
    } else if (requiredRunRate <= 12) {
      probability = 50 - (requiredRunRate - 10) * 10;
    } else if (requiredRunRate <= 15) {
      probability = 30 - (requiredRunRate - 12) * 6.67;
    } else {
      probability = 10 - Math.min(10, (requiredRunRate - 15) * 2);
    }

    // Adjust for wickets in hand
    // More wickets = higher probability
    const wicketFactor = wicketsInHand / 10;
    probability = probability * (0.5 + 0.5 * wicketFactor);

    // Adjust for balls remaining
    // More balls = more time to score
    const ballsFactor = Math.min(1, ballsRemaining / 60); // 60 balls = 10 overs
    probability = probability * (0.7 + 0.3 * ballsFactor);

    return probability;
  }

  /**
   * Get win probability history for a match
   */
  async getWinProbabilityHistory(matchId: string) {
    try {
      const probabilities = await prisma.winProbability.findMany({
        where: { matchId },
        orderBy: [{ overNumber: 'asc' }, { ballNumber: 'asc' }],
      });

      return {
        success: true,
        data: probabilities,
      };
    } catch (error: any) {
      console.error('Error fetching win probability history:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch win probability history',
      };
    }
  }

  /**
   * Get latest win probability for a match
   */
  async getLatestWinProbability(matchId: string) {
    try {
      const latest = await prisma.winProbability.findFirst({
        where: { matchId },
        orderBy: { calculatedAt: 'desc' },
      });

      if (!latest) {
        return {
          success: false,
          message: 'No win probability data found',
        };
      }

      return {
        success: true,
        data: latest,
      };
    } catch (error: any) {
      console.error('Error fetching latest win probability:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch latest win probability',
      };
    }
  }
}

export const winPredictorService = new WinPredictorService();
