#!/bin/bash
cat > src/controllers/ai.controller.ts << 'EOF'
import { Request, Response } from 'express';
import { matchPredictionService } from '../services/ai/matchPrediction.service';
import { teamSelectionService } from '../services/ai/teamSelection.service';
import { performancePredictionService } from '../services/ai/performancePrediction.service';
import { injuryRiskService } from '../services/ai/injuryRisk.service';

/**
 * AI/ML Features Controller
 * Handles all AI-powered prediction endpoints
 */

// ==================== Match Prediction ====================

export const predictMatch = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const result = await matchPredictionService.predictMatch(matchId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchPrediction = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const result = await matchPredictionService.getMatchPrediction(matchId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPredictionTrends = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const result = await matchPredictionService.getAllPredictions(
      limit ? parseInt(limit as string) : 20
    );
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== Team Selection ====================

export const suggestTeam = async (req: Request, res: Response) => {
  try {
    const { matchId, teamId } = req.params;
    const { pitchType, weather, oppositionTeamId } = req.body;
    const result = await teamSelectionService.suggestTeam(matchId, teamId, {
      pitchType,
      weather,
      oppositionId: oppositionTeamId,
    });
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamSuggestion = async (req: Request, res: Response) => {
  try {
    const { matchId, teamId } = req.params;
    const result = await teamSelectionService.getTeamSuggestion(matchId, teamId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== Performance Prediction ====================

export const predictPerformance = async (req: Request, res: Response) => {
  try {
    const { matchId, playerId } = req.params;
    const result = await performancePredictionService.predictPerformance(matchId, playerId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPerformancePrediction = async (req: Request, res: Response) => {
  try {
    const { matchId, playerId } = req.params;
    const result = await performancePredictionService.getPerformancePrediction(matchId, playerId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMatchPredictions = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const result = await performancePredictionService.getMatchPredictions(matchId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== Injury Risk ====================

export const assessInjuryRisk = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const result = await injuryRiskService.assessInjuryRisk(playerId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInjuryRisk = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const result = await injuryRiskService.getInjuryRisk(playerId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHighRiskPlayers = async (req: Request, res: Response) => {
  try {
    const result = await injuryRiskService.getHighRiskPlayers();
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInjuryRiskTrends = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const { limit } = req.query;
    const result = await injuryRiskService.getInjuryRiskTrends(
      playerId,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
EOF
