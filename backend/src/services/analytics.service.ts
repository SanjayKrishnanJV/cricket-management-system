import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CricketUtils } from '../utils/cricket.utils';

export class AnalyticsService {
  async getMatchAnalytics(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: {
          include: {
            balls: {
              include: {
                batsman: {
                  select: { name: true },
                },
                bowler: {
                  select: { name: true },
                },
              },
            },
            battingPerformances: {
              include: {
                player: {
                  select: { name: true },
                },
              },
            },
            bowlingPerformances: {
              include: {
                player: {
                  select: { name: true },
                },
              },
            },
          },
        },
        tournament: true,
        matchAnalytics: true,
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const analytics: any = {
      matchId: match.id,
      innings: [],
    };

    match.innings.forEach((innings, index) => {
      const powerplayBalls = innings.balls.filter(b =>
        CricketUtils.isPowerplay(b.overNumber, match.tournament.format)
      );

      const deathOverBalls = innings.balls.filter(b =>
        CricketUtils.isDeathOvers(b.overNumber, match.tournament.format)
      );

      const powerplayRuns = powerplayBalls.reduce((sum, b) =>
        sum + b.runs + (b.isExtra ? b.extraRuns : 0), 0
      );

      const powerplayWickets = powerplayBalls.filter(b => b.isWicket).length;

      const deathOversRuns = deathOverBalls.reduce((sum, b) =>
        sum + b.runs + (b.isExtra ? b.extraRuns : 0), 0
      );

      const deathOversWickets = deathOverBalls.filter(b => b.isWicket).length;

      const runRateByOver: any[] = [];
      for (let i = 0; i <= Math.floor(innings.totalOvers); i++) {
        const overBalls = innings.balls.filter(b => b.overNumber === i);
        const overRuns = overBalls.reduce((sum, b) =>
          sum + b.runs + (b.isExtra ? b.extraRuns : 0), 0
        );
        runRateByOver.push({
          over: i,
          runs: overRuns,
        });
      }

      const partnerships: any[] = [];
      let currentPartnership = {
        batsman1: '',
        batsman2: '',
        runs: 0,
        balls: 0,
      };

      const inningsAnalytics = {
        inningsNumber: innings.inningsNumber,
        totalRuns: innings.totalRuns,
        totalWickets: innings.totalWickets,
        totalOvers: innings.totalOvers,
        runRate: CricketUtils.calculateCurrentRunRate(innings.totalRuns, innings.totalOvers),
        powerplay: {
          runs: powerplayRuns,
          wickets: powerplayWickets,
          runRate: powerplayBalls.length > 0 ?
            CricketUtils.calculateCurrentRunRate(powerplayRuns, 6) : 0,
        },
        deathOvers: {
          runs: deathOversRuns,
          wickets: deathOversWickets,
        },
        runRateByOver,
        topScorers: innings.battingPerformances
          .sort((a, b) => b.runs - a.runs)
          .slice(0, 5)
          .map(p => ({
            player: p.player.name,
            runs: p.runs,
            balls: p.ballsFaced,
            strikeRate: p.strikeRate,
          })),
        topBowlers: innings.bowlingPerformances
          .sort((a, b) => b.wickets - a.wickets || a.economyRate - b.economyRate)
          .slice(0, 5)
          .map(p => ({
            player: p.player.name,
            overs: p.oversBowled,
            wickets: p.wickets,
            runs: p.runsConceded,
            economyRate: p.economyRate,
          })),
      };

      analytics.innings.push(inningsAnalytics);
    });

    if (match.innings.length === 2 && match.innings[1].status === 'IN_PROGRESS') {
      const target = match.innings[0].totalRuns + 1;
      const currentRuns = match.innings[1].totalRuns;
      const wicketsLost = match.innings[1].totalWickets;
      const oversRemaining = 20 - match.innings[1].totalOvers;

      const winProbability = CricketUtils.calculateWinProbability(
        target,
        currentRuns,
        wicketsLost,
        oversRemaining
      );

      analytics.chase = {
        target,
        currentRuns,
        runsNeeded: target - currentRuns,
        wicketsLost,
        oversRemaining,
        currentRunRate: CricketUtils.calculateCurrentRunRate(currentRuns, match.innings[1].totalOvers),
        requiredRunRate: CricketUtils.calculateRequiredRunRate(target, currentRuns, oversRemaining),
        winProbability,
      };
    }

    return analytics;
  }

