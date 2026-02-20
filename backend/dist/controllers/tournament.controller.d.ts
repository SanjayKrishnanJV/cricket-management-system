import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class TournamentController {
    createTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllTournaments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTournamentById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTournament(req: Request, res: Response, next: NextFunction): Promise<void>;
    addTeamToTournament(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateFixtures(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPointsTable(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tournament.controller.d.ts.map