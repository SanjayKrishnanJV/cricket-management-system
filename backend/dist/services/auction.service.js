"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class AuctionService {
    async placeBid(playerId, bidderId, amount) {
        const player = await database_1.default.player.findUnique({
            where: { id: playerId },
        });
        if (!player) {
            throw new errorHandler_1.AppError('Player not found', 404);
        }
        const bidder = await database_1.default.user.findUnique({
            where: { id: bidderId },
            include: {
                ownedTeams: true,
            },
        });
        if (!bidder || bidder.ownedTeams.length === 0) {
            throw new errorHandler_1.AppError('Bidder must own a team', 400);
        }
        const team = bidder.ownedTeams[0];
        if (amount < player.basePrice) {
            throw new errorHandler_1.AppError('Bid amount must be at least base price', 400);
        }
        if (team.budget < amount) {
            throw new errorHandler_1.AppError('Insufficient team budget', 400);
        }
        const existingContract = await database_1.default.contract.findFirst({
            where: {
                playerId,
                isActive: true,
            },
        });
        if (existingContract) {
            throw new errorHandler_1.AppError('Player already contracted', 400);
        }
        const highestBid = await database_1.default.auctionBid.findFirst({
            where: { playerId },
            orderBy: { amount: 'desc' },
        });
        if (highestBid && amount <= highestBid.amount) {
            throw new errorHandler_1.AppError('Bid must be higher than current highest bid', 400);
        }
        if (highestBid) {
            await database_1.default.auctionBid.update({
                where: { id: highestBid.id },
                data: { isWinning: false },
            });
        }
        const bid = await database_1.default.auctionBid.create({
            data: {
                playerId,
                bidderId,
                amount,
                isWinning: true,
            },
        });
        return bid;
    }
    async getCurrentBids(playerId) {
        const bids = await database_1.default.auctionBid.findMany({
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
    async getHighestBid(playerId) {
        const bid = await database_1.default.auctionBid.findFirst({
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
    async sellPlayer(playerId) {
        const highestBid = await database_1.default.auctionBid.findFirst({
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
            throw new errorHandler_1.AppError('No bids found for this player', 404);
        }
        const team = highestBid.bidder.ownedTeams[0];
        if (!team) {
            throw new errorHandler_1.AppError('Bidder has no team', 400);
        }
        if (team.budget < highestBid.amount) {
            throw new errorHandler_1.AppError('Team has insufficient budget', 400);
        }
        const contract = await database_1.default.contract.create({
            data: {
                playerId,
                teamId: team.id,
                amount: highestBid.amount,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });
        await database_1.default.team.update({
            where: { id: team.id },
            data: {
                budget: team.budget - highestBid.amount,
            },
        });
        await database_1.default.auctionBid.updateMany({
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
        const contractedPlayerIds = await database_1.default.contract.findMany({
            where: { isActive: true },
            select: { playerId: true },
        });
        const contractedIds = contractedPlayerIds.map(c => c.playerId);
        const players = await database_1.default.player.findMany({
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
    async resetAuction(playerId) {
        await database_1.default.auctionBid.deleteMany({
            where: { playerId },
        });
        return { message: 'Auction reset successfully' };
    }
}
exports.AuctionService = AuctionService;
//# sourceMappingURL=auction.service.js.map