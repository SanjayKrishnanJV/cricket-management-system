import { Request, Response, NextFunction } from 'express';
export declare class BroadcastController {
    createVideoHighlight(req: Request, res: Response, next: NextFunction): Promise<void>;
    getVideoHighlights(req: Request, res: Response, next: NextFunction): Promise<void>;
    linkBallToVideo(req: Request, res: Response, next: NextFunction): Promise<void>;
    autoGenerateHighlights(req: Request, res: Response, next: NextFunction): Promise<void>;
    setupLiveStream(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStreamStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStreamInfo(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    updateStreamAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    generatePodcast(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPodcastStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    publishPodcast(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMatchPodcasts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBroadcasterSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateBroadcasterSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTalkingPoints(req: Request, res: Response, next: NextFunction): Promise<void>;
    generateTalkingPoints(req: Request, res: Response, next: NextFunction): Promise<void>;
    markTalkingPointUsed(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const broadcastController: BroadcastController;
//# sourceMappingURL=broadcast.controller.d.ts.map