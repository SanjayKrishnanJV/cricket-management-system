"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPredictionAccuracy = exports.getAllPredictions = exports.getPrediction = exports.generatePrediction = void 0;
const matchPrediction_service_1 = __importDefault(require("../services/matchPrediction.service"));
const generatePrediction = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const prediction = await matchPrediction_service_1.default.generatePrediction(matchId);
        res.status(200).json({
            success: true,
            data: prediction,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generatePrediction = generatePrediction;
const getPrediction = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const prediction = await matchPrediction_service_1.default.getPrediction(matchId);
        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'No prediction found for this match',
            });
        }
        res.status(200).json({
            success: true,
            data: prediction,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPrediction = getPrediction;
const getAllPredictions = async (req, res, next) => {
    try {
        const predictions = await matchPrediction_service_1.default.getAllPredictions();
        res.status(200).json({
            success: true,
            data: predictions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPredictions = getAllPredictions;
const getPredictionAccuracy = async (req, res, next) => {
    try {
        const stats = await matchPrediction_service_1.default.getPredictionAccuracy();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPredictionAccuracy = getPredictionAccuracy;
//# sourceMappingURL=matchPrediction.controller.js.map