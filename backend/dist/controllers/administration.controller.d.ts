import { Request, Response, NextFunction } from 'express';
export declare class AdministrationController {
    createDRSReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDRSReviewsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateDRSDecision(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDRSStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordInjury(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateInjury(req: Request, res: Response, next: NextFunction): Promise<void>;
    getInjuriesByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveInjuries(req: Request, res: Response, next: NextFunction): Promise<void>;
    createSubstitution(req: Request, res: Response, next: NextFunction): Promise<void>;
    endSubstitution(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSubstitutionsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordWeather(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWeatherByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCurrentWeather(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordPitchCondition(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPitchConditionsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    calculateDLS(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDLSCalculationsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRefereeReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRefereeReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRefereeReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    submitReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordIncident(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateIncident(req: Request, res: Response, next: NextFunction): Promise<void>;
    getIncidentsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    recordViolation(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateViolation(req: Request, res: Response, next: NextFunction): Promise<void>;
    getViolationsByMatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    getViolationsByPlayer(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const administrationController: AdministrationController;
//# sourceMappingURL=administration.controller.d.ts.map