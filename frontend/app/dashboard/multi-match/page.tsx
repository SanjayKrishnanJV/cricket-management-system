'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { multiMatchAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

export default function MultiMatchDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchMatches();

    // Auto-refresh every 10 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMatches, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    socketService.connect();

    const handleBallRecorded = () => {
      console.log('Ball recorded - refreshing multi-match dashboard');
      fetchMatches();
      setLastUpdate(new Date().toLocaleTimeString());
    };

    socketService.getSocket().on('ballRecorded', handleBallRecorded);

    return () => {
      socketService.getSocket().off('ballRecorded', handleBallRecorded);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await multiMatchAPI.getAllLive();
      if (response.data.status === 'success') {
        setMatches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live matches...</p>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Multi-Match Dashboard</h1>
        </div>
        <div className="text-center py-20">
          <div className="text-8xl mb-4">🏏</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Live Matches
          </h2>
          <p className="text-gray-500">
            There are currently no live matches in progress
          </p>
          <Link
            href="/dashboard/matches"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Multi-Match Dashboard</h1>
          <p className="text-gray-600 mt-1">{matches.length} live {matches.length === 1 ? 'match' : 'matches'} in progress</p>
        </div>

        {/* Auto-refresh Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 shadow-sm">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                autoRefresh ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-1">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {autoRefresh ? 'Live Updates' : 'Manual'}
              </span>
            </div>
          </div>

          {lastUpdate && autoRefresh && (
            <div className="text-xs text-gray-500">
              Last update: {lastUpdate}
            </div>
          )}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/dashboard/matches/${match.id}`}
            className="block hover:shadow-xl transition-shadow"
          >
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-colors">
              {/* Match Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                      🔴 LIVE
                    </span>
                  </div>
                  <span className="text-xs opacity-90">{match.venue}</span>
                </div>
              </div>

              {/* Match Details */}
              <div className="p-6">
                {/* Teams */}
                <div className="space-y-4">
                  {/* Home Team */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold">
                        {match.homeTeam.shortName?.charAt(0) || match.homeTeam.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{match.homeTeam.name}</p>
                      </div>
                    </div>
                    {match.currentInnings?.battingTeam.id === match.homeTeam.id && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{match.currentInnings.score}</p>
                        <p className="text-sm text-gray-600">({match.currentInnings.overs} ov)</p>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold">
                        {match.awayTeam.shortName?.charAt(0) || match.awayTeam.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{match.awayTeam.name}</p>
                      </div>
                    </div>
                    {match.currentInnings?.battingTeam.id === match.awayTeam.id && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{match.currentInnings.score}</p>
                        <p className="text-sm text-gray-600">({match.currentInnings.overs} ov)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Status */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {match.currentInnings?.inningsNumber === 1 ? '1st Innings' : '2nd Innings'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">CRR: {match.currentInnings?.runRate}</span>
                    </div>
                    {match.target && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Need {match.target - parseInt(match.currentInnings.score.split('/')[0])}</p>
                        <p className="text-xs font-semibold text-blue-600">RRR: {match.requiredRunRate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <span className="text-xs text-gray-600">
                  {new Date(match.matchDate).toLocaleDateString()}
                </span>
                <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
