import { Request, Response } from 'express';
export declare class WinPredictorController {
    calculateProbability(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProbabilityHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getLatestProbability(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const winPredictorController: WinPredictorController;
//# sourceMappingURL=winPredictor.controller.d.ts.map