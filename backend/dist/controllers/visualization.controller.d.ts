import { Request, Response, NextFunction } from 'express';
export declare class VisualizationController {
    getWagonWheel(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPitchMap(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFieldPlacements(req: Request, res: Response, next: NextFunction): Promise<void>;
    saveFieldPlacement(req: Request, res: Response, next: NextFunction): Promise<void>;
    get3DReplayData(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: VisualizationController;
export default _default;
//# sourceMappingURL=visualization.controller.d.ts.map