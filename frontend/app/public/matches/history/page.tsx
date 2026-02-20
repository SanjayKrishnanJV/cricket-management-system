'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function PublicMatchHistoryPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedMatches();
  }, []);

  const fetchCompletedMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches?status=COMPLETED');
      const data = await response.json();
      setMatches(data.data || []);
    } catch (error) {
      console.error('Failed to fetch completed matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">Loading match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            📜 Match History
          </h1>
          <p className="text-gray-600">Relive the completed matches</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/public/matches/live" className="text-blue-600 hover:underline">
              🔴 Live Matches
            </Link>
            <Link href="/public/matches/upcoming" className="text-blue-600 hover:underline">
              📅 Upcoming Matches
            </Link>
          </div>
        </div>

        {/* Completed Matches */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-xl text-gray-600 mb-2">No Match History</p>
              <p className="text-gray-500">Completed matches will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-600 mb-1">
                        {match.tournament?.name || 'Quick Match'}
                      </CardTitle>
                      <p className="text-sm font-medium text-gray-500">
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Link
                      href={`/public/matches/${match.id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      View Scorecard
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Result Badge */}
                  {match.resultText && (
                    <div className="mb-4 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-lg p-3 text-center">
                      <p className="font-bold text-amber-900">🏆 {match.resultText}</p>
                    </div>
                  )}

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
                    {match.manOfMatch && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Man of Match:</span>
                        <span className="font-medium">⭐ {match.manOfMatch}</span>
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
