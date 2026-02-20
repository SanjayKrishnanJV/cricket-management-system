import prisma from '../config/database';

export class LeaderboardService {
  /**
   * Get leaderboard by type
   */
  async getLeaderboard(
    type: string,
    period: string = 'ALL_TIME',
    tournamentId?: string,
    limit: number = 50
  ) {
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        type: type as any,
        period: period as any,
        tournamentId: tournamentId || null,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            role: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    return { success: true, data: entries };
  }

  /**
   * Get player rank in a specific leaderboard
   */
  async getPlayerRank(playerId: string, type: string, tournamentId?: string) {
    const entry = await prisma.leaderboardEntry.findUnique({
      where: {
        type_period_tournamentId_seasonYear_playerId_userId: {
          type: type as any,
          period: 'ALL_TIME',
          tournamentId: tournamentId || null,
          seasonYear: null,
          playerId,
          userId: null,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            role: true,
            imageUrl: true,
          },
        },
      },
    });

    return { success: true, data: entry };
  }

  /**
   * Recalculate runs leaderboard (all-time or tournament-specific)
   */
  async recalculateRunsLeaderboard(tournamentId?: string) {
    const whereClause: any = {};
    if (tournamentId) {
      whereClause.innings = { match: { tournamentId } };
    }

    // Aggregate runs by player
    const playerStats = await prisma.battingPerformance.groupBy({
      by: ['playerId'],
      where: whereClause,
      _sum: {
        runs: true,
      },
      _count: {
        id: true,
      },
    });

    // Sort by runs and assign ranks
    const sortedStats = playerStats
      .sort((a, b) => (b._sum.runs || 0) - (a._sum.runs || 0))
      .filter((stat) => stat._sum.runs && stat._sum.runs > 0);

    // Upsert leaderboard entries
    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      const type = tournamentId ? 'RUNS_TOURNAMENT' : 'RUNS_ALL_TIME';

      await prisma.leaderboardEntry.upsert({
        where: {
          type_period_tournamentId_seasonYear_playerId_userId: {
            type: type as any,
            period: 'ALL_TIME',
            tournamentId: tournamentId || null,
            seasonYear: null,
            playerId: stat.playerId,
            userId: null,
          },
        },
        update: {
          rank: i + 1,
          value: stat._sum.runs || 0,
          matchesPlayed: stat._count.id,
          lastUpdated: new Date(),
        },
        create: {
          type: type as any,
          period: 'ALL_TIME',
          tournamentId: tournamentId || null,
          playerId: stat.playerId,
          rank: i + 1,
          value: stat._sum.runs || 0,
          matchesPlayed: stat._count.id,
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Runs leaderboard recalculated: ${sortedStats.length} entries`);
    return { success: true, count: sortedStats.length };
  }

  /**
   * Recalculate wickets leaderboard
   */
  async recalculateWicketsLeaderboard(tournamentId?: string) {
    const whereClause: any = {};
    if (tournamentId) {
      whereClause.innings = { match: { tournamentId } };
    }

    const playerStats = await prisma.bowlingPerformance.groupBy({
      by: ['playerId'],
      where: whereClause,
      _sum: {
        wickets: true,
      },
      _count: {
        id: true,
      },
    });

    const sortedStats = playerStats
      .sort((a, b) => (b._sum.wickets || 0) - (a._sum.wickets || 0))
      .filter((stat) => stat._sum.wickets && stat._sum.wickets > 0);

    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];
      const type = tournamentId ? 'WICKETS_TOURNAMENT' : 'WICKETS_ALL_TIME';

      await prisma.leaderboardEntry.upsert({
        where: {
          type_period_tournamentId_seasonYear_playerId_userId: {
            type: type as any,
            period: 'ALL_TIME',
            tournamentId: tournamentId || null,
            seasonYear: null,
            playerId: stat.playerId,
            userId: null,
          },
        },
        update: {
          rank: i + 1,
          value: stat._sum.wickets || 0,
          matchesPlayed: stat._count.id,
          lastUpdated: new Date(),
        },
        create: {
          type: type as any,
          period: 'ALL_TIME',
          tournamentId: tournamentId || null,
          playerId: stat.playerId,
          rank: i + 1,
          value: stat._sum.wickets || 0,
          matchesPlayed: stat._count.id,
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Wickets leaderboard recalculated: ${sortedStats.length} entries`);
    return { success: true, count: sortedStats.length };
  }

  /**
   * Recalculate strike rate leaderboard (min 100 balls faced)
   */
  async recalculateStrikeRateLeaderboard(tournamentId?: string) {
    const whereClause: any = {
      ballsFaced: { gte: 100 },
    };
    if (tournamentId) {
      whereClause.innings = { match: { tournamentId } };
    }

    const playerStats = await prisma.battingPerformance.groupBy({
      by: ['playerId'],
      where: whereClause,
      _avg: {
        strikeRate: true,
      },
      _sum: {
        ballsFaced: true,
      },
      _count: {
        id: true,
      },
    });

    const sortedStats = playerStats
      .sort((a, b) => (b._avg.strikeRate || 0) - (a._avg.strikeRate || 0))
      .filter((stat) => stat._avg.strikeRate);

    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];

      await prisma.leaderboardEntry.upsert({
        where: {
          type_period_tournamentId_seasonYear_playerId_userId: {
            type: 'STRIKE_RATE',
            period: 'ALL_TIME',
            tournamentId: tournamentId || null,
            seasonYear: null,
            playerId: stat.playerId,
            userId: null,
          },
        },
        update: {
          rank: i + 1,
          value: stat._avg.strikeRate || 0,
          matchesPlayed: stat._count.id,
          metadata: JSON.stringify({ totalBalls: stat._sum.ballsFaced }),
          lastUpdated: new Date(),
        },
        create: {
          type: 'STRIKE_RATE',
          period: 'ALL_TIME',
          tournamentId: tournamentId || null,
          playerId: stat.playerId,
          rank: i + 1,
          value: stat._avg.strikeRate || 0,
          matchesPlayed: stat._count.id,
          metadata: JSON.stringify({ totalBalls: stat._sum.ballsFaced }),
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Strike rate leaderboard recalculated: ${sortedStats.length} entries`);
    return { success: true, count: sortedStats.length };
  }

  /**
   * Recalculate economy rate leaderboard (min 10 overs bowled)
   */
  async recalculateEconomyLeaderboard(tournamentId?: string) {
    const whereClause: any = {
      oversBowled: { gte: 10 },
    };
    if (tournamentId) {
      whereClause.innings = { match: { tournamentId } };
    }

    const playerStats = await prisma.bowlingPerformance.groupBy({
      by: ['playerId'],
      where: whereClause,
      _avg: {
        economyRate: true,
      },
      _sum: {
        oversBowled: true,
      },
      _count: {
        id: true,
      },
    });

    const sortedStats = playerStats
      .sort((a, b) => (a._avg.economyRate || 999) - (b._avg.economyRate || 999))
      .filter((stat) => stat._avg.economyRate);

    for (let i = 0; i < sortedStats.length; i++) {
      const stat = sortedStats[i];

      await prisma.leaderboardEntry.upsert({
        where: {
          type_period_tournamentId_seasonYear_playerId_userId: {
            type: 'ECONOMY_RATE',
            period: 'ALL_TIME',
            tournamentId: tournamentId || null,
            seasonYear: null,
            playerId: stat.playerId,
            userId: null,
          },
        },
        update: {
          rank: i + 1,
          value: stat._avg.economyRate || 0,
          matchesPlayed: stat._count.id,
          metadata: JSON.stringify({ totalOvers: stat._sum.oversBowled }),
          lastUpdated: new Date(),
        },
        create: {
          type: 'ECONOMY_RATE',
          period: 'ALL_TIME',
          tournamentId: tournamentId || null,
          playerId: stat.playerId,
          rank: i + 1,
          value: stat._avg.economyRate || 0,
          matchesPlayed: stat._count.id,
          metadata: JSON.stringify({ totalOvers: stat._sum.oversBowled }),
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Economy rate leaderboard recalculated: ${sortedStats.length} entries`);
    return { success: true, count: sortedStats.length };
  }

  /**
   * Recalculate all leaderboards
   */
  async recalculateLeaderboards() {
    console.log('🔄 Starting leaderboard recalculation...');

    await this.recalculateRunsLeaderboard();
    await this.recalculateWicketsLeaderboard();
    await this.recalculateStrikeRateLeaderboard();
    await this.recalculateEconomyLeaderboard();

    console.log('✅ All leaderboards recalculated');

    return { success: true, message: 'All leaderboards recalculated' };
  }
}

export const leaderboardService = new LeaderboardService();
