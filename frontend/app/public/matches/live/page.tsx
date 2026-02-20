'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function PublicLiveMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatches();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLiveMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches?status=LIVE');
      const data = await response.json();
      setMatches(data.data || []);
    } catch (error) {
      console.error('Failed to fetch live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">Loading live matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🔴 Live Matches
          </h1>
          <p className="text-gray-600">Real-time cricket action happening now</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/public/matches/upcoming" className="text-blue-600 hover:underline">
              📅 Upcoming Matches
            </Link>
            <Link href="/public/matches/history" className="text-blue-600 hover:underline">
              📜 Match History
            </Link>
          </div>
        </div>

        {/* Live Matches */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">🏏</div>
              <p className="text-xl text-gray-600 mb-2">No Live Matches</p>
              <p className="text-gray-500">Check back soon for live cricket action!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-xl transition-shadow border-2 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-red-600 font-bold text-sm">LIVE</span>
                      </div>
                      <CardTitle className="text-sm text-gray-600">
                        {match.tournament?.name || 'Quick Match'}
                      </CardTitle>
                    </div>
                    <Link
                      href={`/public/matches/${match.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Live
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Teams */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                          🏏
                        </div>
                        <div>
                          <p className="font-bold text-lg">{match.homeTeam?.name}</p>
                          <p className="text-sm text-gray-600">{match.homeTeam?.shortName}</p>
                        </div>
                      </div>
                      {match.innings?.[0] && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {match.innings[0].totalRuns}/{match.innings[0].totalWickets}
                          </p>
                          <p className="text-sm text-gray-600">({match.innings[0].totalOvers} ov)</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                          ⚾
                        </div>
                        <div>
                          <p className="font-bold text-lg">{match.awayTeam?.name}</p>
                          <p className="text-sm text-gray-600">{match.awayTeam?.shortName}</p>
                        </div>
                      </div>
                      {match.innings?.[1] && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {match.innings[1].totalRuns}/{match.innings[1].totalWickets}
                          </p>
                          <p className="text-sm text-gray-600">({match.innings[1].totalOvers} ov)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium">{match.venue}</span>
                    </div>
                    {match.resultText && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                        <p className="text-sm font-medium text-green-800">{match.resultText}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
