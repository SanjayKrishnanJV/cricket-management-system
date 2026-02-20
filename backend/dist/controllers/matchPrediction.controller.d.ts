import { Request, Response, NextFunction } from 'express';
export declare const generatePrediction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPrediction: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const getAllPredictions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPredictionAccuracy: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=matchPrediction.controller.d.ts.map