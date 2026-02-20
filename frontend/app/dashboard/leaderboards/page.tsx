'use client';

import { useEffect, useState } from 'react';
import { leaderboardService } from '@/services/gamification';

interface LeaderboardEntry {
  id: string;
  rank: number;
  value: number;
  matchesPlayed: number;
  player?: {
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LeaderboardsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('RUNS_ALL_TIME');

  const leaderboardTypes = [
    { value: 'RUNS_ALL_TIME', label: '🏏 Most Runs', icon: '🏏' },
    { value: 'WICKETS_ALL_TIME', label: '⚾ Most Wickets', icon: '⚾' },
    { value: 'STRIKE_RATE', label: '⚡ Best Strike Rate', icon: '⚡' },
    { value: 'ECONOMY_RATE', label: '🎯 Best Economy', icon: '🎯' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await leaderboardService.getLeaderboard(selectedType);
      if (response.success) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatValue = (value: number, type: string) => {
    if (type.includes('RATE')) {
      return value.toFixed(2);
    }
    return Math.floor(value).toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Leaderboards</h1>
        <p className="text-gray-600">Top performers across different categories</p>
      </div>

      {/* Leaderboard Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {leaderboardTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`p-4 rounded-lg font-semibold transition-all ${
              selectedType === type.value
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <div className="text-sm">{type.label.replace(/[🏏⚾⚡🎯]\s/, '')}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
              <div className="flex items-end justify-center gap-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="bg-white rounded-lg p-6 shadow-xl mb-2" style={{ minHeight: '120px' }}>
                    <div className="text-4xl mb-2">🥈</div>
                    <div className="font-bold text-lg">{entries[1].player?.name || entries[1].user?.name}</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatValue(entries[1].value, selectedType)}
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="bg-white rounded-lg p-6 shadow-2xl mb-2" style={{ minHeight: '150px' }}>
                    <div className="text-5xl mb-2">🥇</div>
                    <div className="font-bold text-xl">{entries[0].player?.name || entries[0].user?.name}</div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {formatValue(entries[0].value, selectedType)}
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="bg-white rounded-lg p-6 shadow-xl mb-2" style={{ minHeight: '100px' }}>
                    <div className="text-4xl mb-2">🥉</div>
                    <div className="font-bold text-lg">{entries[2].player?.name || entries[2].user?.name}</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatValue(entries[2].value, selectedType)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Player</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Value</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl font-bold">
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {entry.player?.name || entry.user?.name}
                        </div>
                        {entry.player && (
                          <div className="text-sm text-gray-500">{entry.player.role}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {formatValue(entry.value, selectedType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {entry.matchesPlayed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
