'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches');
      const data = await response.json();
      // Sort by date (newest first)
      const sorted = (data.data || []).sort((a: any, b: any) =>
        new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
      );
      setMatches(sorted);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading matches...</div>;
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      LIVE: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-green-100 text-green-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ABANDONED: 'bg-gray-100 text-gray-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  // Filter matches by status
  const filteredMatches = statusFilter === 'ALL'
    ? matches
    : matches.filter(match => match.status === statusFilter);

  // Separate live matches
  const liveMatches = filteredMatches.filter(match => match.status === 'LIVE');
  const otherMatches = filteredMatches.filter(match => match.status !== 'LIVE');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-gray-600">View all cricket matches ({filteredMatches.length})</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/matches/quick"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ⚡ Quick Match
          </Link>
          <Link
            href="/dashboard/matches/new"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            ➕ Schedule Match
          </Link>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Matches</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-red-600">Live Matches ({liveMatches.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
              <Link key={match.id} href={`/dashboard/matches/${match.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-red-400 bg-red-50 animate-pulse">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {match.homeTeam?.name} vs {match.awayTeam?.name}
                      </CardTitle>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white animate-pulse">
                        🔴 LIVE
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {match.isQuickMatch ? (
                        <>
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium mr-2">
                            Quick Match
                          </span>
                          {match.customOvers && <span>{match.customOvers} overs • </span>}
                          {match.venue}
                        </>
                      ) : (
                        <>
                          {match.tournament?.name} • {match.venue}
                        </>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(match.matchDate).toLocaleString()}
                        </span>
                      </div>
                      {match.tossWinnerId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Toss:</span>
                          <span className="font-medium">
                            {match.tossWinnerId === match.homeTeamId
                              ? match.homeTeam?.name
                              : match.awayTeam?.name}{' '}
                            won and chose to {match.tossDecision}
                          </span>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <span className="text-sm text-red-600 font-semibold">
                          → Watch Live Match
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Matches Section */}
      {otherMatches.length > 0 && (
        <div className="space-y-4">
          {liveMatches.length > 0 && (
            <h2 className="text-2xl font-bold">Other Matches</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherMatches.map((match) => (
          <Link key={match.id} href={`/dashboard/matches/${match.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {match.homeTeam?.name} vs {match.awayTeam?.name}
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      match.status
                    )}`}
                  >
                    {match.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {match.isQuickMatch ? (
                    <>
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium mr-2">
                        Quick Match
                      </span>
                      {match.customOvers && <span>{match.customOvers} overs • </span>}
                      {match.venue}
                    </>
                  ) : (
                    <>
                      {match.tournament?.name} • {match.venue}
                    </>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(match.matchDate).toLocaleString()}
                    </span>
                  </div>

                  {match.tossWinnerId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Toss:</span>
                      <span className="font-medium">
                        {match.tossWinnerId === match.homeTeamId
                          ? match.homeTeam?.name
                          : match.awayTeam?.name}{' '}
                        won and chose to {match.tossDecision}
                      </span>
                    </div>
                  )}

                  {match.status === 'COMPLETED' && match.resultText && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-semibold text-green-700">{match.resultText}</p>
                      {match.manOfMatch && (
                        <p className="text-sm text-gray-600 mt-1">
                          Man of the Match: {match.manOfMatch}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
          </div>
        </div>
      )}

      {filteredMatches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {statusFilter === 'ALL' ? 'No matches found' : `No ${statusFilter.toLowerCase()} matches found`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
