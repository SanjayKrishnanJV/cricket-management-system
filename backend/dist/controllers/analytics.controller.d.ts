import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    getMatchAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPlayerAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTeamAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTournamentAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getManhattanChart(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWormChart(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPartnershipAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPhaseAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map