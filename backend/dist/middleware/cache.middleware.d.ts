import { Request, Response, NextFunction } from 'express';
export declare const cacheMiddleware: (ttl: number, keyGenerator?: (req: Request) => string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const invalidateCacheMiddleware: (invalidator: (req: Request) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cacheKeyGenerators: {
    match: (req: Request) => string;
    liveMatch: (req: Request) => string;
    allLiveMatches: () => string;
    scorecard: (req: Request) => string;
    playerStats: (req: Request) => string;
    teamStats: (req: Request) => string;
    tournamentStandings: (req: Request) => string;
    matchAnalytics: (req: Request) => string;
};
//# sourceMappingURL=cache.middleware.d.ts.map