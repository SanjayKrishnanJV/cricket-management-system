import { Router } from 'express';
import { administrationController } from '../controllers/administration.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Apply authentication to all administration routes
router.use(authenticate);

// ===== DRS ROUTES =====
router.post(
  '/drs',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.createDRSReview.bind(administrationController)
);

router.get(
  '/drs/match/:matchId',
  administrationController.getDRSReviewsByMatch.bind(administrationController)
);

router.put(
  '/drs/:reviewId',
  authorize('SUPER_ADMIN'),
  administrationController.updateDRSDecision.bind(administrationController)
);

router.get(
  '/drs/match/:matchId/stats',
  administrationController.getDRSStats.bind(administrationController)
);

// ===== INJURY MANAGEMENT ROUTES =====
router.post(
  '/injuries',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.recordInjury.bind(administrationController)
);

router.put(
  '/injuries/:injuryId',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.updateInjury.bind(administrationController)
);

router.get(
  '/injuries/match/:matchId',
  administrationController.getInjuriesByMatch.bind(administrationController)
);

router.get(
  '/injuries/active',
  administrationController.getActiveInjuries.bind(administrationController)
);

// ===== SUBSTITUTION MANAGEMENT ROUTES =====
router.post(
  '/substitutions',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.createSubstitution.bind(administrationController)
);

router.put(
  '/substitutions/:substituteId/end',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.endSubstitution.bind(administrationController)
);

router.get(
  '/substitutions/match/:matchId',
  administrationController.getSubstitutionsByMatch.bind(administrationController)
);

// ===== WEATHER TRACKING ROUTES =====
router.post(
  '/weather',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.recordWeather.bind(administrationController)
);

router.get(
  '/weather/match/:matchId',
  administrationController.getWeatherByMatch.bind(administrationController)
);

router.get(
  '/weather/match/:matchId/current',
  administrationController.getCurrentWeather.bind(administrationController)
);

// ===== PITCH CONDITIONS ROUTES =====
router.post(
  '/pitch',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.recordPitchCondition.bind(administrationController)
);

router.get(
  '/pitch/match/:matchId',
  administrationController.getPitchConditionsByMatch.bind(administrationController)
);

// ===== DLS CALCULATION ROUTES =====
router.post(
  '/dls/calculate',
  authorize('SUPER_ADMIN', 'SCORER'),
  administrationController.calculateDLS.bind(administrationController)
);

router.get(
  '/dls/match/:matchId',
  administrationController.getDLSCalculationsByMatch.bind(administrationController)
);

// ===== REFEREE REPORT ROUTES =====
router.post(
  '/referee-reports',
  authorize('SUPER_ADMIN'),
  administrationController.createRefereeReport.bind(administrationController)
);

router.put(
  '/referee-reports/:reportId',
  authorize('SUPER_ADMIN'),
  administrationController.updateRefereeReport.bind(administrationController)
);

router.get(
  '/referee-reports/match/:matchId',
  administrationController.getRefereeReport.bind(administrationController)
);

router.post(
  '/referee-reports/:reportId/submit',
  authorize('SUPER_ADMIN'),
  administrationController.submitReport.bind(administrationController)
);

// ===== INCIDENT MANAGEMENT ROUTES =====
router.post(
  '/incidents',
  authorize('SUPER_ADMIN'),
  administrationController.recordIncident.bind(administrationController)
);

router.put(
  '/incidents/:incidentId',
  authorize('SUPER_ADMIN'),
  administrationController.updateIncident.bind(administrationController)
);

router.get(
  '/incidents/match/:matchId',
  administrationController.getIncidentsByMatch.bind(administrationController)
);

// ===== CODE VIOLATION ROUTES =====
router.post(
  '/violations',
  authorize('SUPER_ADMIN'),
  administrationController.recordViolation.bind(administrationController)
);

router.put(
  '/violations/:violationId',
  authorize('SUPER_ADMIN'),
  administrationController.updateViolation.bind(administrationController)
);

router.get(
  '/violations/match/:matchId',
  administrationController.getViolationsByMatch.bind(administrationController)
);

router.get(
  '/violations/player/:playerId',
  administrationController.getViolationsByPlayer.bind(administrationController)
);

export default router;
