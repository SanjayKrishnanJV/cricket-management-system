'use client';

import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';

interface PerformancePredictionCardProps {
  matchId: string;
  playerId: string;
  playerName: string;
}

interface PerformancePrediction {
  id: string;
  expectedRuns: number;
  expectedBalls: number;
  expectedSR: number;
  boundaryProb: number;
  expectedWickets: number;
  expectedOvers: number;
  expectedEconomy: number;
  wicketProb: number;
  confidence: number;
  factors: any;
  predictedAt: string;
}

export function PerformancePredictionCard({
  matchId,
  playerId,
  playerName,
}: PerformancePredictionCardProps) {
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [matchId, playerId]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getPerformancePrediction(matchId, playerId);
      if (response.data.success) {
        setPrediction(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrediction = async () => {
    setGenerating(true);
    try {
      const response = await aiAPI.predictPerformance(matchId, playerId);
      if (response.data.success) {
        setPrediction(response.data.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate prediction');
    } finally {
      setGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100 text-green-800';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Performance Prediction
          </h3>
          <p className="text-gray-600 mb-4">
            Get AI predictions for {playerName}'s performance in this match
          </p>
          <button
            onClick={handleGeneratePrediction}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {generating ? 'Generating...' : 'Generate Prediction'}
          </button>
        </div>
      </div>
    );
  }

  const hasBattingPrediction = prediction.expectedRuns !== null && prediction.expectedRuns !== undefined;
  const hasBowlingPrediction = prediction.expectedWickets !== null && prediction.expectedWickets !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg font-bold">{playerName}</h3>
              <p className="text-sm opacity-90">Performance Prediction</p>
            </div>
          </div>
          {prediction.confidence !== undefined && prediction.confidence !== null && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}>
              {prediction.confidence}% Confidence
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Batting Prediction */}
        {hasBattingPrediction && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏏</span>
              <h4 className="text-md font-semibold text-gray-900">Batting Prediction</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Runs</p>
                <p className="text-3xl font-bold text-blue-900">
                  {prediction.expectedRuns?.toFixed(0) || 0}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Strike Rate</p>
                <p className="text-3xl font-bold text-blue-900">
                  {prediction.expectedSR?.toFixed(1) || 0}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Balls</p>
                <p className="text-3xl font-bold text-green-900">
                  {prediction.expectedBalls?.toFixed(0) || 0}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Boundary Probability</p>
                <p className="text-3xl font-bold text-green-900">
                  {prediction.boundaryProb?.toFixed(0) || 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bowling Prediction */}
        {hasBowlingPrediction && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <h4 className="text-md font-semibold text-gray-900">Bowling Prediction</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Wickets</p>
                <p className="text-3xl font-bold text-purple-900">
                  {prediction.expectedWickets?.toFixed(1) || 0}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Economy</p>
                <p className="text-3xl font-bold text-purple-900">
                  {prediction.expectedEconomy?.toFixed(2) || 0}
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Expected Overs</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {prediction.expectedOvers?.toFixed(1) || 0}
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Wicket Probability</p>
                <p className="text-3xl font-bold text-indigo-900">
                  {prediction.wicketProb?.toFixed(0) || 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Factors */}
        {prediction.factors && typeof prediction.factors === 'object' && (
          <div className="mb-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Factors</h4>
            <div className="grid grid-cols-2 gap-3">
              {prediction.factors.recentForm && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Recent Form</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {prediction.factors.recentForm}
                  </p>
                </div>
              )}
              {prediction.factors.careerAverage !== undefined && prediction.factors.careerAverage !== null && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Career Average</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {prediction.factors.careerAverage?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              )}
              {prediction.factors.battingTrend && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Batting Trend</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {prediction.factors.battingTrend}
                  </p>
                </div>
              )}
              {prediction.factors.bowlingTrend && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Bowling Trend</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {prediction.factors.bowlingTrend}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regenerate Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleGeneratePrediction}
            disabled={generating}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 text-sm font-medium"
          >
            {generating ? 'Regenerating...' : 'Regenerate Prediction'}
          </button>
          {prediction.predictedAt && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Last updated: {new Date(prediction.predictedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
