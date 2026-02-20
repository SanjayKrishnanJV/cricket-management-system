'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { matchAPI, tournamentAPI, playerAPI, teamAPI } from '@/lib/api';

export default function DashboardAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    totalTournaments: 0,
    totalMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
    scheduledMatches: 0,
  });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [playersRes, teamsRes, tournamentsRes, matchesRes] = await Promise.all([
        playerAPI.getAll(),
        teamAPI.getAll(),
        tournamentAPI.getAll(),
        matchAPI.getAll(),
      ]);

      const matches = matchesRes.data.data;
      const liveMatches = matches.filter((m: any) => m.status === 'LIVE');
      const completedMatches = matches.filter((m: any) => m.status === 'COMPLETED');
      const scheduledMatches = matches.filter((m: any) => m.status === 'SCHEDULED');

      setStats({
        totalPlayers: playersRes.data.data.length,
        totalTeams: teamsRes.data.data.length,
        totalTournaments: tournamentsRes.data.data.length,
        totalMatches: matches.length,
        liveMatches: liveMatches.length,
        completedMatches: completedMatches.length,
        scheduledMatches: scheduledMatches.length,
      });

      setRecentMatches(matches.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Dashboard Analytics
        </h1>
        <p className="text-gray-600 mt-2">Overview of your cricket management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/players')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalPlayers}</div>
            <p className="text-xs text-gray-500 mt-1">Click to manage players</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/teams')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalTeams}</div>
            <p className="text-xs text-gray-500 mt-1">Click to manage teams</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/tournaments')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tournaments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalTournaments}</div>
            <p className="text-xs text-gray-500 mt-1">Click to view tournaments</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/matches')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{stats.totalMatches}</div>
            <p className="text-xs text-gray-500 mt-1">Click to view all matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Match Status Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/live')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <span className="animate-pulse">🔴</span> Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.liveMatches}</div>
            <p className="text-xs text-red-600 mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.completedMatches}</div>
            <p className="text-xs text-green-600 mt-1">Finished matches</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.scheduledMatches}</div>
            <p className="text-xs text-blue-600 mt-1">Upcoming matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Matches</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/dashboard/matches')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches found</p>
            ) : (
              recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/matches/${match.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {match.homeTeam?.name} vs {match.awayTeam?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.venue} • {new Date(match.matchDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        match.status === 'LIVE'
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : match.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {match.status}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/matches/${match.id}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/players')}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl">👥</span>
              <span>Manage Players</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/teams')}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl">🏏</span>
              <span>Manage Teams</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/tournaments')}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl">🏆</span>
              <span>View Tournaments</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/live')}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-2xl">🔴</span>
              <span>Live Scoring</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
