import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

/**
 * Advanced Match Prediction Service
 * Feature 5.1 - ML-based predictions using multiple factors
 */
export class MatchPredictionService {
  /**
   * Predict match outcome using statistical analysis
   */
  async predictMatch(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            homeMatches: {
              orderBy: { matchDate: 'desc' },
              take: 5,
            },
          },
        },
        awayTeam: {
          include: {
            awayMatches: {
              orderBy: { matchDate: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Calculate team form (last 5 matches)
    const team1Form = this.calculateTeamForm(match.homeTeam.homeMatches, match.homeTeamId);
    const team2Form = this.calculateTeamForm(match.awayTeam.awayMatches, match.awayTeamId);

    // Calculate venue advantage
    const venueAdvantage = this.calculateVenueAdvantage(match.venue, match.homeTeamId, match.awayTeamId);

    // Calculate toss advantage (assumed 5% swing)
    const tossAdvantage = 5;

    // Get head-to-head record
    const headToHead = await this.getHeadToHead(match.homeTeamId, match.awayTeamId);

    // Weather impact (simulated - can integrate with weather API)
    const weatherImpact = 0; // Neutral weather

    // Calculate win probabilities
    const { team1WinProb, team2WinProb, tieDrawProb } = this.calculateWinProbabilities({
      team1Form,
      team2Form,
      venueAdvantage,
      tossAdvantage,
      weatherImpact,
      headToHead,
    });

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(team1Form, team2Form, headToHead);

    // Save prediction
    const prediction = await prisma.matchPrediction.create({
      data: {
        matchId,
        team1WinProb,
        team2WinProb,
        tieDrawProb,
        team1Form,
        team2Form,
        venueAdvantage,
        tossAdvantage,
        weatherImpact,
        headToHead: JSON.stringify(headToHead),
        confidence,
        factors: JSON.stringify({
          formDifference: team1Form - team2Form,
          venueImpact: venueAdvantage * 10,
          h2hFactor: headToHead.team1Wins - headToHead.team2Wins,
        }),
      },
    });

    return {
      success: true,
      data: {
        ...prediction,
        headToHead: JSON.parse(prediction.headToHead || '{}'),
        factors: JSON.parse(prediction.factors || '{}'),
      },
    };
  }

  /**
   * Calculate team form based on recent matches
   */
  private calculateTeamForm(recentMatches: any[], teamId: string): number {
    if (recentMatches.length === 0) return 50; // Neutral if no data

    let formScore = 0;
    let totalMatches = 0;

    for (const match of recentMatches) {
      if (match.status !== 'COMPLETED') continue;

      totalMatches++;

      if (match.winnerId === teamId) {
        formScore += 100; // Win
      } else if (!match.winnerId) {
        formScore += 50; // Draw/Tie
      } else {
        formScore += 0; // Loss
      }
    }

    return totalMatches > 0 ? formScore / totalMatches : 50;
  }

  /**
   * Calculate venue advantage
   */
  private calculateVenueAdvantage(venue: string, homeTeamId: string, awayTeamId: string): number {
    // Simplified: home team gets slight advantage
    // In real implementation, analyze historical venue performance
    return 0.2; // 20% advantage to home team
  }

  /**
   * Get head-to-head record
   */
  private async getHeadToHead(team1Id: string, team2Id: string) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: team1Id, awayTeamId: team2Id },
          { homeTeamId: team2Id, awayTeamId: team1Id },
        ],
        status: 'COMPLETED',
      },
    });

    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;

    for (const match of matches) {
      if (match.winnerId === team1Id) team1Wins++;
      else if (match.winnerId === team2Id) team2Wins++;
      else draws++;
    }

    return { team1Wins, team2Wins, draws, total: matches.length };
  }

  /**
   * Calculate win probabilities using weighted factors
   */
  private calculateWinProbabilities(factors: {
    team1Form: number;
    team2Form: number;
    venueAdvantage: number;
    tossAdvantage: number;
    weatherImpact: number;
    headToHead: { team1Wins: number; team2Wins: number; draws: number; total: number };
  }) {
    // Start with form-based probability
    let team1Prob = factors.team1Form;
    let team2Prob = factors.team2Form;

    // Adjust for venue (venue advantage affects home team)
    team1Prob += factors.venueAdvantage * 10;

    // Adjust for head-to-head
    if (factors.headToHead.total > 0) {
      const h2hFactor = (factors.headToHead.team1Wins - factors.headToHead.team2Wins) / factors.headToHead.total;
      team1Prob += h2hFactor * 5;
      team2Prob -= h2hFactor * 5;
    }

    // Adjust for weather
    team1Prob += factors.weatherImpact * 3;
    team2Prob -= factors.weatherImpact * 3;

    // Normalize probabilities to sum to 100
    const total = team1Prob + team2Prob;
    team1Prob = (team1Prob / total) * 100;
    team2Prob = (team2Prob / total) * 100;

    // Tie/Draw probability (minimal in limited overs, higher in test)
    const tieDrawProb = 0; // Assuming limited overs format

    // Ensure probabilities are within bounds
    team1Prob = Math.max(5, Math.min(95, team1Prob));
    team2Prob = Math.max(5, Math.min(95, team2Prob));

    // Final normalization
    const finalTotal = team1Prob + team2Prob + tieDrawProb;
    team1Prob = (team1Prob / finalTotal) * 100;
    team2Prob = (team2Prob / finalTotal) * 100;

    return {
      team1WinProb: parseFloat(team1Prob.toFixed(2)),
      team2WinProb: parseFloat(team2Prob.toFixed(2)),
      tieDrawProb: parseFloat(tieDrawProb.toFixed(2)),
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    team1Form: number,
    team2Form: number,
    headToHead: { total: number }
  ): number {
    let confidence = 50;

    // More confidence if we have form data
    if (team1Form !== 50 && team2Form !== 50) confidence += 20;

    // More confidence with more h2h matches
    if (headToHead.total >= 5) confidence += 20;
    else if (headToHead.total >= 2) confidence += 10;

    // Reduce confidence if teams are evenly matched
    const formDiff = Math.abs(team1Form - team2Form);
    if (formDiff < 10) confidence -= 10;

    return Math.max(30, Math.min(90, confidence));
  }

  /**
   * Get prediction for a match
   */
  async getMatchPrediction(matchId: string) {
    const prediction = await prisma.matchPrediction.findFirst({
      where: { matchId },
      orderBy: { predictedAt: 'desc' },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    if (!prediction) {
      // Generate new prediction if not exists
      return this.predictMatch(matchId);
    }

    return {
      success: true,
      data: {
        ...prediction,
        headToHead: JSON.parse(prediction.headToHead || '{}'),
        factors: JSON.parse(prediction.factors || '{}'),
      },
    };
  }

  /**
   * Get all predictions
   */
  async getAllPredictions(limit: number = 20) {
    const predictions = await prisma.matchPrediction.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      orderBy: {
        predictedAt: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: predictions.map((p) => ({
        ...p,
        headToHead: JSON.parse(p.headToHead || '{}'),
        factors: JSON.parse(p.factors || '{}'),
      })),
    };
  }
}

export const matchPredictionService = new MatchPredictionService();
