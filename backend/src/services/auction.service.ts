import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class AuctionService {
  async placeBid(playerId: string, bidderId: string, amount: number) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    const bidder = await prisma.user.findUnique({
      where: { id: bidderId },
      include: {
        ownedTeams: true,
      },
    });

    if (!bidder || bidder.ownedTeams.length === 0) {
      throw new AppError('Bidder must own a team', 400);
    }

    const team = bidder.ownedTeams[0];

    if (amount < player.basePrice) {
      throw new AppError('Bid amount must be at least base price', 400);
    }

    if (team.budget < amount) {
      throw new AppError('Insufficient team budget', 400);
    }

    const existingContract = await prisma.contract.findFirst({
      where: {
        playerId,
        isActive: true,
      },
    });

    if (existingContract) {
      throw new AppError('Player already contracted', 400);
    }

    const highestBid = await prisma.auctionBid.findFirst({
      where: { playerId },
      orderBy: { amount: 'desc' },
    });

    if (highestBid && amount <= highestBid.amount) {
      throw new AppError('Bid must be higher than current highest bid', 400);
    }

    if (highestBid) {
      await prisma.auctionBid.update({
        where: { id: highestBid.id },
        data: { isWinning: false },
      });
    }

    const bid = await prisma.auctionBid.create({
      data: {
        playerId,
        bidderId,
        amount,
        isWinning: true,
      },
    });

    return bid;
  }

  async getCurrentBids(playerId: string) {
    const bids = await prisma.auctionBid.findMany({
      where: { playerId },
      include: {
        bidder: {
          select: {
            name: true,
            ownedTeams: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return bids;
  }

  async getHighestBid(playerId: string) {
    const bid = await prisma.auctionBid.findFirst({
      where: { playerId, isWinning: true },
      include: {
        bidder: {
          select: {
            name: true,
            ownedTeams: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
      },
    });

    return bid;
  }

  async sellPlayer(playerId: string) {
    const highestBid = await prisma.auctionBid.findFirst({
      where: { playerId, isWinning: true },
      include: {
        bidder: {
          include: {
            ownedTeams: true,
          },
        },
      },
    });

    if (!highestBid) {
      throw new AppError('No bids found for this player', 404);
    }

    const team = highestBid.bidder.ownedTeams[0];

    if (!team) {
      throw new AppError('Bidder has no team', 400);
    }

    if (team.budget < highestBid.amount) {
      throw new AppError('Team has insufficient budget', 400);
    }

    const contract = await prisma.contract.create({
      data: {
        playerId,
        teamId: team.id,
        amount: highestBid.amount,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.team.update({
      where: { id: team.id },
      data: {
        budget: team.budget - highestBid.amount,
      },
    });

    await prisma.auctionBid.updateMany({
      where: { playerId },
      data: { isWinning: false },
    });

    return {
      contract,
      soldTo: team.name,
      amount: highestBid.amount,
    };
  }

  async getAvailablePlayers() {
    const contractedPlayerIds = await prisma.contract.findMany({
      where: { isActive: true },
      select: { playerId: true },
    });

    const contractedIds = contractedPlayerIds.map(c => c.playerId);

    const players = await prisma.player.findMany({
      where: {
        id: {
          notIn: contractedIds,
        },
      },
      include: {
        auctionBids: {
          where: { isWinning: true },
          include: {
            bidder: {
              select: {
                name: true,
                ownedTeams: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { basePrice: 'desc' },
    });

    return players;
  }

  async resetAuction(playerId: string) {
    await prisma.auctionBid.deleteMany({
      where: { playerId },
    });

    return { message: 'Auction reset successfully' };
  }
}