  async getPlayerAnalytics(playerId: string) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        battingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    matchDate: true,
                    venue: true,
                  },
                },
              },
            },
          },
        },
        bowlingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    matchDate: true,
                    venue: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    const battingByMatch = player.battingStats.map(stat => ({
      matchDate: stat.innings.match.matchDate,
      venue: stat.innings.match.venue,
      runs: stat.runs,
      balls: stat.ballsFaced,
      strikeRate: stat.strikeRate,
    }));

    const bowlingByMatch = player.bowlingStats.map(stat => ({
      matchDate: stat.innings.match.matchDate,
      venue: stat.innings.match.venue,
      wickets: stat.wickets,
      runs: stat.runsConceded,
      overs: stat.oversBowled,
      economyRate: stat.economyRate,
    }));

    return {
      player: {
        id: player.id,
        name: player.name,
        role: player.role,
        totalMatches: player.totalMatches,
        totalRuns: player.totalRuns,
        totalWickets: player.totalWickets,
        battingAverage: player.battingAverage,
        strikeRate: player.strikeRate,
        bowlingAverage: player.bowlingAverage,
        economyRate: player.economyRate,
        highestScore: player.highestScore,
      },
      battingByMatch,
      bowlingByMatch,
    };
  }

  async getTeamAnalytics(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        homeMatches: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            innings: true,
          },
        },
        awayMatches: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            innings: true,
          },
        },
        teamStats: true,
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    const allMatches = [...team.homeMatches, ...team.awayMatches];

    const wins = allMatches.filter(m => m.winnerId === teamId).length;
    const losses = allMatches.length - wins;
    const winPercentage = allMatches.length > 0 ? (wins / allMatches.length) * 100 : 0;

    const recentForm = allMatches
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, 5)
      .map(m => m.winnerId === teamId ? 'W' : 'L');

    return {
      team: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
      },
      stats: {
        matchesPlayed: allMatches.length,
        wins,
        losses,
        winPercentage: parseFloat(winPercentage.toFixed(2)),
        recentForm,
      },
      teamStats: team.teamStats,
    };
  }

  async getTournamentAnalytics(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            innings: {
              include: {
                battingPerformances: {
                  include: {
                    player: {
                      select: { name: true },
                    },
                  },
                },
                bowlingPerformances: {
                  include: {
                    player: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
        pointsTable: {
          orderBy: [
            { points: 'desc' },
            { netRunRate: 'desc' },
          ],
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    const allBattingPerformances: any[] = [];
    const allBowlingPerformances: any[] = [];

    tournament.matches.forEach(match => {
      match.innings.forEach(innings => {
        allBattingPerformances.push(...innings.battingPerformances);
        allBowlingPerformances.push(...innings.bowlingPerformances);
      });
    });

    const topRunScorers = allBattingPerformances
      .reduce((acc: any[], perf) => {
        const existing = acc.find(p => p.playerId === perf.playerId);
        if (existing) {
          existing.runs += perf.runs;
          existing.balls += perf.ballsFaced;
          existing.matches += 1;
        } else {
          acc.push({
            playerId: perf.playerId,
            playerName: perf.player.name,
            runs: perf.runs,
            balls: perf.ballsFaced,
            matches: 1,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    const topWicketTakers = allBowlingPerformances
      .reduce((acc: any[], perf) => {
        const existing = acc.find(p => p.playerId === perf.playerId);
        if (existing) {
          existing.wickets += perf.wickets;
          existing.runs += perf.runsConceded;
          existing.overs += perf.oversBowled;
          existing.matches += 1;
        } else {
          acc.push({
            playerId: perf.playerId,
            playerName: perf.player.name,
            wickets: perf.wickets,
            runs: perf.runsConceded,
            overs: perf.oversBowled,
            matches: 1,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 10);

    return {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        format: tournament.format,
        type: tournament.type,
      },
      stats: {
        totalMatches: tournament.matches.length,
        topRunScorers,
        topWicketTakers,
      },
      pointsTable: tournament.pointsTable,
    };
  }

  // ===== MANHATTAN CHART DATA (Run Rate by Over) =====
  async getManhattanChart(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true },
        },
        innings: {
          include: {
            overs: {
              orderBy: { overNumber: 'asc' },
              select: {
                overNumber: true,
                runsScored: true,
                wickets: true,
                maiden: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const manhattanData = match.innings.map(innings => {
      const battingTeam = innings.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
      return {
        inningsNumber: innings.inningsNumber,
        teamName: battingTeam.name,
        teamShortName: battingTeam.shortName,
        overs: innings.overs.map(over => ({
          overNumber: over.overNumber,
          runs: over.runsScored,
          wickets: over.wickets,
          isMaiden: over.maiden,
        })),
      };
    });

    return {
      matchId: match.id,
      data: manhattanData,
    };
  }

  // ===== WORM CHART DATA (Cumulative Runs) =====
  async getWormChart(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true },
        },
        innings: {
          include: {
            overs: {
              orderBy: { overNumber: 'asc' },
              select: {
                overNumber: true,
                runsScored: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const wormData = match.innings.map(innings => {
      const battingTeam = innings.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
      let cumulativeRuns = 0;
      const overs = innings.overs.map(over => {
        cumulativeRuns += over.runsScored;
        return {
          overNumber: over.overNumber,
          runs: cumulativeRuns,
        };
      });

      return {
        inningsNumber: innings.inningsNumber,
        teamName: battingTeam.name,
        teamShortName: battingTeam.shortName,
        overs,
      };
    });

    return {
      matchId: match.id,
      data: wormData,
    };
  }

  // ===== PARTNERSHIP ANALYSIS =====
  async getPartnershipAnalysis(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true },
        },
        innings: {
          include: {
            balls: {
              orderBy: { createdAt: 'asc' },
              include: {
                batsman: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const partnerships = match.innings.map(innings => {
      const battingTeam = innings.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
      const partnershipData: any[] = [];
      let currentPartnership: any = null;

      innings.balls.forEach(ball => {
        if (!currentPartnership) {
          currentPartnership = {
            batsman1: ball.batsman.name,
            batsman1Id: ball.batsman.id,
            batsman2: null,
            batsman2Id: null,
            runs: 0,
            balls: 0,
            wicket: null,
          };
        }

        // Update partnership stats
        currentPartnership.runs += ball.runs;
        if (!ball.isExtra) {
          currentPartnership.balls += 1;
        }

        // Track second batsman
        if (!currentPartnership.batsman2 && ball.batsman.id !== currentPartnership.batsman1Id) {
          currentPartnership.batsman2 = ball.batsman.name;
          currentPartnership.batsman2Id = ball.batsman.id;
        }

        // End partnership on wicket
        if (ball.isWicket) {
          currentPartnership.wicket = ball.wicketType;
          partnershipData.push({ ...currentPartnership });
          currentPartnership = null;
        }
      });

      // Add last partnership if match ended without wicket
      if (currentPartnership) {
        partnershipData.push(currentPartnership);
      }

      return {
        inningsNumber: innings.inningsNumber,
        teamName: battingTeam.name,
        partnerships: partnershipData,
      };
    });

    return {
      matchId: match.id,
      data: partnerships,
    };
  }

  // ===== PHASE-WISE ANALYSIS (Powerplay, Middle, Death) =====
  async getPhaseAnalysis(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: { format: true },
        },
        homeTeam: {
          select: { id: true, name: true, shortName: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true },
        },
        innings: {
          include: {
            balls: {
              select: {
                overNumber: true,
                runs: true,
                isWicket: true,
                isExtra: true,
                extraRuns: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const format = match.tournament?.format || 'T20';

    // Define phase boundaries based on format
    let powerplayEnd = 6;
    let deathStart = 16;
    if (format === 'ODI') {
      powerplayEnd = 10;
      deathStart = 40;
    }

    const phaseData = match.innings.map(innings => {
      const battingTeam = innings.battingTeamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
      const powerplayBalls = innings.balls.filter(b => b.overNumber < powerplayEnd);
      const middleBalls = innings.balls.filter(b => b.overNumber >= powerplayEnd && b.overNumber < deathStart);
      const deathBalls = innings.balls.filter(b => b.overNumber >= deathStart);

      const calculatePhaseStats = (balls: any[]) => {
        const runs = balls.reduce((sum, b) => sum + b.runs + (b.isExtra ? b.extraRuns : 0), 0);
        const wickets = balls.filter(b => b.isWicket).length;
        const legalBalls = balls.filter(b => !b.isExtra).length;
        const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;

        return {
          runs,
          wickets,
          balls: legalBalls,
          overs: parseFloat(overs.toFixed(1)),
          runRate: overs > 0 ? (runs / overs).toFixed(2) : '0.00',
        };
      };

      return {
        inningsNumber: innings.inningsNumber,
        teamName: battingTeam.name,
        powerplay: calculatePhaseStats(powerplayBalls),
        middle: calculatePhaseStats(middleBalls),
        death: calculatePhaseStats(deathBalls),
      };
    });

    return {
      matchId: match.id,
      format,
      data: phaseData,
    };
  }

  // ==================== VISUALIZATION METHODS ====================

  async getWagonWheel(matchId: string, filters?: {
    batsmanId?: string;
    bowlerId?: string;
    inningsNumber?: number;
    minRuns?: number;
  }) {
    const where: any = {
      innings: { matchId },
      shotAngle: { not: null },
      shotDistance: { not: null },
    };

    if (filters?.batsmanId) where.batsmanId = filters.batsmanId;
    if (filters?.bowlerId) where.bowlerId = filters.bowlerId;
    if (filters?.inningsNumber) {
      where.innings = { matchId, inningsNumber: filters.inningsNumber };
    }
    if (filters?.minRuns) {
      where.runs = { gte: filters.minRuns };
    }

    const balls = await prisma.ball.findMany({
      where,
      include: {
        batsman: { select: { name: true } },
        bowler: { select: { name: true } },
      },
    });

    const shots = balls.map(ball => ({
      angle: ball.shotAngle,
      distance: ball.shotDistance,
      runs: ball.runs,
      isExtra: ball.isExtra,
      zone: ball.shotZone,
      batsman: ball.batsman.name,
      bowler: ball.bowler.name,
      over: ball.overNumber,
      ball: ball.ballNumber,
    }));

    return {
      matchId,
      totalShots: shots.length,
      data: shots,
    };
  }

  async getPitchMap(matchId: string, filters?: {
    bowlerId?: string;
    batsmanId?: string;
    inningsNumber?: number;
  }) {
    const where: any = {
      innings: { matchId },
      pitchX: { not: null },
      pitchY: { not: null },
    };

    if (filters?.bowlerId) where.bowlerId = filters.bowlerId;
    if (filters?.batsmanId) where.batsmanId = filters.batsmanId;
    if (filters?.inningsNumber) {
      where.innings = { matchId, inningsNumber: filters.inningsNumber };
    }

    const balls = await prisma.ball.findMany({
      where,
      include: {
        batsman: { select: { name: true } },
        bowler: { select: { name: true } },
      },
    });

    const pitches = balls.map(ball => ({
      x: ball.pitchX,
      y: ball.pitchY,
      line: ball.pitchLine,
      length: ball.pitchLength,
      runs: ball.runs,
      isWicket: ball.isWicket,
      wicketType: ball.wicketType,
      batsman: ball.batsman.name,
      bowler: ball.bowler.name,
      over: ball.overNumber,
    }));

    // Calculate heat map zones (5x4 grid)
    const heatMap = this.calculatePitchHeatMap(pitches);

    return {
      matchId,
      totalBalls: pitches.length,
      data: pitches,
      heatMap,
    };
  }

  private calculatePitchHeatMap(pitches: any[]): number[][] {
    // Divide pitch into 5x4 grid (5 lines x 4 lengths)
    const grid: number[][] = Array(5).fill(0).map(() => Array(4).fill(0));

    pitches.forEach(pitch => {
      if (pitch.x !== null && pitch.y !== null) {
        const xBucket = Math.min(Math.max(Math.floor((pitch.x + 1) * 2.5), 0), 4); // -1 to 1 -> 0 to 4
        const yBucket = Math.min(Math.max(Math.floor(pitch.y * 4), 0), 3); // 0 to 1 -> 0 to 3
        grid[xBucket][yBucket]++;
      }
    });

    return grid;
  }

  async getFieldPlacements(matchId: string, overNumber?: number) {
    const where: any = { matchId };
    if (overNumber !== undefined) {
      where.overNumber = overNumber;
    }

    const placements = await prisma.fieldPlacement.findMany({
      where,
      include: {
        innings: {
          select: {
            inningsNumber: true,
            battingTeamId: true,
          },
        },
      },
      orderBy: [
        { overNumber: 'asc' },
        { ballNumber: 'asc' },
      ],
    });

    return {
      matchId,
      data: placements.map(p => ({
        id: p.id,
        inningsNumber: p.innings.inningsNumber,
        overNumber: p.overNumber,
        ballNumber: p.ballNumber,
        positions: JSON.parse(p.positions),
      })),
    };
  }

  async saveFieldPlacement(data: {
    matchId: string;
    inningsId: string;
    overNumber: number;
    ballNumber?: number;
    positions: any[];
  }) {
    return await prisma.fieldPlacement.create({
      data: {
        matchId: data.matchId,
        inningsId: data.inningsId,
        overNumber: data.overNumber,
        ballNumber: data.ballNumber,
        positions: JSON.stringify(data.positions),
      },
    });
  }

  async get3DReplayData(matchId: string, filters?: {
    overNumber?: number;
    ballNumber?: number;
    inningsNumber?: number;
  }) {
    const where: any = {
      innings: { matchId },
      ballTrajectory: { not: null },
    };

    if (filters?.overNumber) where.overNumber = filters.overNumber;
    if (filters?.ballNumber) where.ballNumber = filters.ballNumber;
    if (filters?.inningsNumber) {
      where.innings = { matchId, inningsNumber: filters.inningsNumber };
    }

    const balls = await prisma.ball.findMany({
      where,
      include: {
        batsman: { select: { name: true } },
        bowler: { select: { name: true } },
        innings: {
          select: {
            inningsNumber: true,
          },
        },
      },
      orderBy: [
        { overNumber: 'asc' },
        { ballNumber: 'asc' },
      ],
    });

    return {
      matchId,
      data: balls.map(ball => ({
        id: ball.id,
        inningsNumber: ball.innings.inningsNumber,
        overNumber: ball.overNumber,
        ballNumber: ball.ballNumber,
        bowler: ball.bowler.name,
        batsman: ball.batsman.name,
        trajectory: ball.ballTrajectory ? JSON.parse(ball.ballTrajectory) : null,
        speed: ball.ballSpeed,
        shotType: ball.shotType,
        shotAngle: ball.shotAngle,
        shotDistance: ball.shotDistance,
        runs: ball.runs,
        isWicket: ball.isWicket,
      })),
    };
  }
}
