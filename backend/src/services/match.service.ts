import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CricketUtils } from '../utils/cricket.utils';
import { BallEvent } from '../types';
import { notificationService } from './notification.service';
import { achievementService } from './achievement.service';
import { challengeService } from './challenge.service';
import { fantasyService } from './fantasy.service';
import { tournamentSchedulingService } from './tournament-scheduling.service';

export class MatchService {
  async createMatch(data: {
    tournamentId?: string;
    homeTeamId: string;
    awayTeamId: string;
    venue: string;
    matchDate: string;
    isQuickMatch?: boolean;
    customOvers?: number;
    homeSquad?: string[];
    awaySquad?: string[];
  }) {
    const match = await prisma.match.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        venue: data.venue,
        matchDate: new Date(data.matchDate),
        isQuickMatch: data.isQuickMatch || false,
        customOvers: data.customOvers,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
    });

    await prisma.matchAnalytics.create({
      data: {
        matchId: match.id,
      },
    });

    // If quick match with custom squads, create squad entries
    if (data.isQuickMatch && (data.homeSquad || data.awaySquad)) {
      const squadEntries = [];

      if (data.homeSquad) {
        for (const playerId of data.homeSquad) {
          squadEntries.push({
            matchId: match.id,
            playerId,
            teamId: data.homeTeamId,
          });
        }
      }

      if (data.awaySquad) {
        for (const playerId of data.awaySquad) {
          squadEntries.push({
            matchId: match.id,
            playerId,
            teamId: data.awayTeamId,
          });
        }
      }

      if (squadEntries.length > 0) {
        await prisma.matchSquad.createMany({
          data: squadEntries,
        });
      }
    }

    return match;
  }

  async getAllMatches(filters?: {
    tournamentId?: string;
    teamId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.tournamentId) {
      where.tournamentId = filters.tournamentId;
    }

    if (filters?.teamId) {
      where.OR = [
        { homeTeamId: filters.teamId },
        { awayTeamId: filters.teamId },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: {
          select: {
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            name: true,
            shortName: true,
            logoUrl: true,
          },
        },
        tournament: {
          select: {
            name: true,
            format: true,
          },
        },
        matchSquads: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { matchDate: 'desc' },
    });

    // Populate Man of the Match player names
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        if (match.manOfMatch) {
          const player = await prisma.player.findUnique({
            where: { id: match.manOfMatch },
            select: { name: true },
          });
          return {
            ...match,
            manOfMatch: player?.name || match.manOfMatch,
          };
        }
        return match;
      })
    );

    return enrichedMatches;
  }

  async getMatchById(id: string) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
        matchSquads: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        innings: {
          include: {
            overs: {
              include: {
                balls: true,
              },
              orderBy: { overNumber: 'asc' },
            },
            battingPerformances: {
              include: {
                player: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            bowlingPerformances: {
              include: {
                player: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { inningsNumber: 'asc' },
        },
        commentary: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        matchAnalytics: true,
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Populate Man of the Match player name
    if (match.manOfMatch) {
      const player = await prisma.player.findUnique({
        where: { id: match.manOfMatch },
        select: { name: true },
      });
      if (player) {
        match.manOfMatch = player.name;
      }
    }

    return match;
  }

  async recordToss(matchId: string, tossWinnerId: string, tossDecision: string) {
    // Get match first to validate teams
    const matchData = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!matchData) {
      throw new AppError('Match not found', 404);
    }

    // Validate both teams have minimum players
    await this.validateTeamsForMatch(matchData.homeTeamId, matchData.awayTeamId, matchId, matchData.isQuickMatch || false);

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        tossWinnerId,
        tossDecision,
        status: 'LIVE',
      },
    });

    const battingTeamId = tossDecision === 'bat' ? tossWinnerId :
      (tossWinnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId);
    const bowlingTeamId = battingTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

    const innings = await prisma.innings.create({
      data: {
        matchId,
        battingTeamId,
        bowlingTeamId,
        inningsNumber: 1,
        status: 'IN_PROGRESS',
      },
    });

    // Send match start notifications
    notificationService.notifyMatchStart(matchId).catch(err => {
      console.error('Failed to send match start notifications:', err);
    });

    return { match, innings };
  }

  async startInnings(matchId: string, inningsNumber: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: true,
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (inningsNumber === 1) {
      throw new AppError('First innings started with toss', 400);
    }

    const firstInnings = match.innings.find(i => i.inningsNumber === 1);
    if (!firstInnings) {
      throw new AppError('First innings not found', 404);
    }

    const battingTeamId = firstInnings.bowlingTeamId;
    const bowlingTeamId = firstInnings.battingTeamId;

    const innings = await prisma.innings.create({
      data: {
        matchId,
        battingTeamId,
        bowlingTeamId,
        inningsNumber,
        status: 'IN_PROGRESS',
      },
    });

    return innings;
  }

  async recordBall(
    inningsId: string,
    bowlerId: string,
    batsmanId: string,
    ballData: BallEvent
  ) {
    const innings = await prisma.innings.findUnique({
      where: { id: inningsId },
      include: {
        overs: {
          orderBy: { overNumber: 'desc' },
          take: 1,
        },
        match: true,
      },
    });

    if (!innings) {
      throw new AppError('Innings not found', 404);
    }

    let currentOver = innings.overs[0];
    const currentOverNumber = currentOver ? currentOver.overNumber : 0;
    const ballsInCurrentOver = currentOver ?
      await prisma.ball.count({ where: { overId: currentOver.id } }) : 6;

    let overNumber = currentOverNumber;
    let ballNumber = 1;

    if (ballsInCurrentOver < 6 && currentOver) {
      ballNumber = ballsInCurrentOver + 1;
      overNumber = currentOverNumber;
    } else {
      overNumber = currentOverNumber + 1;
      ballNumber = 1;

      currentOver = await prisma.over.create({
        data: {
          inningsId,
          overNumber,
          bowlerId,
        },
      });
    }

    const ball = await prisma.ball.create({
      data: {
        inningsId,
        overId: currentOver.id,
        overNumber,
        ballNumber,
        bowlerId,
        batsmanId,
        runs: ballData.runs,
        isWicket: ballData.isWicket,
        wicketType: ballData.wicketType as any,
        dismissedPlayerId: ballData.dismissedPlayerId,
        wicketTakerId: ballData.wicketTakerId,
        isExtra: ballData.isExtra,
        extraType: ballData.extraType as any,
        extraRuns: ballData.extraRuns,
        commentary: ballData.commentary,
        // Visualization data (optional)
        shotAngle: ballData.locationData?.shotAngle,
        shotDistance: ballData.locationData?.shotDistance,
        shotZone: ballData.locationData?.shotZone,
        pitchLine: ballData.locationData?.pitchLine,
        pitchLength: ballData.locationData?.pitchLength,
        pitchX: ballData.locationData?.pitchX,
        pitchY: ballData.locationData?.pitchY,
        ballSpeed: ballData.locationData?.ballSpeed,
        ballTrajectory: ballData.locationData?.ballTrajectory,
        shotType: ballData.locationData?.shotType,
      },
    });

    let totalRuns = innings.totalRuns;
    let totalWickets = innings.totalWickets;
    let extras = innings.extras;

    totalRuns += ballData.runs;

    if (ballData.isExtra) {
      extras += ballData.extraRuns;
      totalRuns += ballData.extraRuns;
    }

    if (ballData.isWicket) {
      totalWickets += 1;
    }

    const totalBalls = CricketUtils.oversToBalls(innings.totalOvers) + (ballData.isExtra && (ballData.extraType === 'WIDE' || ballData.extraType === 'NO_BALL') ? 0 : 1);
    const totalOvers = CricketUtils.ballsToOvers(totalBalls);

    await prisma.innings.update({
      where: { id: inningsId },
      data: {
        totalRuns,
        totalWickets,
        totalOvers,
        extras,
        // Update current batsmen for session persistence
        currentStrikerId: ballData.strikerId,
        currentNonStrikerId: ballData.nonStrikerId,
      },
    });

    await prisma.over.update({
      where: { id: currentOver.id },
      data: {
        runsScored: {
          increment: ballData.runs + (ballData.isExtra ? ballData.extraRuns : 0),
        },
        wickets: {
          increment: ballData.isWicket ? 1 : 0,
        },
      },
    });

    await this.updateBattingPerformance(inningsId, batsmanId, ballData);
    await this.updateBowlingPerformance(inningsId, bowlerId, ballData);

    if (ballData.commentary) {
      await prisma.commentary.create({
        data: {
          matchId: innings.matchId,
          over: overNumber,
          ball: ballNumber,
          text: ballData.commentary,
        },
      });
    }

    return ball;
  }

  private async updateBattingPerformance(
    inningsId: string,
    batsmanId: string,
    ballData: BallEvent
  ) {
    const innings = await prisma.innings.findUnique({
      where: { id: inningsId },
    });

    if (!innings) return;

    let performance = await prisma.battingPerformance.findFirst({
      where: {
        inningsId,
        playerId: batsmanId,
      },
    });

    if (!performance) {
      performance = await prisma.battingPerformance.create({
        data: {
          inningsId,
          playerId: batsmanId,
          teamId: innings.battingTeamId,
        },
      });
    }

    const runs = performance.runs + ballData.runs;
    const ballsFaced = performance.ballsFaced + (ballData.isExtra && (ballData.extraType === 'WIDE' || ballData.extraType === 'NO_BALL') ? 0 : 1);
    const fours = performance.fours + (ballData.runs === 4 && !ballData.isExtra ? 1 : 0);
    const sixes = performance.sixes + (ballData.runs === 6 && !ballData.isExtra ? 1 : 0);
    const strikeRate = CricketUtils.calculateStrikeRate(runs, ballsFaced);

    const updateData: any = {
      runs,
      ballsFaced,
      fours,
      sixes,
      strikeRate,
    };

    if (ballData.isWicket && ballData.dismissedPlayerId === batsmanId) {
      updateData.isOut = true;
      updateData.dismissal = ballData.wicketType;
    }

    await prisma.battingPerformance.update({
      where: { id: performance.id },
      data: updateData,
    });
  }

  private async updateBowlingPerformance(
    inningsId: string,
    bowlerId: string,
    ballData: BallEvent
  ) {
    const innings = await prisma.innings.findUnique({
      where: { id: inningsId },
    });

    if (!innings) return;

    let performance = await prisma.bowlingPerformance.findFirst({
      where: {
        inningsId,
        playerId: bowlerId,
      },
    });

    if (!performance) {
      performance = await prisma.bowlingPerformance.create({
        data: {
          inningsId,
          playerId: bowlerId,
          teamId: innings.bowlingTeamId,
        },
      });
    }

    const runsConceded = performance.runsConceded + ballData.runs + (ballData.isExtra ? ballData.extraRuns : 0);
    const wickets = performance.wickets + (ballData.isWicket ? 1 : 0);

    let oversBowled = performance.oversBowled;
    if (!ballData.isExtra || (ballData.extraType !== 'WIDE' && ballData.extraType !== 'NO_BALL')) {
      const totalBalls = CricketUtils.oversToBalls(oversBowled) + 1;
      oversBowled = CricketUtils.ballsToOvers(totalBalls);
    }

    const economyRate = CricketUtils.calculateEconomyRate(runsConceded, oversBowled);

    await prisma.bowlingPerformance.update({
      where: { id: performance.id },
      data: {
        oversBowled,
        runsConceded,
        wickets,
        economyRate,
      },
    });
  }

  async completeInnings(inningsId: string) {
    await prisma.innings.update({
      where: { id: inningsId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  async completeMatch(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: {
          orderBy: { inningsNumber: 'asc' },
        },
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match || match.innings.length < 2) {
      throw new AppError('Match not complete', 400);
    }

    const firstInnings = match.innings[0];
    const secondInnings = match.innings[1];

    let winnerId: string;
    let winMargin: string;
    let isWicketMargin = false;

    if (secondInnings.totalRuns > firstInnings.totalRuns) {
      winnerId = secondInnings.battingTeamId;
      const wicketsRemaining = 10 - secondInnings.totalWickets;
      winMargin = `${wicketsRemaining} wickets`;
      isWicketMargin = true;
    } else {
      winnerId = firstInnings.battingTeamId;
      const runsDifference = firstInnings.totalRuns - secondInnings.totalRuns;
      winMargin = `${runsDifference} runs`;
    }

    const winningTeam = winnerId === match.homeTeamId ? match.homeTeam : match.awayTeam;
    const losingTeam = winnerId === match.homeTeamId ? match.awayTeam : match.homeTeam;

    const resultText = CricketUtils.generateResultText(
      winningTeam.name,
      losingTeam.name,
      parseInt(winMargin),
      isWicketMargin
    );

    const allPerformances = await prisma.battingPerformance.findMany({
      where: {
        inningsId: {
          in: match.innings.map(i => i.id),
        },
      },
      include: {
        player: true,
      },
    });

    const manOfMatch = CricketUtils.determineManOfMatch(
      allPerformances.map(p => ({
        playerId: p.playerId,
        runs: p.runs,
        strikeRate: p.strikeRate,
      }))
    );

    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        winnerId,
        winMargin,
        resultText,
        manOfMatch,
      },
    });

    // Send match end notifications
    notificationService.notifyMatchEnd(matchId).catch(err => {
      console.error('Failed to send match end notifications:', err);
    });

    // Check for achievements and update challenges
    try {
      for (const innings of match.innings) {
        const performances = [
          ...allPerformances.filter(p => p.inningsId === innings.id),
        ];

        // Get unique player IDs from all performances
        const battingPlayerIds = allPerformances
          .filter(p => p.inningsId === innings.id)
          .map(p => p.playerId);

        const bowlingPerfs = await prisma.bowlingPerformance.findMany({
          where: { inningsId: innings.id },
        });

        const bowlingPlayerIds = bowlingPerfs.map(p => p.playerId);

        const playerIds = [...new Set([...battingPlayerIds, ...bowlingPlayerIds])];

        for (const playerId of playerIds) {
          await achievementService.checkPlayerAchievements(playerId, match.id);
          await challengeService.updateChallengeProgress(playerId, match.id);
        }
      }

      // Calculate fantasy points if match is part of a tournament
      if (match.tournamentId) {
        await fantasyService.calculateMatchPoints(match.id);
      }

      console.log('✅ Gamification updates completed for match');
    } catch (error) {
      console.error('❌ Error in gamification updates:', error);
    }

    // If this is a semi-final, automatically update the final match
    if (match.matchType === 'SEMI_FINAL' && winnerId) {
      try {
        await tournamentSchedulingService.updateFinalAfterSemiFinal(matchId);
        console.log('✅ Final match updated with semi-final winner');
      } catch (error) {
        console.error('❌ Error updating final match:', error);
      }
    }

    return { winnerId, resultText, manOfMatch };
  }

  async getLiveScore(matchId: string) {
    const match = await this.getMatchById(matchId);

    const currentInnings = match.innings.find(i => i.status === 'IN_PROGRESS');

    if (!currentInnings) {
      return {
        match,
        live: false,
      };
    }

    const lastBalls = await prisma.ball.findMany({
      where: { inningsId: currentInnings.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        batsman: {
          select: {
            name: true,
          },
        },
        bowler: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get all balls for over-by-over breakdown
    const allBalls = await prisma.ball.findMany({
      where: { inningsId: currentInnings.id },
      orderBy: [{ overNumber: 'asc' }, { ballNumber: 'asc' }],
      include: {
        batsman: {
          select: {
            id: true,
            name: true,
          },
        },
        bowler: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      match,
      live: true,
      currentInnings: {
        ...currentInnings,
        lastBalls,
        balls: allBalls,
      },
    };
  }

  async updateMatch(id: string, data: {
    tournamentId?: string;
    homeTeamId?: string;
    awayTeamId?: string;
    venue?: string;
    matchDate?: string;
  }) {
    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Only allow updates if match is SCHEDULED
    if (match.status !== 'SCHEDULED') {
      throw new AppError('Can only update scheduled matches', 400);
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        venue: data.venue,
        matchDate: data.matchDate ? new Date(data.matchDate) : undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
    });

    return updatedMatch;
  }

  async deleteMatch(id: string) {
    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Only allow deletion if match is SCHEDULED
    if (match.status !== 'SCHEDULED') {
      throw new AppError('Can only delete scheduled matches', 400);
    }

    // Delete match (this will cascade delete related records based on schema)
    await prisma.match.delete({
      where: { id },
    });
  }

  async cancelMatch(id: string) {
    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Can't cancel completed matches
    if (match.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a completed match', 400);
    }

    // Can't cancel already abandoned matches
    if (match.status === 'ABANDONED') {
      throw new AppError('Match is already cancelled', 400);
    }

    // Update match status to ABANDONED
    const cancelledMatch = await prisma.match.update({
      where: { id },
      data: { status: 'ABANDONED' },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
    });

    return cancelledMatch;
  }

  async validateTeamsForMatch(homeTeamId: string, awayTeamId: string, matchId?: string, isQuickMatch: boolean = false) {
    let homeTeamPlayers = 0;
    let awayTeamPlayers = 0;

    if (isQuickMatch && matchId) {
      // For quick matches, check matchSquad entries
      const [homeSquadCount, awaySquadCount] = await Promise.all([
        prisma.matchSquad.count({
          where: { matchId, teamId: homeTeamId },
        }),
        prisma.matchSquad.count({
          where: { matchId, teamId: awayTeamId },
        }),
      ]);
      homeTeamPlayers = homeSquadCount;
      awayTeamPlayers = awaySquadCount;
    } else {
      // For regular matches, check active contracts
      const [homeTeamContracts, awayTeamContracts] = await Promise.all([
        prisma.contract.count({
          where: { teamId: homeTeamId, isActive: true },
        }),
        prisma.contract.count({
          where: { teamId: awayTeamId, isActive: true },
        }),
      ]);
      homeTeamPlayers = homeTeamContracts;
      awayTeamPlayers = awayTeamContracts;
    }

    if (homeTeamPlayers < 4) {
      const homeTeam = await prisma.team.findUnique({ where: { id: homeTeamId } });
      throw new AppError(`${homeTeam?.name || 'Home team'} must have at least 4 players to play a match`, 400);
    }

    if (awayTeamPlayers < 4) {
      const awayTeam = await prisma.team.findUnique({ where: { id: awayTeamId } });
      throw new AppError(`${awayTeam?.name || 'Away team'} must have at least 4 players to play a match`, 400);
    }

    return true;
  }

  async getAllLiveMatches() {
    try {
      const matches = await prisma.match.findMany({
        where: {
          status: 'LIVE',
        },
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true,
            },
          },
          innings: {
            orderBy: {
              inningsNumber: 'desc',
            },
          },
        },
        orderBy: {
          matchDate: 'desc',
        },
      });

      // Format the data for dashboard display
      const formattedMatches = matches.map((match) => {
        const currentInnings = match.innings.find((i) => i.status === 'IN_PROGRESS') || match.innings[0];
        const firstInnings = match.innings.find((i) => i.inningsNumber === 1);

        return {
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          venue: match.venue,
          matchDate: match.matchDate,
          status: match.status,
          currentInnings: currentInnings
            ? {
                inningsNumber: currentInnings.inningsNumber,
                battingTeam:
                  currentInnings.battingTeamId === match.homeTeamId
                    ? match.homeTeam
                    : match.awayTeam,
                score: `${currentInnings.totalRuns}/${currentInnings.totalWickets}`,
                overs: currentInnings.totalOvers.toFixed(1),
                runRate: currentInnings.totalOvers > 0
                  ? (currentInnings.totalRuns / currentInnings.totalOvers).toFixed(2)
                  : '0.00',
              }
            : null,
          target: firstInnings && currentInnings?.inningsNumber === 2
            ? firstInnings.totalRuns + 1
            : null,
          requiredRunRate: firstInnings && currentInnings?.inningsNumber === 2
            ? this.calculateRequiredRunRate(
                firstInnings.totalRuns + 1 - currentInnings.totalRuns,
                (match.customOvers || 20) * 6 - Math.floor(currentInnings.totalOvers) * 6 - Math.round((currentInnings.totalOvers % 1) * 10)
              )
            : null,
        };
      });

      return formattedMatches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  private calculateRequiredRunRate(runsNeeded: number, ballsRemaining: number): string {
    if (ballsRemaining <= 0) return '0.00';
    return ((runsNeeded / ballsRemaining) * 6).toFixed(2);
  }
}
