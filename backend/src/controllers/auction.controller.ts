import { Request, Response, NextFunction } from 'express';
import { AuctionService } from '../services/auction.service';
import { AuthRequest } from '../types';

const auctionService = new AuctionService();

export class AuctionController {
  async placeBid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { playerId, amount } = req.body;
      const bid = await auctionService.placeBid(
        playerId,
        req.user!.id,
        amount
      );
      res.status(201).json({
        status: 'success',
        data: bid,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentBids(req: Request, res: Response, next: NextFunction) {
    try {
      const bids = await auctionService.getCurrentBids(req.params.playerId);
      res.status(200).json({
        status: 'success',
        data: bids,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHighestBid(req: Request, res: Response, next: NextFunction) {
    try {
      const bid = await auctionService.getHighestBid(req.params.playerId);
      res.status(200).json({
        status: 'success',
        data: bid,
      });
    } catch (error) {
      next(error);
    }
  }

  async sellPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await auctionService.sellPlayer(req.params.playerId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailablePlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const players = await auctionService.getAvailablePlayers();
      res.status(200).json({
        status: 'success',
        data: players,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetAuction(req: Request, res: Response, next: NextFunction) {
    try {
      await auctionService.resetAuction(req.params.playerId);
      res.status(200).json({
        status: 'success',
        message: 'Auction reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
