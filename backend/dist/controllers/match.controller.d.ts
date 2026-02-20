import { Request, Response, NextFunction } from 'express';
export declare class MatchController {
    createMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllMatches(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordToss(req: Request, res: Response, next: NextFunction): Promise<void>;
    startInnings(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordBall(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeInnings(req: Request, res: Response, next: NextFunction): Promise<void>;
    completeMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLiveScore(req: Request, res: Response, next: NextFunction): Promise<void>;
    exportScorecardPDF(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    getAllLiveMatches(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=match.controller.d.ts.map