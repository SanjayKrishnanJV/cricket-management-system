import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CricketUtils } from '../utils/cricket.utils';

export class PlayerService {
  async createPlayer(data: {
    name: string;
    role: string;
    age: number;
    nationality: string;
    basePrice: number;
    imageUrl?: string;
  }) {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        role: data.role as any,
        age: data.age,
        nationality: data.nationality,
        basePrice: data.basePrice,
        imageUrl: data.imageUrl,
      },
    });

    return player;
  }

  async getAllPlayers(filters?: {
    role?: string;
    nationality?: string;
    available?: boolean;
  }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.nationality) {
      where.nationality = filters.nationality;
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        contracts: {
          where: { isActive: true },
          include: {
            team: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out players with active contracts if available filter is true
    if (filters?.available) {
      return players.filter(player => player.contracts.length === 0);
    }

    return players;
  }

  async getPlayerById(id: string) {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            team: true,
          },
        },
        battingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    venue: true,
                    matchDate: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        bowlingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    venue: true,
                    matchDate: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    return player;
  }

  async updatePlayer(id: string, data: any) {
    const player = await prisma.player.update({
      where: { id },
      data,
    });

    return player;
  }

  async deletePlayer(id: string) {
    await prisma.player.delete({
      where: { id },
    });

    return { message: 'Player deleted successfully' };
  }

  async updatePlayerStats(playerId: string) {
    const battingStats = await prisma.battingPerformance.findMany({
      where: { playerId },
    });

    const bowlingStats = await prisma.bowlingPerformance.findMany({
      where: { playerId },
    });

    let totalRuns = 0;
    let totalBallsFaced = 0;
    let dismissals = 0;
    let highestScore = 0;

    battingStats.forEach(stat => {
      totalRuns += stat.runs;
      totalBallsFaced += stat.ballsFaced;
      if (stat.isOut) dismissals++;
      if (stat.runs > highestScore) highestScore = stat.runs;
    });

    let totalWickets = 0;
    let totalRunsConceded = 0;
    let totalOversBowled = 0;

    bowlingStats.forEach(stat => {
      totalWickets += stat.wickets;
      totalRunsConceded += stat.runsConceded;
      totalOversBowled += stat.oversBowled;
    });

    const battingAverage = CricketUtils.calculateBattingAverage(totalRuns, dismissals);
    const strikeRate = CricketUtils.calculateStrikeRate(totalRuns, totalBallsFaced);
    const bowlingAverage = CricketUtils.calculateBowlingAverage(totalRunsConceded, totalWickets);
    const economyRate = CricketUtils.calculateEconomyRate(totalRunsConceded, totalOversBowled);

    await prisma.player.update({
      where: { id: playerId },
      data: {
        totalMatches: battingStats.length,
        totalRuns,
        totalWickets,
        battingAverage,
        strikeRate,
        bowlingAverage,
        economyRate,
        highestScore,
      },
    });
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
                    homeTeam: { select: { name: true } },
                    awayTeam: { select: { name: true } },
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
      recentPerformances: {
        batting: player.battingStats.slice(0, 10),
        bowling: player.bowlingStats.slice(0, 10),
      },
    };
  }
}
