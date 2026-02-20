import { Request, Response, NextFunction } from 'express';
export declare class FeaturesController {
    getPlayerMilestones(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTournamentAwards(req: Request, res: Response, next: NextFunction): Promise<void>;
    comparePlayers(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHeadToHead(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVenueStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    predictMatchOutcome(req: Request, res: Response, next: NextFunction): Promise<void>;
    calculateFantasyPoints(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=features.controller.d.ts.map