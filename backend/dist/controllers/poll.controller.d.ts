import { Request, Response, NextFunction } from 'express';
export declare const createPoll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPollsByMatch: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPollById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const votePoll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const closePoll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resolvePoll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserVotes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPollLeaderboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createSuggestedPolls: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=poll.controller.d.ts.map