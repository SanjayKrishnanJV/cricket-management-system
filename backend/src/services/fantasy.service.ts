import prisma from '../config/database';

export class FantasyService {
  /**
   * Default scoring rules for fantasy cricket
   */
  private defaultScoringRules = {
    run: 1,
    four: 1,
    six: 2,
    wicket: 25,
    catch: 8,
    maiden: 12,
    halfCentury: 8,
    century: 16,
    threeWickets: 4,
    fiveWickets: 8,
    strikeRateBonus: 6, // SR > 150 with min 20 balls
    economyBonus: 6, // ER < 6 with min 2 overs
  };

  /**
   * Create a fantasy league
   */
  async createLeague(data: {
    name: string;
    type: string;
    tournamentId: string;
    createdBy: string;
    maxTeams?: number;
    teamBudget?: number;
    maxPlayers?: number;
  }) {
    const joinCode =
      data.type === 'PRIVATE'
        ? Math.random().toString(36).substring(2, 10).toUpperCase()
        : null;

    const league = await prisma.fantasyLeague.create({
      data: {
        name: data.name,
        type: data.type as any,
        tournamentId: data.tournamentId,
        createdBy: data.createdBy,
        maxTeams: data.maxTeams || 10,
        teamBudget: data.teamBudget || 100.0,
        maxPlayers: data.maxPlayers || 11,
        scoringRules: JSON.stringify(this.defaultScoringRules),
        joinCode,
      },
      include: {
        tournament: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return { success: true, data: league };
  }

  /**
   * Join a fantasy league with join code
   */
  async joinLeague(userId: string, joinCode: string) {
    const league = await prisma.fantasyLeague.findUnique({
      where: { joinCode },
      include: { teams: true },
    });

    if (!league) {
      throw new Error('League not found');
    }

    if (league.teams.length >= league.maxTeams) {
      throw new Error('League is full');
    }

    return { success: true, data: league };
  }

  /**
   * Create a fantasy team
   */
  async createTeam(data: {
    leagueId: string;
    userId: string;
    name: string;
    players: string[];
    captain?: string;
    viceCaptain?: string;
  }) {
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: data.leagueId },
    });

    if (!league) {
      throw new Error('League not found');
    }

    // Check if user already has a team in this league
    const existing = await prisma.fantasyTeam.findUnique({
      where: {
        leagueId_userId: {
          leagueId: data.leagueId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new Error('You already have a team in this league');
    }

    // Validate player count
    if (data.players.length !== league.maxPlayers) {
      throw new Error(`Team must have exactly ${league.maxPlayers} players`);
    }

    // Calculate budget
    const playerValues = await prisma.fantasyPlayerValue.findMany({
      where: {
        playerId: { in: data.players },
        tournamentId: league.tournamentId,
      },
    });

    const budgetUsed = playerValues.reduce((sum, pv) => sum + pv.value, 0);

    if (budgetUsed > league.teamBudget) {
      throw new Error(
        `Budget exceeded. Used: ${budgetUsed}, Available: ${league.teamBudget}`
      );
    }

    // Create team
    const team = await prisma.fantasyTeam.create({
      data: {
        leagueId: data.leagueId,
        userId: data.userId,
        name: data.name,
        players: JSON.stringify(data.players),
        captain: data.captain,
        viceCaptain: data.viceCaptain,
        budgetUsed,
        budgetLeft: league.teamBudget - budgetUsed,
      },
      include: {
        league: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return { success: true, data: team };
  }

  /**
   * Calculate fantasy points for a match
   */
  async calculateMatchPoints(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: {
          include: {
            battingPerformances: {
              include: { player: true },
            },
            bowlingPerformances: {
              include: { player: true },
            },
          },
        },
      },
    });

    if (!match || !match.tournamentId) {
      throw new Error('Match not found or not part of a tournament');
    }

    // Get all fantasy leagues for this tournament
    const leagues = await prisma.fantasyLeague.findMany({
      where: { tournamentId: match.tournamentId },
      include: { teams: true },
    });

    for (const league of leagues) {
      const scoringRules = JSON.parse(league.scoringRules);

      for (const team of league.teams) {
        const playerIds = JSON.parse(team.players);
        let totalPoints = 0;
        const playerPoints: Record<string, number> = {};

        // Calculate points for each player in the team
        for (const playerId of playerIds) {
          let points = 0;

          // Find player's performances
          for (const innings of match.innings) {
            const batting = innings.battingPerformances.find(
              (bp) => bp.playerId === playerId
            );
            const bowling = innings.bowlingPerformances.find(
              (bp) => bp.playerId === playerId
            );

            if (batting) {
              points += batting.runs * scoringRules.run;
              points += batting.fours * scoringRules.four;
              points += batting.sixes * scoringRules.six;

              // Milestones
              if (batting.runs >= 100) {
                points += scoringRules.century;
              } else if (batting.runs >= 50) {
                points += scoringRules.halfCentury;
              }

              // Strike rate bonus
              if (batting.ballsFaced >= 20 && batting.strikeRate >= 150) {
                points += scoringRules.strikeRateBonus;
              }
            }

            if (bowling) {
              points += bowling.wickets * scoringRules.wicket;
              points += bowling.maidens * scoringRules.maiden;

              // Wicket milestones
              if (bowling.wickets >= 5) {
                points += scoringRules.fiveWickets;
              } else if (bowling.wickets >= 3) {
                points += scoringRules.threeWickets;
              }

              // Economy bonus
              if (bowling.oversBowled >= 2 && bowling.economyRate <= 6) {
                points += scoringRules.economyBonus;
              }
            }
          }

          // Apply captain/vice-captain multipliers
          if (playerId === team.captain) {
            points *= 2;
          } else if (playerId === team.viceCaptain) {
            points *= 1.5;
          }

          playerPoints[playerId] = points;
          totalPoints += points;
        }

        // Save match points
        await prisma.fantasyMatchPoints.upsert({
          where: {
            fantasyTeamId_matchId: {
              fantasyTeamId: team.id,
              matchId,
            },
          },
          update: {
            playerPoints: JSON.stringify(playerPoints),
            totalPoints,
          },
          create: {
            fantasyTeamId: team.id,
            matchId,
            playerPoints: JSON.stringify(playerPoints),
            totalPoints,
          },
        });

        // Update team total points
        const allMatchPoints = await prisma.fantasyMatchPoints.findMany({
          where: { fantasyTeamId: team.id },
        });

        const totalTeamPoints = allMatchPoints.reduce(
          (sum, mp) => sum + mp.totalPoints,
          0
        );

        await prisma.fantasyTeam.update({
          where: { id: team.id },
          data: { totalPoints: totalTeamPoints },
        });
      }

      // Recalculate ranks for the league
      await this.recalculateLeagueRanks(league.id);
    }

    console.log(`✅ Fantasy points calculated for match ${matchId}`);

    return { success: true, message: 'Fantasy points calculated' };
  }

  /**
   * Recalculate league ranks
   */
  async recalculateLeagueRanks(leagueId: string) {
    const teams = await prisma.fantasyTeam.findMany({
      where: { leagueId },
      orderBy: { totalPoints: 'desc' },
    });

    for (let i = 0; i < teams.length; i++) {
      await prisma.fantasyTeam.update({
        where: { id: teams[i].id },
        data: { rank: i + 1 },
      });
    }
  }

  /**
   * Get league leaderboard
   */
  async getLeagueLeaderboard(leagueId: string) {
    const teams = await prisma.fantasyTeam.findMany({
      where: { leagueId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { totalPoints: 'desc' },
    });

    return { success: true, data: teams };
  }

  /**
   * Get player values for a tournament
   */
  async getPlayerValues(tournamentId: string) {
    const values = await prisma.fantasyPlayerValue.findMany({
      where: { tournamentId },
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
      orderBy: { value: 'desc' },
    });

    return { success: true, data: values };
  }

  /**
   * Initialize player values for a tournament
   */
  async initializePlayerValues(tournamentId: string) {
    // Get all players in the tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          include: {
            team: {
              include: {
                contracts: {
                  where: { isActive: true },
                  include: { player: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const players: any[] = [];
    for (const tt of tournament.teams) {
      for (const contract of tt.team.contracts) {
        players.push(contract.player);
      }
    }

    // Initialize values (default: 8.0 for all players)
    for (const player of players) {
      await prisma.fantasyPlayerValue.upsert({
        where: {
          playerId_tournamentId: {
            playerId: player.id,
            tournamentId,
          },
        },
        update: {},
        create: {
          playerId: player.id,
          tournamentId,
          value: 8.0,
          ownership: 0,
          formMultiplier: 1.0,
        },
      });
    }

    console.log(`✅ Initialized ${players.length} player values for tournament`);

    return { success: true, count: players.length };
  }

  /**
   * Get fantasy team details
   */
  async getTeamDetails(teamId: string) {
    const team = await prisma.fantasyTeam.findUnique({
      where: { id: teamId },
      include: {
        league: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        matchPoints: {
          include: {
            match: {
              select: {
                id: true,
                homeTeam: { select: { name: true } },
                awayTeam: { select: { name: true } },
                matchDate: true,
              },
            },
          },
          orderBy: { calculatedAt: 'desc' },
        },
      },
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get player details
    const playerIds = JSON.parse(team.players);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: {
        id: true,
        name: true,
        role: true,
        imageUrl: true,
      },
    });

    return {
      success: true,
      data: {
        ...team,
        playerDetails: players,
      },
    };
  }
}

export const fantasyService = new FantasyService();
