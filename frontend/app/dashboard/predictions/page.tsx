'use client';

import { useEffect, useState } from 'react';
import { pollAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PollLeaderboard from '@/components/polls/PollLeaderboard';
import UserVoteHistory from '@/components/polls/UserVoteHistory';

export default function PredictionsPage() {
  const [allPolls, setAllPolls] = useState<any[]>([]);
  const [activePolls, setActivePolls] = useState<any[]>([]);
  const [resolvedPolls, setResolvedPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'resolved' | 'all'>('active');

  useEffect(() => {
    loadAllPolls();
  }, []);

  const loadAllPolls = async () => {
    try {
      // We'll need to fetch polls from all matches
      // For now, we'll fetch active and closed polls separately
      const [activeRes, closedRes] = await Promise.all([
        pollAPI.getByMatch('', 'ACTIVE').catch(() => ({ data: { data: [] } })),
        pollAPI.getByMatch('', 'RESOLVED').catch(() => ({ data: { data: [] } })),
      ]);

      const active = activeRes.data.data || [];
      const resolved = closedRes.data.data || [];
      const all = [...active, ...resolved];

      setActivePolls(active);
      setResolvedPolls(resolved);
      setAllPolls(all);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load polls:', error);
      setLoading(false);
    }
  };

  const currentPolls = selectedTab === 'active' ? activePolls : selectedTab === 'resolved' ? resolvedPolls : allPolls;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🗳️ Predictions & Polls</h1>
        <p className="text-gray-600">View all polls and top predictors across all matches</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPolls.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{activePolls.length}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Resolved Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{resolvedPolls.length}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {allPolls.reduce((sum, poll) => sum + (poll.voteCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Polls List */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedTab('active')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                selectedTab === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({activePolls.length})
            </button>
            <button
              onClick={() => setSelectedTab('resolved')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                selectedTab === 'resolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved ({resolvedPolls.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({allPolls.length})
            </button>
          </div>

          {/* Polls List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Loading polls...</p>
                </CardContent>
              </Card>
            ) : currentPolls.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No polls found</p>
                </CardContent>
              </Card>
            ) : (
              currentPolls.map((poll) => (
                <Card
                  key={poll.id}
                  className={`${
                    poll.status === 'ACTIVE'
                      ? 'border-2 border-green-200 bg-green-50'
                      : poll.status === 'RESOLVED'
                      ? 'border-2 border-blue-200 bg-blue-50'
                      : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{poll.question}</CardTitle>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            {poll.type.replace(/_/g, ' ')}
                          </span>
                          <span>·</span>
                          <span>{poll.voteCount || 0} votes</span>
                          {poll.match && (
                            <>
                              <span>·</span>
                              <span className="font-medium">
                                {poll.match.homeTeam?.name} vs {poll.match.awayTeam?.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          poll.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : poll.status === 'RESOLVED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {poll.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Vote Summary */}
                    <div className="space-y-2">
                      {poll.options?.map((option: string) => {
                        const summary = poll.voteSummary?.[option] || { count: 0, percentage: 0 };
                        return (
                          <div key={option} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{option}</span>
                              <span className="text-gray-600">
                                {summary.count} votes ({summary.percentage}%)
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="absolute left-0 top-0 h-full bg-blue-600 transition-all"
                                style={{ width: `${summary.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Correct Answer */}
                    {poll.status === 'RESOLVED' && poll.correctAnswer && (
                      <div className="mt-4 rounded-lg bg-green-100 p-3">
                        <p className="text-sm font-medium text-green-800">
                          ✓ Correct Answer: <span className="font-bold">{poll.correctAnswer}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Global Leaderboard */}
          <PollLeaderboard />

          {/* User's Vote History */}
          <UserVoteHistory />
        </div>
      </div>
    </div>
  );
}
