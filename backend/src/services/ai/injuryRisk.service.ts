import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

/**
 * Injury Risk Prediction Service
 * Feature 5.4 - Predict injury risk based on workload and history
 */
export class InjuryRiskService {
  /**
   * Assess injury risk for a player
   */
  async assessInjuryRisk(playerId: string) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        bowlingStats: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 matches for workload analysis
        },
        battingStats: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!player) throw new AppError('Player not found', 404);

    // Calculate workload metrics
    const workloadMetrics = this.calculateWorkloadMetrics(player);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(player, workloadMetrics);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);

    // Analyze workload trend
    const workloadTrend = this.analyzeWorkloadTrend(player.bowlingStats);

    // Generate recommendation
    const recommendation = this.generateRecommendation(riskLevel, workloadMetrics, workloadTrend);

    // Calculate recommended rest days
    const daysToRest = this.calculateRestDays(riskLevel, workloadMetrics);

    // Build injury history summary
    const injuryHistory = this.buildInjuryHistory(player);

    // Save assessment
    const assessment = await prisma.injuryRisk.create({
      data: {
        playerId,
        riskLevel,
        riskScore,
        ballsBowled: workloadMetrics.totalBallsBowled,
        oversPerMatch: workloadMetrics.oversPerMatch,
        matchesPlayed: workloadMetrics.matchesPlayed,
        restDays: workloadMetrics.restDays,
        age: player.age,
        injuryHistory,
        workloadTrend,
        recommendation,
        daysToRest,
      },
    });

    return {
      success: true,
      data: assessment,
    };
  }

  /**
   * Calculate workload metrics
   */
  private calculateWorkloadMetrics(player: any) {
    const recentStats = player.bowlingStats.slice(0, 10);
    const matchesPlayed = player.totalMatches || 0;

    // Calculate total balls bowled in recent matches
    const totalBallsBowled = recentStats.reduce((sum: number, s: any) => {
      return sum + (s.overs ? Math.floor(s.overs) * 6 + (s.overs % 1) * 10 : 0);
    }, 0);

    // Calculate overs per match
    const oversPerMatch = recentStats.length > 0
      ? recentStats.reduce((sum: number, s: any) => sum + (s.overs || 0), 0) / recentStats.length
      : 0;

    // Calculate rest days (days since last match)
    const restDays = recentStats.length > 0
      ? Math.floor((Date.now() - new Date(recentStats[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 30; // Default 30 days if no recent matches

    return {
      totalBallsBowled,
      oversPerMatch,
      matchesPlayed,
      restDays,
    };
  }

  /**
   * Calculate injury risk score (0-100)
   */
  private calculateRiskScore(player: any, metrics: any): number {
    let riskScore = 0;

    // Workload factor (0-30 points)
    if (metrics.oversPerMatch > 10) {
      riskScore += 30;
    } else if (metrics.oversPerMatch > 8) {
      riskScore += 20;
    } else if (metrics.oversPerMatch > 6) {
      riskScore += 10;
    }

    // Rest factor (0-25 points)
    if (metrics.restDays < 3) {
      riskScore += 25;
    } else if (metrics.restDays < 7) {
      riskScore += 15;
    } else if (metrics.restDays < 14) {
      riskScore += 5;
    }

    // Age factor (0-20 points)
    if (player.age) {
      if (player.age > 35) {
        riskScore += 20;
      } else if (player.age > 30) {
        riskScore += 10;
      } else if (player.age < 20) {
        riskScore += 5; // Young players also at risk
      }
    }

    // Match frequency factor (0-15 points)
    if (metrics.matchesPlayed > 50) {
      riskScore += 15;
    } else if (metrics.matchesPlayed > 30) {
      riskScore += 10;
    } else if (metrics.matchesPlayed > 15) {
      riskScore += 5;
    }

    // Fast bowling factor (0-10 points)
    const isPaceBowler = player.bowlingAverage > 0 && player.economyRate < 6;
    if (isPaceBowler) {
      riskScore += 10; // Pace bowlers at higher risk
    }

    return Math.min(100, riskScore);
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(riskScore: number): string {
    if (riskScore >= 70) return 'CRITICAL';
    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Analyze workload trend
   */
  private analyzeWorkloadTrend(bowlingStats: any[]): string {
    if (bowlingStats.length < 6) return 'INSUFFICIENT_DATA';

    const recent = bowlingStats.slice(0, 3);
    const older = bowlingStats.slice(3, 6);

    const recentAvgOvers = recent.reduce((sum, s) => sum + (s.overs || 0), 0) / recent.length;
    const olderAvgOvers = older.reduce((sum, s) => sum + (s.overs || 0), 0) / older.length;

    if (olderAvgOvers === 0) return 'STABLE';

    const percentageChange = ((recentAvgOvers - olderAvgOvers) / olderAvgOvers) * 100;

    if (percentageChange > 20) return 'INCREASING';
    if (percentageChange < -20) return 'DECREASING';
    return 'STABLE';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    riskLevel: string,
    metrics: any,
    workloadTrend: string
  ): string {
    if (riskLevel === 'CRITICAL') {
      return 'IMMEDIATE REST REQUIRED - Player should be rested for at least 2-3 weeks. Consult medical team for comprehensive assessment.';
    }

    if (riskLevel === 'HIGH') {
      if (workloadTrend === 'INCREASING') {
        return 'REDUCE WORKLOAD - Limit overs per match and skip next match. Monitor closely for any discomfort.';
      }
      return 'MONITOR CLOSELY - Consider rotation policy and ensure adequate rest between matches.';
    }

    if (riskLevel === 'MEDIUM') {
      if (metrics.oversPerMatch > 8) {
        return 'MANAGE WORKLOAD - Limit to 8 overs per match and ensure 3-4 days rest between games.';
      }
      return 'CONTINUE WITH CAUTION - Maintain current workload but ensure proper warm-up and recovery protocols.';
    }

    return 'LOW RISK - Player can continue current workload. Maintain fitness and recovery routines.';
  }

  /**
   * Calculate recommended rest days
   */
  private calculateRestDays(riskLevel: string, metrics: any): number {
    if (riskLevel === 'CRITICAL') {
      return 21; // 3 weeks
    }

    if (riskLevel === 'HIGH') {
      return 14; // 2 weeks
    }

    if (riskLevel === 'MEDIUM') {
      if (metrics.restDays < 7) {
        return 7; // 1 week
      }
      return 3; // 3 days
    }

    return 0; // No mandatory rest
  }

  /**
   * Build injury history summary
   */
  private buildInjuryHistory(player: any): string {
    // In a real system, this would query an injuries table
    // For now, we'll create a summary based on available data
    const history = {
      totalMatches: player.totalMatches || 0,
      bowlingRole: player.bowlingAverage > 0 ? 'active' : 'minimal',
      careerSpan: 'unknown',
    };

    return JSON.stringify(history);
  }

  /**
   * Get latest injury risk assessment
   */
  async getInjuryRisk(playerId: string) {
    const assessment = await prisma.injuryRisk.findFirst({
      where: { playerId },
      orderBy: { assessedAt: 'desc' },
      include: {
        player: true,
      },
    });

    if (!assessment) {
      return this.assessInjuryRisk(playerId);
    }

    return {
      success: true,
      data: assessment,
    };
  }

  /**
   * Get all high-risk players
   */
  async getHighRiskPlayers() {
    const assessments = await prisma.injuryRisk.findMany({
      where: {
        riskLevel: {
          in: ['HIGH', 'CRITICAL'],
        },
      },
      include: {
        player: true,
      },
      orderBy: {
        riskScore: 'desc',
      },
    });

    return {
      success: true,
      data: assessments,
    };
  }

  /**
   * Get injury risk trends for a player
   */
  async getInjuryRiskTrends(playerId: string, limit: number = 10) {
    const assessments = await prisma.injuryRisk.findMany({
      where: { playerId },
      orderBy: { assessedAt: 'desc' },
      take: limit,
    });

    return {
      success: true,
      data: assessments.reverse(), // Chronological order
    };
  }
}

export const injuryRiskService = new InjuryRiskService();
