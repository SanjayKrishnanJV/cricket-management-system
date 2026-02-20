import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class TeamController {
    createTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllTeams(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTeamById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTeam(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTeamSquad(req: Request, res: Response, next: NextFunction): Promise<void>;
    addPlayerToTeam(req: Request, res: Response, next: NextFunction): Promise<void>;
    removePlayerFromTeam(req: Request, res: Response, next: NextFunction): Promise<void>;
    setCaptain(req: Request, res: Response, next: NextFunction): Promise<void>;
    setViceCaptain(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=team.controller.d.ts.map