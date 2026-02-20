import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CricketUtils } from '../utils/cricket.utils';
import { tournamentSchedulingService } from './tournament-scheduling.service';

export class TournamentService {
  async createTournament(data: {
    name: string;
    format: string;
    type: string;
    startDate: string;
    endDate: string;
    prizePool?: number;
    description?: string;
    adminId: string;
    numberOfTeams?: number;
    autoScheduleMatches?: boolean;
    oversPerMatch?: number;
    powerplayOvers?: number;
    maxPlayersPerTeam?: number;
    minPlayersPerTeam?: number;
    rules?: string;
  }) {
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        format: data.format as any,
        type: data.type as any,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        prizePool: data.prizePool,
        description: data.description,
        adminId: data.adminId,
        numberOfTeams: data.numberOfTeams,
        autoScheduleMatches: data.autoScheduleMatches || false,
        oversPerMatch: data.oversPerMatch,
        powerplayOvers: data.powerplayOvers,
        maxPlayersPerTeam: data.maxPlayersPerTeam,
        minPlayersPerTeam: data.minPlayersPerTeam,
        rules: data.rules,
      },
    });

    return tournament;
  }

  async getAllTournaments() {
    const tournaments = await prisma.tournament.findMany({
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
              },
            },
          },
        },
        matches: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return tournaments;
  }

  async getTournamentById(id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        teams: {
          include: {
            team: {
              include: {
                contracts: {
                  where: { isActive: true },
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
        },
        matches: {
          include: {
            homeTeam: {
              select: {
                name: true,
                shortName: true,
              },
            },
            awayTeam: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
          orderBy: { matchDate: 'asc' },
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

    return tournament;
  }

  async updateTournament(id: string, data: {
    name?: string;
    format?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    prizePool?: number;
    description?: string;
    numberOfTeams?: number;
    oversPerMatch?: number;
    powerplayOvers?: number;
    maxPlayersPerTeam?: number;
    minPlayersPerTeam?: number;
    rules?: string;
  }) {
    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!existingTournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Prepare update data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.format !== undefined) updateData.format = data.format;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.prizePool !== undefined) updateData.prizePool = data.prizePool;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.numberOfTeams !== undefined) updateData.numberOfTeams = data.numberOfTeams;
    if (data.oversPerMatch !== undefined) updateData.oversPerMatch = data.oversPerMatch;
    if (data.powerplayOvers !== undefined) updateData.powerplayOvers = data.powerplayOvers;
    if (data.maxPlayersPerTeam !== undefined) updateData.maxPlayersPerTeam = data.maxPlayersPerTeam;
    if (data.minPlayersPerTeam !== undefined) updateData.minPlayersPerTeam = data.minPlayersPerTeam;
    if (data.rules !== undefined) updateData.rules = data.rules;

    // Update tournament
    const tournament = await prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return tournament;
  }

  async deleteTournament(id: string) {
    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Delete tournament (this will cascade delete related records based on schema)
    await prisma.tournament.delete({
      where: { id },
    });
  }

  async addTeamToTournament(tournamentId: string, teamId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!tournament || !team) {
      throw new AppError('Tournament or Team not found', 404);
    }

    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId,
      },
    });

    await prisma.pointsTable.create({
      data: {
        tournamentId,
        teamId,
      },
    });

    return tournamentTeam;
  }

  async generateFixtures(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    const teams = tournament.teams.map(tt => tt.team);

    if (teams.length < 2) {
      throw new AppError('At least 2 teams required', 400);
    }

    const matches = [];
    const startDate = new Date(tournament.startDate);

    if (tournament.type === 'LEAGUE' || tournament.type === 'LEAGUE_KNOCKOUT') {
      let matchCount = 0;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const matchDate = new Date(startDate);
          matchDate.setDate(matchDate.getDate() + matchCount * 2);

          const match = await prisma.match.create({
            data: {
              tournamentId,
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              venue: `Stadium ${matchCount + 1}`,
              matchDate,
            },
          });

          matches.push(match);
          matchCount++;
        }
      }
    }

    return matches;
  }

  async getPointsTable(tournamentId: string) {
    const pointsTable = await prisma.pointsTable.findMany({
      where: { tournamentId },
      orderBy: [
        { points: 'desc' },
        { netRunRate: 'desc' },
      ],
    });

    const enrichedTable = await Promise.all(
      pointsTable.map(async (entry) => {
        const team = await prisma.team.findUnique({
          where: { id: entry.teamId },
          select: {
            name: true,
            shortName: true,
            logoUrl: true,
          },
        });

        return {
          ...entry,
          team,
        };
      })
    );

    return enrichedTable;
  }

  async updatePointsTable(tournamentId: string, matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: true,
      },
    });

    if (!match || match.status !== 'COMPLETED' || !match.winnerId) {
      return;
    }

    const loserId = match.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

    const winnerInnings = match.innings.find(i => i.battingTeamId === match.winnerId);
    const loserInnings = match.innings.find(i => i.battingTeamId === loserId);

    if (winnerInnings && loserInnings) {
      const winnerEntry = await prisma.pointsTable.findFirst({
        where: {
          tournamentId,
          teamId: match.winnerId,
        },
      });

      const loserEntry = await prisma.pointsTable.findFirst({
        where: {
          tournamentId,
          teamId: loserId,
        },
      });

      if (winnerEntry) {
        const winnerOvers = CricketUtils.ballsToOvers(
          CricketUtils.oversToBalls(winnerEntry.oversPlayed) +
          CricketUtils.oversToBalls(winnerInnings.totalOvers)
        );

        const winnerFaced = CricketUtils.ballsToOvers(
          CricketUtils.oversToBalls(winnerEntry.oversFaced) +
          CricketUtils.oversToBalls(loserInnings.totalOvers)
        );

        const newWinnerNRR = CricketUtils.calculateNetRunRate(
          winnerEntry.runsScored + winnerInnings.totalRuns,
          winnerOvers,
          winnerEntry.runsConceded + loserInnings.totalRuns,
          winnerFaced
        );

        await prisma.pointsTable.update({
          where: { id: winnerEntry.id },
          data: {
            played: winnerEntry.played + 1,
            won: winnerEntry.won + 1,
            points: winnerEntry.points + 2,
            runsScored: winnerEntry.runsScored + winnerInnings.totalRuns,
            runsConceded: winnerEntry.runsConceded + loserInnings.totalRuns,
            oversPlayed: winnerOvers,
            oversFaced: winnerFaced,
            netRunRate: newWinnerNRR,
          },
        });
      }

      if (loserEntry) {
        const loserOvers = CricketUtils.ballsToOvers(
          CricketUtils.oversToBalls(loserEntry.oversPlayed) +
          CricketUtils.oversToBalls(loserInnings.totalOvers)
        );

        const loserFaced = CricketUtils.ballsToOvers(
          CricketUtils.oversToBalls(loserEntry.oversFaced) +
          CricketUtils.oversToBalls(winnerInnings.totalOvers)
        );

        const newLoserNRR = CricketUtils.calculateNetRunRate(
          loserEntry.runsScored + loserInnings.totalRuns,
          loserOvers,
          loserEntry.runsConceded + winnerInnings.totalRuns,
          loserFaced
        );

        await prisma.pointsTable.update({
          where: { id: loserEntry.id },
          data: {
            played: loserEntry.played + 1,
            lost: loserEntry.lost + 1,
            runsScored: loserEntry.runsScored + loserInnings.totalRuns,
            runsConceded: loserEntry.runsConceded + winnerInnings.totalRuns,
            oversPlayed: loserOvers,
            oversFaced: loserFaced,
            netRunRate: newLoserNRR,
          },
        });
      }
    }
  }
}
