import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TeamService {
  async createTeam(data: {
    name: string;
    shortName: string;
    logoUrl?: string;
    primaryColor?: string;
    budget?: number;
    ownerId: string;
  }) {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        budget: data.budget || 10000000,
        ownerId: data.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.teamStats.create({
      data: {
        teamId: team.id,
      },
    });

    return team;
  }

  async getAllTeams() {
    const teams = await prisma.team.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        contracts: {
          where: { isActive: true },
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
        teamStats: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return teams;
  }

  async getTeamById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        contracts: {
          where: { isActive: true },
          include: {
            player: true,
          },
        },
        homeMatches: {
          include: {
            awayTeam: { select: { name: true, shortName: true } },
          },
          take: 10,
          orderBy: { matchDate: 'desc' },
        },
        awayMatches: {
          include: {
            homeTeam: { select: { name: true, shortName: true } },
          },
          take: 10,
          orderBy: { matchDate: 'desc' },
        },
        teamStats: true,
      },
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    // Fetch captain and vice-captain details if they exist
    let captain = null;
    let viceCaptain = null;

    if (team.captainId) {
      captain = await prisma.player.findUnique({
        where: { id: team.captainId },
        select: {
          id: true,
          name: true,
          role: true,
          imageUrl: true,
        },
      });
    }

    if (team.viceCaptainId) {
      viceCaptain = await prisma.player.findUnique({
        where: { id: team.viceCaptainId },
        select: {
          id: true,
          name: true,
          role: true,
          imageUrl: true,
        },
      });
    }

    return {
      ...team,
      captain,
      viceCaptain,
    };
  }

  async updateTeam(id: string, data: any) {
    const team = await prisma.team.update({
      where: { id },
      data,
    });

    return team;
  }

  async deleteTeam(id: string) {
    await prisma.team.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }

  async getTeamSquad(teamId: string) {
    const contracts = await prisma.contract.findMany({
      where: {
        teamId,
        isActive: true,
      },
      include: {
        player: true,
      },
      orderBy: {
        player: {
          role: 'asc',
        },
      },
    });

    const squad = {
      batsmen: contracts.filter(c => c.player.role === 'BATSMAN'),
      bowlers: contracts.filter(c => c.player.role === 'BOWLER'),
      allRounders: contracts.filter(c => c.player.role === 'ALL_ROUNDER'),
      wicketkeepers: contracts.filter(c => c.player.role === 'WICKETKEEPER'),
    };

    return squad;
  }

  async addPlayerToTeam(teamId: string, playerId: string, amount: number) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!team || !player) {
      throw new AppError('Team or Player not found', 404);
    }

    if (amount < player.basePrice) {
      throw new AppError(
        `Contract amount (₹${(amount / 100000).toFixed(2)}L) cannot be below player's base price (₹${(player.basePrice / 100000).toFixed(2)}L)`,
        400
      );
    }

    if (team.budget < amount) {
      throw new AppError('Insufficient budget', 400);
    }

    const existingContract = await prisma.contract.findFirst({
      where: {
        playerId,
        isActive: true,
      },
    });

    if (existingContract) {
      throw new AppError('Player already contracted to a team', 400);
    }

    const contract = await prisma.contract.create({
      data: {
        playerId,
        teamId,
        amount,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    await prisma.team.update({
      where: { id: teamId },
      data: {
        budget: team.budget - amount,
      },
    });

    return contract;
  }

  async removePlayerFromTeam(contractId: string) {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        team: true,
      },
    });

    if (!contract) {
      throw new AppError('Contract not found', 404);
    }

    await prisma.contract.update({
      where: { id: contractId },
      data: { isActive: false },
    });

    await prisma.team.update({
      where: { id: contract.teamId },
      data: {
        budget: contract.team.budget + contract.amount,
      },
    });

    return { message: 'Player removed from team' };
  }

  async setCaptain(teamId: string, playerId: string | null) {
    // Verify player is in team's squad if playerId is provided
    if (playerId) {
      const contract = await prisma.contract.findFirst({
        where: {
          teamId,
          playerId,
          isActive: true,
        },
      });

      if (!contract) {
        throw new AppError('Player must be in the team squad to be captain', 400);
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { captainId: playerId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        contracts: {
          where: { isActive: true },
          include: {
            player: true,
          },
        },
      },
    });

    return team;
  }

  async setViceCaptain(teamId: string, playerId: string | null) {
    // Verify player is in team's squad if playerId is provided
    if (playerId) {
      const contract = await prisma.contract.findFirst({
        where: {
          teamId,
          playerId,
          isActive: true,
        },
      });

      if (!contract) {
        throw new AppError('Player must be in the team squad to be vice-captain', 400);
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { viceCaptainId: playerId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        contracts: {
          where: { isActive: true },
          include: {
            player: true,
          },
        },
      },
    });

    return team;
  }
}
