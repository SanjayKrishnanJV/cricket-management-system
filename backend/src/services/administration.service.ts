import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  DRSStatus,
  ThirdUmpireDecision,
  InjuryStatus,
  InjurySeverity,
  WeatherCondition,
  PitchCondition,
  IncidentSeverity,
  ViolationType
} from '@prisma/client';

/**
 * Administration & Management Service
 * Handles DRS Reviews, Injuries & Substitutions, Weather & Conditions, Referee Reports
 */
export class AdministrationService {
  // ===== DRS (DECISION REVIEW SYSTEM) =====

  async createDRSReview(data: {
    matchId: string;
    inningsId: string;
    ballId?: string;
    overNumber: number;
    ballNumber: number;
    reviewingTeamId: string;
    battingTeamId: string;
    bowlingTeamId: string;
    batsmanId: string;
    bowlerId: string;
    drsType: string;
    onFieldDecision: string;
    reviewedBy: string;
  }) {
    // Verify match exists
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Create DRS review
    return await prisma.dRSReview.create({
      data: {
        ...data,
        status: DRSStatus.PENDING,
        thirdUmpireDecision: ThirdUmpireDecision.INCONCLUSIVE,
        finalDecision: data.onFieldDecision,
      } as any,
      include: {
        match: { select: { id: true, venue: true } },
        innings: { select: { id: true, inningsNumber: true } },
      },
    });
  }

  async getDRSReviewsByMatch(matchId: string) {
    return await prisma.dRSReview.findMany({
      where: { matchId },
      include: {
      },
      orderBy: { reviewedAt: 'desc' },
    });
  }

  async updateDRSDecision(reviewId: string, data: {
    thirdUmpireDecision: ThirdUmpireDecision;
    finalDecision: string;
    status: DRSStatus;
    ultraEdge?: boolean;
    ballTracking?: boolean;
    hotSpot?: boolean;
    snickoMeter?: boolean;
    evidenceData?: string;
    reasoning?: string;
    reviewDuration?: number;
  }) {
    const review = await prisma.dRSReview.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new AppError('DRS Review not found', 404);
    }

