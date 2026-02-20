import { Request, Response, NextFunction } from 'express';
export declare class PlayerController {
    createPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllPlayers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayerById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    deletePlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayerAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=player.controller.d.ts.map