import { Request, Response, NextFunction } from 'express';
export declare class SocialController {
    generateShareImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsShared(req: Request, res: Response, next: NextFunction): Promise<void>;
    getShareHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchShareStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    createFanClub(req: Request, res: Response, next: NextFunction): Promise<void>;
    joinFanClub(req: Request, res: Response, next: NextFunction): Promise<void>;
    leaveFanClub(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFanClubByPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllFanClubs(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserMemberships(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFanClubLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void>;
    postComment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchComments(req: Request, res: Response, next: NextFunction): Promise<void>;
    addReaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateKarma(req: Request, res: Response, next: NextFunction): Promise<void>;
    togglePin(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteComment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTopComments(req: Request, res: Response, next: NextFunction): Promise<void>;
    createHighlight(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchHighlights(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHighlight(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserHighlights(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTrendingHighlights(req: Request, res: Response, next: NextFunction): Promise<void>;
    searchByTag(req: Request, res: Response, next: NextFunction): Promise<void>;
    shareHighlight(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleVisibility(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteHighlight(req: Request, res: Response, next: NextFunction): Promise<void>;
    getHighlightStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const socialController: SocialController;
//# sourceMappingURL=social.controller.d.ts.map