    return await prisma.dRSReview.update({
      where: { id: reviewId },
      data: data as any,
      include: {
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async getDRSStats(matchId: string) {
    const reviews = await prisma.dRSReview.findMany({
      where: { matchId },
    });

    const successfulReviews = reviews.filter(r => r.status === DRSStatus.UPHELD || r.status === DRSStatus.REVERSED);
    const team1Reviews = reviews.filter(r => r.reviewingTeamId === reviews[0]?.reviewingTeamId);
    const team2Reviews = reviews.filter(r => r.reviewingTeamId !== reviews[0]?.reviewingTeamId);

    return {
      totalReviews: reviews.length,
      successfulReviews: successfulReviews.length,
      successRate: reviews.length > 0 ? (successfulReviews.length / reviews.length) * 100 : 0,
      team1TotalReviews: team1Reviews.length,
      team2TotalReviews: team2Reviews.length,
      team1ReviewsRemaining: Math.max(0, 2 - team1Reviews.length),
      team2ReviewsRemaining: Math.max(0, 2 - team2Reviews.length),
      byType: reviews.reduce((acc, r) => {
        acc[r.drsType] = (acc[r.drsType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ===== INJURY MANAGEMENT =====

  async recordInjury(data: {
    matchId: string;
    playerId: string;
    teamId: string;
    injuryType: string;
    severity: InjurySeverity;
    description: string;
    inningsId?: string;
    overNumber?: number;
    ballNumber?: number;
    assessedBy?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    expectedRecovery?: Date;
  }) {
    // Verify player and match exist
    const player = await prisma.player.findUnique({ where: { id: data.playerId } });
    if (!player) {
      throw new AppError('Player not found', 404);
    }

    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    return await prisma.playerInjury.create({
      data: data as any,
      include: {
        player: { select: { id: true, name: true, role: true } },
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async updateInjury(injuryId: string, data: {
    status?: string;
    severity?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    expectedRecovery?: Date;
    actualRecovery?: Date;
  }) {
    const injury = await prisma.playerInjury.findUnique({ where: { id: injuryId } });
    if (!injury) {
      throw new AppError('Injury record not found', 404);
    }

    return await prisma.playerInjury.update({
      where: { id: injuryId },
      data: data as any,
      include: {
        player: { select: { id: true, name: true, role: true } },
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async getInjuriesByMatch(matchId: string) {
    return await prisma.playerInjury.findMany({
      where: { matchId },
      include: {
        player: { select: { id: true, name: true, role: true } },
      },
      orderBy: { injuredAt: 'desc' },
    });
  }

  async getInjuriesByPlayer(playerId: string) {
    return await prisma.playerInjury.findMany({
      where: { playerId },
      include: {
        match: { select: { id: true, venue: true, matchDate: true } },
      },
      orderBy: { injuredAt: 'desc' },
    });
  }

  async getActiveInjuries() {
    return await prisma.playerInjury.findMany({
      where: { status: 'ACTIVE' },
      include: {
        player: { select: { id: true, name: true, role: true } },
        match: { select: { id: true, venue: true, matchDate: true } },
      },
      orderBy: { injuredAt: 'desc' },
    });
  }

  // ===== SUBSTITUTION MANAGEMENT =====

  async createSubstitution(data: {
    matchId: string;
    replacedPlayerId: string;
    substitutePlayerId: string;
    teamId: string;
    substituteType: string;
    reason: string;
    injuryId?: string;
    approvedBy?: string;
    inningsId?: string;
    overNumber?: number;
    ballNumber?: number;
    canBat?: boolean;
    canBowl?: boolean;
    canField?: boolean;
  }) {
    // Verify players exist
    const replacedPlayer = await prisma.player.findUnique({ where: { id: data.replacedPlayerId } });
    if (!replacedPlayer) {
      throw new AppError('Replaced player not found', 404);
    }

    const substitutePlayer = await prisma.player.findUnique({ where: { id: data.substitutePlayerId } });
    if (!substitutePlayer) {
      throw new AppError('Substitute player not found', 404);
    }

    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // For concussion substitutes, enforce like-for-like rule
    if (data.substituteType === 'CONCUSSION') {
      if (replacedPlayer.role !== substitutePlayer.role) {
        throw new AppError('Concussion substitute must be like-for-like (same player role)', 400);
      }
    }

    return await prisma.substitutePlayer.create({
      data: data as any,
      include: {
        replacedPlayer: { select: { id: true, name: true, role: true } },
        substitutePlayer: { select: { id: true, name: true, role: true } },
        injury: true,
      },
    });
  }

  async endSubstitution(substituteId: string) {
    const substitute = await prisma.substitutePlayer.findUnique({ where: { id: substituteId } });
    if (!substitute) {
      throw new AppError('Substitution record not found', 404);
    }

    if (substitute.endedAt) {
      throw new AppError('Substitution has already ended', 400);
    }

    return await prisma.substitutePlayer.update({
      where: { id: substituteId },
      data: { endedAt: new Date() },
      include: {
        replacedPlayer: { select: { id: true, name: true } },
        substitutePlayer: { select: { id: true, name: true } },
      },
    });
  }

  async getSubstitutionsByMatch(matchId: string) {
    return await prisma.substitutePlayer.findMany({
      where: { matchId },
      include: {
        replacedPlayer: { select: { id: true, name: true, role: true } },
        substitutePlayer: { select: { id: true, name: true, role: true } },
        injury: true,
      },
      orderBy: { substitutedAt: 'desc' },
    });
  }

  // ===== WEATHER TRACKING =====

  async recordWeather(data: {
    matchId: string;
    condition: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: string;
    rainfall?: number;
    visibility?: string;
    inningsId?: string;
    overNumber?: number;
    playImpact?: string;
    dlsAffected?: boolean;
  }) {
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    return await prisma.weatherRecord.create({
      data: data as any,
      include: {
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async getWeatherByMatch(matchId: string) {
    return await prisma.weatherRecord.findMany({
      where: { matchId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getCurrentWeather(matchId: string) {
    return await prisma.weatherRecord.findFirst({
      where: { matchId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  // ===== PITCH CONDITIONS =====

  async recordPitchCondition(data: {
    matchId: string;
    condition: string;
    grassCover?: string;
    hardness?: number;
    cracks?: boolean;
    paceAndBounce?: string;
    turn?: string;
    wearProgress?: string;
    assessedBy?: string;
    favorsBatting?: boolean;
    favorsBowling?: boolean;
    inningsId?: string;
  }) {
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    return await prisma.pitchRecord.create({
      data: data as any,
      include: {
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async getPitchConditionsByMatch(matchId: string) {
    return await prisma.pitchRecord.findMany({
      where: { matchId },
      orderBy: { assessedAt: 'desc' },
    });
  }

  async getCurrentPitchCondition(matchId: string) {
    return await prisma.pitchRecord.findFirst({
      where: { matchId },
      orderBy: { assessedAt: 'desc' },
    });
  }

  // ===== DLS CALCULATIONS =====

  async calculateDLS(data: {
    matchId: string;
    inningsId: string;
    originalTarget: number;
    originalOvers: number;
    interruptionStart: Date;
    interruptionEnd?: Date;
    oversLost: number;
    wicketsLost: number;
    dlsVersion?: string;
    calculatedBy?: string;
  }) {
    const innings = await prisma.innings.findUnique({ where: { id: data.inningsId } });
    if (!innings) {
      throw new AppError('Innings not found', 404);
    }

    // Simplified DLS calculation (in production, use actual DLS tables)
    const resourcesAvailable = 100 - (data.oversLost / data.originalOvers) * 50 - (data.wicketsLost * 7);
    const parScore = Math.round((data.originalTarget * resourcesAvailable) / 100);
    const revisedTarget = parScore + 1;
    const revisedOvers = data.originalOvers - data.oversLost;

    return await prisma.dLSCalculation.create({
      data: {
        ...data,
        resourcesAvailable,
        parScore,
        revisedTarget,
        revisedOvers,
        dlsVersion: data.dlsVersion || 'Standard',
      },
      include: {
        match: { select: { id: true, venue: true } },
      },
    });
  }

  async getDLSCalculationsByMatch(matchId: string) {
    return await prisma.dLSCalculation.findMany({
      where: { matchId },
      include: {
      },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  // ===== REFEREE REPORTS =====

  async createRefereeReport(data: {
    matchId: string;
    refereeName: string;
    refereeId?: string;
    matchSummary: string;
    fairPlay?: boolean;
    sportsmanship?: string;
    team1OverRate?: number;
    team2OverRate?: number;
    overRateIssues?: boolean;
    overRatePenalty?: string;
    observations?: string;
    groundConditions?: string;
    facilitiesQuality?: string;
    umpire1Name?: string;
    umpire2Name?: string;
    thirdUmpireName?: string;
    matchCommissioner?: string;
  }) {
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Check if report already exists
    const existing = await prisma.matchRefereeReport.findUnique({
      where: { matchId: data.matchId },
    });

    if (existing) {
      throw new AppError('Referee report already exists for this match', 400);
    }

    return await prisma.matchRefereeReport.create({
      data: data as any,
      include: {
        match: { select: { id: true, venue: true, matchDate: true } },
      },
    });
  }

  async updateRefereeReport(reportId: string, data: Partial<{
    matchSummary: string;
    fairPlay: boolean;
    sportsmanship: string;
    team1OverRate: number;
    team2OverRate: number;
    overRateIssues: boolean;
    overRatePenalty: string;
    observations: string;
    groundConditions: string;
    facilitiesQuality: string;
    umpire1Name: string;
    umpire2Name: string;
    thirdUmpireName: string;
    matchCommissioner: string;
    status: string;
  }>) {
    const report = await prisma.matchRefereeReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new AppError('Referee report not found', 404);
    }

    return await prisma.matchRefereeReport.update({
      where: { id: reportId },
      data,
      include: {
        match: { select: { id: true, venue: true } },
        incidents: true,
        violations: true,
      },
    });
  }

  async getRefereeReport(matchId: string) {
    return await prisma.matchRefereeReport.findUnique({
      where: { matchId },
      include: {
        match: { select: { id: true, venue: true, matchDate: true } },
        incidents: {
          orderBy: { occurredAt: 'desc' },
        },
        violations: {
          include: {
            player: { select: { id: true, name: true } },
          },
          orderBy: { occurredAt: 'desc' },
        },
      },
    });
  }

  async submitReport(reportId: string) {
    const report = await prisma.matchRefereeReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new AppError('Referee report not found', 404);
    }

    if (report.status !== 'DRAFT') {
      throw new AppError('Report has already been submitted', 400);
    }

    return await prisma.matchRefereeReport.update({
      where: { id: reportId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  // ===== INCIDENT MANAGEMENT =====

  async recordIncident(data: {
    reportId: string;
    matchId: string;
    incidentType: string;
    severity: string;
    description: string;
    inningsId?: string;
    overNumber?: number;
    ballNumber?: number;
    playersInvolved?: string;
    teamsInvolved?: string;
    actionTaken?: string;
    penaltyApplied?: string;
    witnessStatements?: string;
    videoEvidence?: boolean;
  }) {
    const report = await prisma.matchRefereeReport.findUnique({ where: { id: data.reportId } });
    if (!report) {
      throw new AppError('Referee report not found', 404);
    }

    return await prisma.matchIncident.create({
      data: data as any,
      include: {
        match: { select: { id: true, venue: true } },
        report: { select: { id: true, refereeName: true } },
      },
    });
  }

  async updateIncident(incidentId: string, data: Partial<{
    description: string;
    actionTaken: string;
    penaltyApplied: string;
    witnessStatements: string;
    videoEvidence: boolean;
  }>) {
    const incident = await prisma.matchIncident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    return await prisma.matchIncident.update({
      where: { id: incidentId },
      data,
    });
  }

  async getIncidentsByMatch(matchId: string) {
    return await prisma.matchIncident.findMany({
      where: { matchId },
      include: {
        report: { select: { refereeName: true } },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  // ===== CODE VIOLATIONS =====

  async recordViolation(data: {
    reportId: string;
    matchId: string;
    playerId?: string;
    teamId?: string;
    violationType: string;
    severity: string;
    description: string;
    article?: string;
    inningsId?: string;
    overNumber?: number;
    ballNumber?: number;
    penaltyPoints?: number;
    matchBan?: number;
    financialPenalty?: number;
    warningIssued?: boolean;
  }) {
    const report = await prisma.matchRefereeReport.findUnique({ where: { id: data.reportId } });
    if (!report) {
      throw new AppError('Referee report not found', 404);
    }

    return await prisma.codeViolation.create({
      data: {
        ...data,
        penaltyPoints: data.penaltyPoints || 0,
        matchBan: data.matchBan || 0,
      } as any,
      include: {
        match: { select: { id: true, venue: true } },
        report: { select: { id: true, refereeName: true } },
        player: { select: { id: true, name: true } },
      },
    });
  }

  async updateViolation(violationId: string, data: Partial<{
    description: string;
    article: string;
    penaltyPoints: number;
    matchBan: number;
    financialPenalty: number;
    warningIssued: boolean;
    appealFiled: boolean;
    appealOutcome: string;
  }>) {
    const violation = await prisma.codeViolation.findUnique({ where: { id: violationId } });
    if (!violation) {
      throw new AppError('Code violation not found', 404);
    }

    return await prisma.codeViolation.update({
      where: { id: violationId },
      data,
      include: {
        match: { select: { id: true, venue: true } },
        report: { select: { id: true, refereeName: true } },
        player: { select: { id: true, name: true } },
      },
    });
  }

  async getViolationsByMatch(matchId: string) {
    return await prisma.codeViolation.findMany({
      where: { matchId },
      include: {
        match: { select: { id: true, venue: true } },
        report: { select: { id: true, refereeName: true } },
        player: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async getViolationsByPlayer(playerId: string) {
    return await prisma.codeViolation.findMany({
      where: { playerId },
      include: {
        match: { select: { id: true, venue: true, matchDate: true } },
        report: { select: { id: true, refereeName: true } },
        player: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: 'desc' },
    });
  }
}

export const administrationService = new AdministrationService();
