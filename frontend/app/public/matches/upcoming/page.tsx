'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function PublicUpcomingMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches?status=SCHEDULED');
      const data = await response.json();
      setMatches(data.data || []);
    } catch (error) {
      console.error('Failed to fetch upcoming matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMatchDate = (date: string) => {
    const matchDate = new Date(date);
    const now = new Date();
    const diffTime = matchDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    return matchDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">Loading upcoming matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            📅 Upcoming Matches
          </h1>
          <p className="text-gray-600">Get ready for the action ahead</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/public/matches/live" className="text-blue-600 hover:underline">
              🔴 Live Matches
            </Link>
            <Link href="/public/matches/history" className="text-blue-600 hover:underline">
              📜 Match History
            </Link>
          </div>
        </div>

        {/* Upcoming Matches */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-xl text-gray-600 mb-2">No Upcoming Matches</p>
              <p className="text-gray-500">New matches will appear here when scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-gray-600 mb-1">
                        {match.tournament?.name || 'Quick Match'}
                      </CardTitle>
                      <p className="text-lg font-bold text-purple-600">
                        {formatMatchDate(match.matchDate)}
                      </p>
                    </div>
                    <Link
                      href={`/public/matches/${match.id}`}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Teams */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        🏏
                      </div>
                      <div>
                        <p className="font-bold text-lg">{match.homeTeam?.name}</p>
                        <p className="text-sm text-gray-600">{match.homeTeam?.shortName}</p>
                      </div>
                    </div>

                    <div className="text-center text-gray-500 font-medium">VS</div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                        ⚾
                      </div>
                      <div>
                        <p className="font-bold text-lg">{match.awayTeam?.name}</p>
                        <p className="text-sm text-gray-600">{match.awayTeam?.shortName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium">{match.venue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">
                        {new Date(match.matchDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {match.tournament?.format && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{match.tournament.format}</span>
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
