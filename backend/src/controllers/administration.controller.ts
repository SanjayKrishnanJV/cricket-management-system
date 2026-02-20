import { Request, Response, NextFunction } from 'express';
import { administrationService } from '../services/administration.service';

/**
 * Administration & Management Controller
 * Handles HTTP requests for DRS, Injuries, Weather, and Referee Reports
 */
export class AdministrationController {
  // ===== DRS ENDPOINTS =====

  async createDRSReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const review = await administrationService.createDRSReview({
        matchId,
        ...req.body,
      });
      res.status(201).json({ status: 'success', data: review });
    } catch (error) {
      next(error);
    }
  }

  async getDRSReviewsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const reviews = await administrationService.getDRSReviewsByMatch(matchId);
      res.status(200).json({ status: 'success', data: reviews });
    } catch (error) {
      next(error);
    }
  }

  async updateDRSDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const review = await administrationService.updateDRSDecision(reviewId, req.body);
      res.status(200).json({ status: 'success', data: review });
    } catch (error) {
      next(error);
    }
  }

  async getDRSStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const stats = await administrationService.getDRSStats(matchId);
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  }

  // ===== INJURY MANAGEMENT ENDPOINTS =====

  async recordInjury(req: Request, res: Response, next: NextFunction) {
    try {
      const injury = await administrationService.recordInjury(req.body);
      res.status(201).json({ status: 'success', data: injury });
    } catch (error) {
      next(error);
    }
  }

  async updateInjury(req: Request, res: Response, next: NextFunction) {
    try {
      const { injuryId } = req.params;
      const injury = await administrationService.updateInjury(injuryId, req.body);
      res.status(200).json({ status: 'success', data: injury });
    } catch (error) {
      next(error);
    }
  }

  async getInjuriesByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const injuries = await administrationService.getInjuriesByMatch(matchId);
      res.status(200).json({ status: 'success', data: injuries });
    } catch (error) {
      next(error);
    }
  }

  async getActiveInjuries(req: Request, res: Response, next: NextFunction) {
    try {
      const injuries = await administrationService.getActiveInjuries();
      res.status(200).json({ status: 'success', data: injuries });
    } catch (error) {
      next(error);
    }
  }

  // ===== SUBSTITUTION MANAGEMENT ENDPOINTS =====

  async createSubstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const substitution = await administrationService.createSubstitution(req.body);
      res.status(201).json({ status: 'success', data: substitution });
    } catch (error) {
      next(error);
    }
  }

  async endSubstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const { substituteId } = req.params;
      const substitution = await administrationService.endSubstitution(substituteId);
      res.status(200).json({ status: 'success', data: substitution });
    } catch (error) {
      next(error);
    }
  }

  async getSubstitutionsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const substitutions = await administrationService.getSubstitutionsByMatch(matchId);
      res.status(200).json({ status: 'success', data: substitutions });
    } catch (error) {
      next(error);
    }
  }

  // ===== WEATHER TRACKING ENDPOINTS =====

  async recordWeather(req: Request, res: Response, next: NextFunction) {
    try {
      const weather = await administrationService.recordWeather(req.body);
      res.status(201).json({ status: 'success', data: weather });
    } catch (error) {
      next(error);
    }
  }

  async getWeatherByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const weather = await administrationService.getWeatherByMatch(matchId);
      res.status(200).json({ status: 'success', data: weather });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentWeather(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const weather = await administrationService.getCurrentWeather(matchId);
      res.status(200).json({ status: 'success', data: weather });
    } catch (error) {
      next(error);
    }
  }

  // ===== PITCH CONDITIONS ENDPOINTS =====

  async recordPitchCondition(req: Request, res: Response, next: NextFunction) {
    try {
      const pitch = await administrationService.recordPitchCondition(req.body);
      res.status(201).json({ status: 'success', data: pitch });
    } catch (error) {
      next(error);
    }
  }

  async getPitchConditionsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const pitch = await administrationService.getPitchConditionsByMatch(matchId);
      res.status(200).json({ status: 'success', data: pitch });
    } catch (error) {
      next(error);
    }
  }

  // ===== DLS CALCULATION ENDPOINTS =====

  async calculateDLS(req: Request, res: Response, next: NextFunction) {
    try {
      const dls = await administrationService.calculateDLS(req.body);
      res.status(201).json({ status: 'success', data: dls });
    } catch (error) {
      next(error);
    }
  }

  async getDLSCalculationsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const dls = await administrationService.getDLSCalculationsByMatch(matchId);
      res.status(200).json({ status: 'success', data: dls });
    } catch (error) {
      next(error);
    }
  }

  // ===== REFEREE REPORT ENDPOINTS =====

  async createRefereeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await administrationService.createRefereeReport(req.body);
      res.status(201).json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async updateRefereeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params;
      const report = await administrationService.updateRefereeReport(reportId, req.body);
      res.status(200).json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async getRefereeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const report = await administrationService.getRefereeReport(matchId);
      res.status(200).json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params;
      const report = await administrationService.submitReport(reportId);
      res.status(200).json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  // ===== INCIDENT MANAGEMENT ENDPOINTS =====

  async recordIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = await administrationService.recordIncident(req.body);
      res.status(201).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  async updateIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { incidentId } = req.params;
      const incident = await administrationService.updateIncident(incidentId, req.body);
      res.status(200).json({ status: 'success', data: incident });
    } catch (error) {
      next(error);
    }
  }

  async getIncidentsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const incidents = await administrationService.getIncidentsByMatch(matchId);
      res.status(200).json({ status: 'success', data: incidents });
    } catch (error) {
      next(error);
    }
  }

  // ===== CODE VIOLATION ENDPOINTS =====

  async recordViolation(req: Request, res: Response, next: NextFunction) {
    try {
      const violation = await administrationService.recordViolation(req.body);
      res.status(201).json({ status: 'success', data: violation });
    } catch (error) {
      next(error);
    }
  }

  async updateViolation(req: Request, res: Response, next: NextFunction) {
    try {
      const { violationId } = req.params;
      const violation = await administrationService.updateViolation(violationId, req.body);
      res.status(200).json({ status: 'success', data: violation });
    } catch (error) {
      next(error);
    }
  }

  async getViolationsByMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const violations = await administrationService.getViolationsByMatch(matchId);
      res.status(200).json({ status: 'success', data: violations });
    } catch (error) {
      next(error);
    }
  }

  async getViolationsByPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.params;
      const violations = await administrationService.getViolationsByPlayer(playerId);
      res.status(200).json({ status: 'success', data: violations });
    } catch (error) {
      next(error);
    }
  }
}

export const administrationController = new AdministrationController();
