'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { matchAPI, tournamentAPI, playerAPI, teamAPI } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    totalTournaments: 0,
    totalMatches: 0,
    liveMatches: 0,
  });

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

      setStats({
        totalPlayers: playersRes.data.data.length,
        totalTeams: teamsRes.data.data.length,
        totalTournaments: tournamentsRes.data.data.length,
        totalMatches: matches.length,
        liveMatches: liveMatches.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const coreFeatures = [
    { icon: '👥', title: 'Players', description: 'Manage players', path: '/dashboard/players', color: 'blue' },
    { icon: '🏏', title: 'Teams', description: 'Manage teams', path: '/dashboard/teams', color: 'green' },
    { icon: '🏆', title: 'Tournaments', description: 'View tournaments', path: '/dashboard/tournaments', color: 'purple' },
    { icon: '⚾', title: 'Matches', description: 'View all matches', path: '/dashboard/matches', color: 'red' },
    { icon: '🔴', title: 'Live Match', description: 'Live scoring', path: '/dashboard/live', color: 'red' },
    { icon: '💰', title: 'Auction', description: 'Player auction', path: '/dashboard/auction', color: 'yellow' },
  ];

  const liveFeatures = [
    { icon: '⚡', title: 'Live Scoring', description: 'Ball-by-ball updates', path: '/dashboard/live', color: 'red' },
    { icon: '📊', title: 'Multi-Match', description: `${stats.liveMatches} live matches`, path: '/dashboard/multi-match', color: 'blue' },
    { icon: '🗳️', title: 'Live Polls', description: 'Vote & predict', path: '/dashboard/predictions', color: 'yellow' },
  ];

  const gamificationFeatures = [
    { icon: '🏆', title: 'Achievements', description: 'Unlock badges', path: '/dashboard/achievements', color: 'yellow' },
    { icon: '📊', title: 'Leaderboards', description: 'Top performers', path: '/dashboard/leaderboards', color: 'orange' },
    { icon: '🎯', title: 'Challenges', description: 'Daily quests', path: '/dashboard/challenges', color: 'pink' },
    { icon: '🏆', title: 'Fantasy', description: 'Build your team', path: '/dashboard/fantasy', color: 'purple' },
    { icon: '👤', title: 'Profile', description: 'Your progress', path: '/dashboard/profile', color: 'indigo' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-300 hover:border-blue-500 hover:shadow-blue-200',
      green: 'border-green-300 hover:border-green-500 hover:shadow-green-200',
      purple: 'border-purple-300 hover:border-purple-500 hover:shadow-purple-200',
      red: 'border-red-300 hover:border-red-500 hover:shadow-red-200',
      yellow: 'border-yellow-300 hover:border-yellow-500 hover:shadow-yellow-200',
      orange: 'border-orange-300 hover:border-orange-500 hover:shadow-orange-200',
      pink: 'border-pink-300 hover:border-pink-500 hover:shadow-pink-200',
      indigo: 'border-indigo-300 hover:border-indigo-500 hover:shadow-indigo-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🏏</span>
          Cricket Management System
        </h1>
        <p className="text-gray-600 mt-2">Welcome! Quick access to all features</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/players')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalPlayers}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/teams')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalTeams}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/tournaments')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalTournaments}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/matches')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{stats.totalMatches}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/live')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Live Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 flex items-center gap-2">
              <span className="animate-pulse">🔴</span>
              {stats.liveMatches}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Features */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            🎯 Core Features
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage players, teams, tournaments, and matches
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {coreFeatures.map((feature) => (
              <button
                key={feature.path}
                onClick={() => router.push(feature.path)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 bg-white p-4 transition-all hover:shadow-lg ${getColorClasses(feature.color)}`}
              >
                <span className="text-4xl">{feature.icon}</span>
                <span className="font-bold text-center">{feature.title}</span>
                <span className="text-xs text-gray-600 text-center">{feature.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Features */}
      {stats.liveMatches > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span className="animate-pulse">🔴</span> Live Features
            </CardTitle>
            <p className="text-sm text-gray-600">
              Real-time updates and interactive features
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {liveFeatures.map((feature) => (
                <button
                  key={feature.path}
                  onClick={() => router.push(feature.path)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 bg-white p-4 transition-all hover:shadow-lg ${getColorClasses(feature.color)}`}
                >
                  <span className="text-4xl">{feature.icon}</span>
                  <span className="font-bold text-center">{feature.title}</span>
                  <span className="text-xs text-gray-600 text-center">{feature.description}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gamification Hub */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            🎮 Gamification Hub
          </CardTitle>
          <p className="text-sm text-gray-600">
            Track your progress, compete, and earn rewards!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {gamificationFeatures.map((feature) => (
              <button
                key={feature.path}
                onClick={() => router.push(feature.path)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 bg-white p-4 transition-all hover:shadow-lg ${getColorClasses(feature.color)}`}
              >
                <span className="text-4xl">{feature.icon}</span>
                <span className="font-bold text-center">{feature.title}</span>
                <span className="text-xs text-gray-600 text-center">{feature.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
