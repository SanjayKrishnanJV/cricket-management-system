'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { ShareMatch } from '@/components/social/ShareMatch';
import { MatchDiscussion } from '@/components/social/MatchDiscussion';
import { HighlightGallery } from '@/components/social/HighlightGallery';

export default function PublicMatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
      if (match?.status === 'LIVE') {
        const interval = setInterval(fetchMatchData, 10000);
        return () => clearInterval(interval);
      }
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      const [matchRes, liveRes] = await Promise.all([
        fetch(`http://localhost:5000/api/matches/${matchId}`),
        fetch(`http://localhost:5000/api/matches/${matchId}/live`),
      ]);

      const matchData = await matchRes.json();
      const liveDataRes = await liveRes.json();

      setMatch(matchData.data);
      setLiveData(liveDataRes.data);
    } catch (error) {
      console.error('Failed to fetch match data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-xl text-gray-600">Match not found</p>
              <Link href="/public/matches/live" className="text-blue-600 hover:underline mt-4 inline-block">
                ← Back to Matches
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/public/matches/live" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Matches
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {match.homeTeam?.name} vs {match.awayTeam?.name}
              </h1>
              <p className="text-gray-600 mt-2">{match.tournament?.name || 'Quick Match'}</p>
              <p className="text-sm text-gray-500 mt-1">{match.venue}</p>
            </div>
            {match.status === 'LIVE' && (
              <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-700 font-bold">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Result */}
        {match.resultText && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300">
            <CardContent className="py-6 text-center">
              <p className="text-2xl font-bold text-amber-900">🏆 {match.resultText}</p>
            </CardContent>
          </Card>
        )}

        {/* Scorecard */}
        {match.innings && match.innings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {match.innings.map((innings: any) => (
              <Card key={innings.id}>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle>
                    {innings.battingTeam?.name} Innings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold mb-6">
                    {innings.totalRuns}/{innings.totalWickets}
                    <span className="text-xl text-gray-600 ml-2">
                      ({innings.totalOvers} overs)
                    </span>
                  </div>

                  {/* Batting */}
                  {innings.battingPerformances && innings.battingPerformances.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Batting</h3>
                      <div className="space-y-2">
                        {innings.battingPerformances.map((perf: any) => (
                          <div key={perf.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="font-medium">{perf.player?.name}</span>
                            <span className="text-gray-600">
                              {perf.runs} ({perf.ballsFaced}) • SR: {perf.strikeRate?.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bowling */}
                  {innings.bowlingPerformances && innings.bowlingPerformances.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Bowling</h3>
                      <div className="space-y-2">
                        {innings.bowlingPerformances.map((perf: any) => (
                          <div key={perf.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="font-medium">{perf.player?.name}</span>
                            <span className="text-gray-600">
                              {perf.wickets}-{perf.runsConceded} ({perf.oversBowled}) • ER: {perf.economyRate?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Commentary */}
        {match.commentary && match.commentary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📝 Commentary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {match.commentary.map((comment: any, idx: number) => (
                  <div key={comment.id || idx} className="border-b pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">
                          {comment.overNumber}.{comment.ballNumber}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{comment.text}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Info */}
        <Card>
          <CardHeader>
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(match.matchDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-medium">{match.venue}</p>
              </div>
              {match.tossWinnerId && (
                <div>
                  <p className="text-sm text-gray-600">Toss</p>
                  <p className="font-medium">
                    {match.tossWinnerId === match.homeTeamId ? match.homeTeam?.name : match.awayTeam?.name} won and chose to {match.tossDecision}
                  </p>
                </div>
              )}
              {match.manOfMatch && (
                <div>
                  <p className="text-sm text-gray-600">Man of the Match</p>
                  <p className="font-medium">⭐ {match.manOfMatch}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Features for Public Viewers */}
        {(match.status === 'LIVE' || match.status === 'COMPLETED') && (
          <div className="space-y-6">
            {/* Share Match */}
            <ShareMatch
              matchId={matchId}
              matchTitle={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
              userId="guest"
            />

            {/* Highlights Gallery (Read-only for public) */}
            <HighlightGallery
              matchId={matchId}
              userId="guest"
              showCreateButton={false}
            />

            {/* Live Discussion */}
            {match.status === 'LIVE' && (
              <MatchDiscussion matchId={matchId} userId="guest" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
