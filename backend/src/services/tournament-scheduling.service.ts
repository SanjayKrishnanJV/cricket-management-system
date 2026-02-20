import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TournamentSchedulingService {
  /**
   * Generate round-robin matches for a tournament
   * Each team plays every other team once
   */
  async scheduleRoundRobinMatches(tournamentId: string) {
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

    if (tournament.matchesScheduled) {
      throw new AppError('Matches already scheduled for this tournament', 400);
    }

    const teams = tournament.teams.map(tt => tt.team);

    if (teams.length < 2) {
      throw new AppError('At least 2 teams required to schedule matches', 400);
    }

    // Generate round-robin fixtures (each team plays each other once)
    const matches = [];
    const oversPerMatch = tournament.oversPerMatch || 20;
    const startDate = new Date(tournament.startDate);
    let matchDate = new Date(startDate);

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          tournamentId: tournament.id,
          homeTeamId: teams[i].id,
          awayTeamId: teams[j].id,
          venue: `Stadium ${matches.length + 1}`,
          matchDate: new Date(matchDate),
          status: 'SCHEDULED' as any,
          isQuickMatch: false,
          customOvers: oversPerMatch,
        });

        // Schedule next match 2 days later
        matchDate = new Date(matchDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      }
    }

    // Create all matches
    await prisma.match.createMany({
      data: matches,
    });

    // Initialize points table
    for (const team of teams) {
      await prisma.pointsTable.create({
        data: {
          tournamentId: tournament.id,
          teamId: team.id,
        },
      });
    }

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        matchesScheduled: true,
      },
    });

    return {
      success: true,
      message: `${matches.length} matches scheduled successfully`,
      matchesCreated: matches.length,
    };
  }

  /**
   * Schedule playoffs based on points table
   * Top team goes to final
   * 2nd and 3rd play semi-final
   */
  async schedulePlayoffs(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: {
          where: {
            status: { not: 'COMPLETED' },
          },
        },
        pointsTable: {
          include: {
            team: true,
          },
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

    if (!tournament.matchesScheduled) {
      throw new AppError('Regular matches not scheduled yet', 400);
    }

    // Check if all league matches are completed
    const incompleteMatches = tournament.matches.filter(
      m => m.status !== 'COMPLETED'
    );

    if (incompleteMatches.length > 0) {
      throw new AppError(
        `${incompleteMatches.length} matches still pending. Complete all league matches first.`,
        400
      );
    }

    const standings = tournament.pointsTable;

    if (standings.length < 3) {
      throw new AppError('At least 3 teams required for playoffs', 400);
    }

    const firstPlace = standings[0];
    const secondPlace = standings[1];
    const thirdPlace = standings[2];

    const oversPerMatch = tournament.oversPerMatch || 20;
    const endDate = new Date(tournament.endDate);

    // Schedule semi-final (2nd vs 3rd)
    const semiFinalDate = new Date(endDate.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days before end
    const semiFinal = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: secondPlace.teamId,
        awayTeamId: thirdPlace.teamId,
        venue: 'Semi-Final Stadium',
        matchDate: semiFinalDate,
        status: 'SCHEDULED',
        matchType: 'SEMI_FINAL',
        isQuickMatch: false,
        customOvers: oversPerMatch,
      },
    });

    // Schedule final (1st place vs TBD)
    const finalDate = new Date(endDate.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day before end
    const final = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        homeTeamId: firstPlace.teamId,
        awayTeamId: firstPlace.teamId, // Placeholder - will be updated after semi-final
        venue: 'Final Stadium',
        matchDate: finalDate,
        status: 'SCHEDULED',
        matchType: 'FINAL',
        isTBD: true, // Mark as TBD until semi-final winner is determined
        isQuickMatch: false,
        customOvers: oversPerMatch,
      },
    });

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        semiFinalsScheduled: true,
        finalScheduled: true,
      },
    });

    return {
      success: true,
      message: 'Playoffs scheduled successfully',
      semiFinal: {
        id: semiFinal.id,
        teams: `${secondPlace.team.name} vs ${thirdPlace.team.name}`,
        matchType: 'SEMI_FINAL',
        date: semiFinalDate,
      },
      final: {
        id: final.id,
        teams: `${firstPlace.team.name} vs TBD`,
        matchType: 'FINAL',
        date: finalDate,
      },
    };
  }

  /**
   * Update final match after semi-final completion
   */
  async updateFinalAfterSemiFinal(semiFinalId: string) {
    const semiFinal = await prisma.match.findUnique({
      where: { id: semiFinalId },
      include: {
        tournament: {
          include: {
            matches: {
              where: { matchType: 'FINAL' },
              orderBy: { matchDate: 'desc' },
              take: 1,
            },
          },
        },
        awayTeam: {
          select: { name: true },
        },
      },
    });

    if (!semiFinal || !semiFinal.winnerId) {
      throw new AppError('Semi-final not completed yet', 400);
    }

    // Get final match (filter by matchType = FINAL)
    const finalMatch = semiFinal.tournament?.matches[0];

    if (!finalMatch) {
      throw new AppError('Final match not found', 404);
    }

    // Update final match with semi-final winner and remove TBD flag
    await prisma.match.update({
      where: { id: finalMatch.id },
      data: {
        awayTeamId: semiFinal.winnerId,
        isTBD: false,
      },
    });

    const winnerTeam = await prisma.team.findUnique({
      where: { id: semiFinal.winnerId },
      select: { name: true },
    });

    return {
      success: true,
      message: 'Final match updated with semi-final winner',
      finalMatch: {
        id: finalMatch.id,
        awayTeam: winnerTeam?.name,
      },
    };
  }

  /**
   * Get tournament standings
   */
  async getStandings(tournamentId: string) {
    const standings = await prisma.pointsTable.findMany({
      where: { tournamentId },
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
      orderBy: [
        { points: 'desc' },
        { netRunRate: 'desc' },
      ],
    });

    return standings.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }
}

export const tournamentSchedulingService = new TournamentSchedulingService();
