import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class AuctionController {
    placeBid(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getCurrentBids(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHighestBid(req: Request, res: Response, next: NextFunction): Promise<void>;
    sellPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAvailablePlayers(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetAuction(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auction.controller.d.ts.map