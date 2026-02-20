import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

/**
 * Player Performance Prediction Service
 * Feature 5.3 - Predict player performance in upcoming match
 */
export class PerformancePredictionService {
  /**
   * Predict player performance for a match
   */
  async predictPerformance(matchId: string, playerId: string) {
    const [match, player] = await Promise.all([
      prisma.match.findUnique({ where: { id: matchId } }),
      prisma.player.findUnique({
        where: { id: playerId },
        include: {
          battingStats: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          bowlingStats: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
    ]);

    if (!match) throw new AppError('Match not found', 404);
    if (!player) throw new AppError('Player not found', 404);

    // Predict batting performance
    const battingPrediction = this.predictBatting(player);

    // Predict bowling performance
    const bowlingPrediction = this.predictBowling(player);

    // Calculate confidence
    const confidence = this.calculateConfidence(player);

    // Generate factors
    const factors = this.generateFactors(player, battingPrediction, bowlingPrediction);

    // Save prediction
    const prediction = await prisma.performancePrediction.create({
      data: {
        matchId,
        playerId,
        ...battingPrediction,
        ...bowlingPrediction,
        confidence,
        factors: JSON.stringify(factors),
      },
    });

    return {
      success: true,
      data: {
        ...prediction,
        factors: JSON.parse(prediction.factors || '{}'),
      },
    };
  }

  /**
   * Predict batting performance
   */
  private predictBatting(player: any) {
    const recentStats = player.battingStats.slice(0, 5);

    if (recentStats.length === 0) {
      // Use career average if no recent stats
      return {
        expectedRuns: player.battingAverage || 20,
        expectedBalls: 15,
        expectedSR: player.strikeRate || 120,
        boundaryProb: 30,
      };
    }

    // Calculate averages from recent matches
    const avgRuns = recentStats.reduce((sum: number, s: any) => sum + s.runs, 0) / recentStats.length;
    const avgBalls = recentStats.reduce((sum: number, s: any) => sum + s.ballsFaced, 0) / recentStats.length;
    const avgSR = recentStats.reduce((sum: number, s: any) => sum + s.strikeRate, 0) / recentStats.length;

    // Calculate boundary probability
    const boundaries = recentStats.reduce((sum: number, s: any) => sum + s.fours + s.sixes, 0);
    const totalBalls = recentStats.reduce((sum: number, s: any) => sum + s.ballsFaced, 0);
    const boundaryProb = totalBalls > 0 ? (boundaries / totalBalls) * 100 : 30;

    // Apply recent form trend
    const formTrend = this.calculateFormTrend(recentStats);

    return {
      expectedRuns: parseFloat((avgRuns * (1 + formTrend)).toFixed(2)),
      expectedBalls: parseFloat(avgBalls.toFixed(2)),
      expectedSR: parseFloat((avgSR * (1 + formTrend * 0.5)).toFixed(2)),
      boundaryProb: parseFloat(Math.min(60, Math.max(10, boundaryProb)).toFixed(2)),
    };
  }

  /**
   * Predict bowling performance
   */
  private predictBowling(player: any) {
    const recentStats = player.bowlingStats.slice(0, 5);

    if (recentStats.length === 0) {
      // Use career average if no recent stats
      return {
        expectedWickets: player.totalWickets > 0 ? 1.5 : 0,
        expectedOvers: 4,
        expectedEconomy: player.economyRate || 7.5,
        wicketProb: 40,
      };
    }

    // Calculate averages
    const avgWickets = recentStats.reduce((sum: number, s: any) => sum + s.wickets, 0) / recentStats.length;
    const avgOvers = recentStats.reduce((sum: number, s: any) => sum + s.overs, 0) / recentStats.length;
    const avgEconomy = recentStats.reduce((sum: number, s: any) => sum + s.economyRate, 0) / recentStats.length;

    // Wicket probability
    const matchesWithWickets = recentStats.filter((s: any) => s.wickets > 0).length;
    const wicketProb = (matchesWithWickets / recentStats.length) * 100;

    // Apply form trend
    const formTrend = this.calculateBowlingFormTrend(recentStats);

    return {
      expectedWickets: parseFloat((avgWickets * (1 + formTrend)).toFixed(2)),
      expectedOvers: parseFloat(avgOvers.toFixed(2)),
      expectedEconomy: parseFloat((avgEconomy * (1 - formTrend * 0.3)).toFixed(2)),
      wicketProb: parseFloat(Math.min(80, Math.max(20, wicketProb * (1 + formTrend))).toFixed(2)),
    };
  }

  /**
   * Calculate batting form trend
   */
  private calculateFormTrend(stats: any[]): number {
    if (stats.length < 3) return 0;

    const recent = stats.slice(0, 2);
    const older = stats.slice(2, 4);

    const recentAvg = recent.reduce((sum, s) => sum + s.runs, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.runs, 0) / older.length;

    if (olderAvg === 0) return 0;

    const trend = (recentAvg - olderAvg) / olderAvg;
    return Math.max(-0.3, Math.min(0.3, trend)); // Cap at ±30%
  }

  /**
   * Calculate bowling form trend
   */
  private calculateBowlingFormTrend(stats: any[]): number {
    if (stats.length < 3) return 0;

    const recent = stats.slice(0, 2);
    const older = stats.slice(2, 4);

    const recentAvg = recent.reduce((sum, s) => sum + s.wickets, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.wickets, 0) / older.length;

    if (olderAvg === 0) return 0;

    const trend = (recentAvg - olderAvg) / olderAvg;
    return Math.max(-0.3, Math.min(0.3, trend));
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(player: any): number {
    let confidence = 50;

    // More data = more confidence
    if (player.totalMatches > 20) confidence += 20;
    else if (player.totalMatches > 10) confidence += 10;

    // Recent stats boost confidence
    if (player.battingStats.length >= 5) confidence += 10;
    if (player.bowlingStats.length >= 5) confidence += 10;

    // Consistency boosts confidence
    const battingVariance = this.calculateVariance(player.battingStats);
    if (battingVariance < 20) confidence += 10;

    return Math.min(90, confidence);
  }

  /**
   * Calculate variance in performance
   */
  private calculateVariance(stats: any[]): number {
    if (stats.length === 0) return 100;

    const runs = stats.map((s) => s.runs || 0);
    const avg = runs.reduce((sum, r) => sum + r, 0) / runs.length;
    const variance = runs.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / runs.length;

    return Math.sqrt(variance);
  }

  /**
   * Generate factors
   */
  private generateFactors(player: any, batting: any, bowling: any): any {
    return {
      recentForm: player.battingStats.length > 0 ? 'good' : 'unknown',
      careerAverage: player.battingAverage,
      careerStrikeRate: player.strikeRate,
      totalMatches: player.totalMatches,
      totalRuns: player.totalRuns,
      totalWickets: player.totalWickets,
      battingTrend: batting.expectedRuns > player.battingAverage ? 'improving' : 'declining',
      bowlingTrend: bowling.expectedWickets > 1 ? 'improving' : 'stable',
    };
  }

  /**
   * Get performance prediction
   */
  async getPerformancePrediction(matchId: string, playerId: string) {
    const prediction = await prisma.performancePrediction.findFirst({
      where: { matchId, playerId },
      orderBy: { predictedAt: 'desc' },
      include: {
        match: true,
        player: true,
      },
    });

    if (!prediction) {
      return this.predictPerformance(matchId, playerId);
    }

    return {
      success: true,
      data: {
        ...prediction,
        factors: JSON.parse(prediction.factors || '{}'),
      },
    };
  }

  /**
   * Get all predictions for a match
   */
  async getMatchPredictions(matchId: string) {
    const predictions = await prisma.performancePrediction.findMany({
      where: { matchId },
      include: {
        player: true,
      },
      orderBy: {
        expectedRuns: 'desc',
      },
    });

    return {
      success: true,
      data: predictions.map((p) => ({
        ...p,
        factors: JSON.parse(p.factors || '{}'),
      })),
    };
  }
}

export const performancePredictionService = new PerformancePredictionService();
