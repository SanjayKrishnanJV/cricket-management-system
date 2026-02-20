import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

/**
 * AI/ML Features Routes
 * All AI-powered prediction endpoints
 */

// ==================== Match Prediction Routes ====================

// Predict match outcome
router.post('/predictions/matches/:matchId/predict', aiController.predictMatch);

// Get latest prediction for a match
router.get('/predictions/matches/:matchId', aiController.getMatchPrediction);

// Get prediction trends over time
router.get('/predictions/matches/:matchId/trends', aiController.getPredictionTrends);

// ==================== Team Selection Routes ====================

// Suggest optimal team
router.post('/team-selection/matches/:matchId/teams/:teamId/suggest', aiController.suggestTeam);

// Get team suggestion
router.get('/team-selection/matches/:matchId/teams/:teamId', aiController.getTeamSuggestion);

// ==================== Performance Prediction Routes ====================

// Predict player performance
router.post('/performance/matches/:matchId/players/:playerId/predict', aiController.predictPerformance);

// Get performance prediction
router.get('/performance/matches/:matchId/players/:playerId', aiController.getPerformancePrediction);

// Get all predictions for a match
router.get('/performance/matches/:matchId', aiController.getMatchPredictions);

// ==================== Injury Risk Routes ====================

// Assess injury risk
router.post('/injury-risk/players/:playerId/assess', aiController.assessInjuryRisk);

// Get latest injury risk assessment
router.get('/injury-risk/players/:playerId', aiController.getInjuryRisk);

// Get all high-risk players
router.get('/injury-risk/high-risk', aiController.getHighRiskPlayers);

// Get injury risk trends for a player
router.get('/injury-risk/players/:playerId/trends', aiController.getInjuryRiskTrends);

export default router;
