'use client';

import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';

interface TeamSuggestionCardProps {
  matchId: string;
  teamId: string;
  teamName: string;
}

interface TeamSuggestion {
  id: string;
  suggestedXI: string;
  substitutes: string;
  pitchType: string;
  weather: string;
  balanceScore: number;
  strengthScore: number;
  reasoning: string;
  createdAt: string;
}

export function TeamSuggestionCard({
  matchId,
  teamId,
  teamName,
}: TeamSuggestionCardProps) {
  const [suggestion, setSuggestion] = useState<TeamSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pitchType, setPitchType] = useState<string>('batting');
  const [weather, setWeather] = useState<string>('clear');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSuggestion();
  }, [matchId, teamId]);

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getTeamSuggestion(matchId, teamId);
      if (response.data.success) {
        setSuggestion(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestion = async () => {
    setGenerating(true);
    try {
      const response = await aiAPI.suggestTeam(matchId, teamId, {
        pitchType,
        weather,
      });
      if (response.data.success) {
        setSuggestion(response.data.data);
        setShowForm(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate suggestion');
    } finally {
      setGenerating(false);
    }
  };

  const parsePlayers = (playerIds: string) => {
    try {
      return JSON.parse(playerIds);
    } catch {
      return [];
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
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

  if (!suggestion || showForm) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Team Selection
          </h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered playing XI suggestions for {teamName}
          </p>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch Type
            </label>
            <select
              value={pitchType}
              onChange={(e) => setPitchType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="batting">Batting Pitch</option>
              <option value="bowling">Bowling Pitch</option>
              <option value="balanced">Balanced Pitch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather Conditions
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="clear">Clear</option>
              <option value="cloudy">Cloudy</option>
              <option value="overcast">Overcast</option>
              <option value="humid">Humid</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            {suggestion && (
              <button
                onClick={() => setShowForm(false)}
                disabled={generating}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleGenerateSuggestion}
              disabled={generating}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
            >
              {generating ? 'Generating...' : 'Generate Suggestion'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const suggestedPlayers = parsePlayers(suggestion.suggestedXI);
  const substitutePlayers = suggestion.substitutes ? parsePlayers(suggestion.substitutes) : [];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-lg font-bold">{teamName}</h3>
              <p className="text-sm opacity-90">AI Team Selection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Conditions */}
      <div className="bg-orange-50 border-b border-orange-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-600">Pitch Type</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {suggestion.pitchType}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Weather</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {suggestion.weather}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Team Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Balance Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(suggestion.balanceScore || 0)}`}>
              {suggestion.balanceScore?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Team Composition</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Strength Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(suggestion.strengthScore || 0)}`}>
              {suggestion.strengthScore?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">Overall Strength</p>
          </div>
        </div>

        {/* Suggested Playing XI */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>👥</span>
            <span>Suggested Playing XI</span>
          </h4>
          {suggestedPlayers.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-2">
                {suggestedPlayers.slice(0, 11).map((playerId: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. Player {playerId.substring(0, 8)}...
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {index === 0 ? 'Captain' : index === 1 ? 'Vice-Captain' : 'Player'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No player data available</p>
          )}
        </div>

        {/* Substitutes */}
        {substitutePlayers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔄</span>
              <span>Substitutes</span>
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {substitutePlayers.slice(0, 4).map((playerId: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white px-3 py-1 rounded border border-gray-200 text-sm"
                  >
                    Player {playerId.substring(0, 8)}...
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        {suggestion.reasoning && typeof suggestion.reasoning === 'object' && Object.keys(suggestion.reasoning).length > 0 && (
          <div className="mb-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Reasoning</h4>
            <div className="space-y-2">
              {Object.values(suggestion.reasoning).slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.role} - {item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowForm(true)}
            disabled={generating}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 text-sm font-medium"
          >
            Generate New Suggestion
          </button>
          {suggestion.createdAt && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Last updated: {new Date(suggestion.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
