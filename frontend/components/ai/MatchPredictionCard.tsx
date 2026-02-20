'use client';

import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';

interface MatchPredictionCardProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
}

interface MatchPrediction {
  id: string;
  team1WinProb: number;
  team2WinProb: number;
  tieDrawProb: number;
  team1Form: number;
  team2Form: number;
  venueAdvantage: number;
  confidence: number;
  factors: any;
  predictedAt: string;
}

export function MatchPredictionCard({
  matchId,
  team1Name,
  team2Name,
}: MatchPredictionCardProps) {
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [matchId]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMatchPrediction(matchId);
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
      const response = await aiAPI.predictMatch(matchId);
      if (response.data.success) {
        setPrediction(response.data.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate prediction');
    } finally {
      setGenerating(false);
    }
  };

  const getWinnerPrediction = () => {
    if (!prediction) return null;
    if (prediction.team1WinProb > prediction.team2WinProb) {
      return { team: team1Name, prob: prediction.team1WinProb };
    } else if (prediction.team2WinProb > prediction.team1WinProb) {
      return { team: team2Name, prob: prediction.team2WinProb };
    }
    return null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-orange-600';
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
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Match Prediction
          </h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered win probability predictions for this match
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

  const winner = getWinnerPrediction();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold">AI Match Prediction</h3>
          </div>
          {prediction.confidence !== undefined && prediction.confidence !== null && (
            <div className={`text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}>
              {prediction.confidence}% Confidence
            </div>
          )}
        </div>
      </div>

      {/* Winner Prediction */}
      {winner && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Predicted Winner</p>
            <p className="text-2xl font-bold text-blue-900">{winner.team}</p>
            <p className="text-lg text-blue-700">{winner.prob.toFixed(1)}% Win Probability</p>
          </div>
        </div>
      )}

      {/* Win Probabilities */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Win Probabilities</h4>

        {/* Team 1 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">{team1Name}</span>
            <span className="text-sm font-bold text-gray-900">
              {prediction.team1WinProb.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${prediction.team1WinProb}%` }}
            ></div>
          </div>
        </div>

        {/* Team 2 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">{team2Name}</span>
            <span className="text-sm font-bold text-gray-900">
              {prediction.team2WinProb.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${prediction.team2WinProb}%` }}
            ></div>
          </div>
        </div>

        {/* Tie/Draw */}
        {prediction.tieDrawProb > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">Tie/Draw</span>
              <span className="text-sm font-bold text-gray-900">
                {prediction.tieDrawProb.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gray-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${prediction.tieDrawProb}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Form Comparison */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Form</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">{team1Name}</p>
              <p className="text-2xl font-bold text-blue-900">
                {prediction.team1Form?.toFixed(0) || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">Form Score</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">{team2Name}</p>
              <p className="text-2xl font-bold text-purple-900">
                {prediction.team2Form?.toFixed(0) || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">Form Score</p>
            </div>
          </div>
        </div>

        {/* Key Factors */}
        {prediction.factors && typeof prediction.factors === 'object' && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Factors</h4>
            <div className="space-y-2">
              {prediction.factors.venueAdvantage !== undefined && prediction.factors.venueAdvantage !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">🏟️ Venue Advantage</span>
                  <span className="font-medium text-gray-900">
                    {prediction.factors.venueAdvantage > 0 ? team1Name : team2Name}
                  </span>
                </div>
              )}
              {prediction.factors.headToHead && typeof prediction.factors.headToHead === 'object' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">📊 Head-to-Head</span>
                  <span className="font-medium text-gray-900">
                    {prediction.factors.headToHead.team1Wins || 0}-{prediction.factors.headToHead.team2Wins || 0}
                  </span>
                </div>
              )}
              {prediction.factors.weatherImpact !== undefined && prediction.factors.weatherImpact !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">🌤️ Weather Impact</span>
                  <span className="font-medium text-gray-900">
                    {prediction.factors.weatherImpact > 0 ? 'Favorable' : 'Neutral'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regenerate Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
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
