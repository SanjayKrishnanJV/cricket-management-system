'use client';

import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';

interface InjuryRiskCardProps {
  playerId: string;
  playerName: string;
}

interface InjuryRisk {
  id: string;
  riskLevel: string;
  riskScore: number;
  ballsBowled: number;
  oversPerMatch: number;
  matchesPlayed: number;
  restDays: number;
  age: number;
  workloadTrend: string;
  recommendation: string;
  daysToRest: number;
  assessedAt: string;
}

export function InjuryRiskCard({ playerId, playerName }: InjuryRiskCardProps) {
  const [assessment, setAssessment] = useState<InjuryRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [playerId]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getInjuryRisk(playerId);
      if (response.data.success) {
        setAssessment(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssess = async () => {
    setAssessing(true);
    try {
      const response = await aiAPI.assessInjuryRisk(playerId);
      if (response.data.success) {
        setAssessment(response.data.data);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assess injury risk');
    } finally {
      setAssessing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          gradient: 'from-red-600 to-orange-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          gradient: 'from-orange-600 to-yellow-600',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          gradient: 'from-yellow-600 to-green-600',
        };
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          gradient: 'from-green-600 to-blue-600',
        };
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '⚡';
      default:
        return '✅';
    }
  };

  const getWorkloadTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return '📈';
      case 'DECREASING':
        return '📉';
      default:
        return '➡️';
    }
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

  if (!assessment) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Injury Risk Assessment
          </h3>
          <p className="text-gray-600 mb-4">
            Get AI-powered injury risk analysis for {playerName}
          </p>
          <button
            onClick={handleAssess}
            disabled={assessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {assessing ? 'Assessing...' : 'Assess Injury Risk'}
          </button>
        </div>
      </div>
    );
  }

  const colors = getRiskLevelColor(assessment.riskLevel);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h3 className="text-lg font-bold">{playerName}</h3>
              <p className="text-sm opacity-90">Injury Risk Assessment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`${colors.bg} border-b ${colors.border} p-4`}>
        <div className="text-center">
          <div className="text-4xl mb-2">{getRiskEmoji(assessment.riskLevel)}</div>
          <p className="text-sm text-gray-600 mb-1">Risk Level</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{assessment.riskLevel}</p>
          <p className="text-lg text-gray-700 mt-1">
            Risk Score: {assessment.riskScore.toFixed(0)}/100
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Workload Metrics */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>Workload Metrics</span>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Balls Bowled</p>
              <p className="text-2xl font-bold text-blue-900">{assessment.ballsBowled}</p>
              <p className="text-xs text-gray-600 mt-1">Recent matches</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Overs/Match</p>
              <p className="text-2xl font-bold text-blue-900">
                {assessment.oversPerMatch.toFixed(1)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Average</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Matches Played</p>
              <p className="text-2xl font-bold text-green-900">{assessment.matchesPlayed}</p>
              <p className="text-xs text-gray-600 mt-1">Total</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Rest Days</p>
              <p className="text-2xl font-bold text-green-900">{assessment.restDays}</p>
              <p className="text-xs text-gray-600 mt-1">Since last match</p>
            </div>
          </div>
        </div>

        {/* Workload Trend */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getWorkloadTrendIcon(assessment.workloadTrend)}</span>
              <div>
                <p className="text-xs text-gray-600">Workload Trend</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {assessment.workloadTrend.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
            {assessment.age !== undefined && assessment.age !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-600">Player Age</p>
                <p className="text-lg font-semibold text-gray-900">{assessment.age} years</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Recommendation</span>
          </h4>
          <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
            <p className={`text-sm ${colors.text} leading-relaxed font-medium`}>
              {assessment.recommendation}
            </p>
          </div>
        </div>

        {/* Rest Recommendation */}
        {assessment.daysToRest > 0 && (
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛌</span>
                <div>
                  <p className="text-sm text-gray-600">Recommended Rest</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {assessment.daysToRest} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Risk Score</span>
            <span className="text-sm font-bold text-gray-900">
              {assessment.riskScore.toFixed(0)}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                assessment.riskLevel === 'CRITICAL'
                  ? 'bg-red-600'
                  : assessment.riskLevel === 'HIGH'
                  ? 'bg-orange-600'
                  : assessment.riskLevel === 'MEDIUM'
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${assessment.riskScore}%` }}
            ></div>
          </div>
        </div>

        {/* Reassess Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleAssess}
            disabled={assessing}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 text-sm font-medium"
          >
            {assessing ? 'Reassessing...' : 'Reassess Injury Risk'}
          </button>
          {assessment.assessedAt && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Last assessed: {new Date(assessment.assessedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
