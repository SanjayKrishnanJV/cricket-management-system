'use client';

import { useState, useEffect } from 'react';
import { pollAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PollLeaderboardProps {
  matchId?: string;
}

export default function PollLeaderboard({ matchId }: PollLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [matchId]);

  const loadLeaderboard = async () => {
    try {
      const response = await pollAPI.getLeaderboard(matchId);
      setLeaderboard(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-gray-500">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏆 Top Predictors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No predictions yet</p>
        </CardContent>
      </Card>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Top Predictors {matchId ? '(This Match)' : '(Overall)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between rounded-lg p-3 ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 font-medium'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMedalEmoji(index + 1)}</span>
                <div>
                  <p className="font-medium text-gray-900">{entry.userName}</p>
                  <p className="text-xs text-gray-500">{entry.totalVotes} predictions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{entry.totalPoints}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>

        {/* Points explanation */}
        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-gray-600">
            💡 Earn <span className="font-bold">10 points</span> for each correct prediction!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
