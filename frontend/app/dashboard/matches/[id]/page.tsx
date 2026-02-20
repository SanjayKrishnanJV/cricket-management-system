'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { matchAPI, broadcastAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WinPredictorChart } from '@/components/winPredictor/WinPredictorChart';
import { ShareMatch } from '@/components/social/ShareMatch';
import { MatchDiscussion } from '@/components/social/MatchDiscussion';
import { HighlightGallery } from '@/components/social/HighlightGallery';
import { MatchPredictionCard } from '@/components/ai/MatchPredictionCard';
import VideoPlayer from '@/components/broadcast/VideoPlayer';
import LiveStreamPlayer from '@/components/broadcast/LiveStreamPlayer';
import PodcastPlayer from '@/components/broadcast/PodcastPlayer';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Broadcasting & Media States
  const [liveStream, setLiveStream] = useState<any>(null);
  const [videoHighlights, setVideoHighlights] = useState<any[]>([]);
  const [matchPodcasts, setMatchPodcasts] = useState<any[]>([]);

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
      const data = await response.json();
      setMatch(data.data);

      // Fetch broadcasting & media data
      fetchBroadcastData();
    } catch (error) {
      console.error('Failed to fetch match:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcastData = async () => {
    try {
      // Fetch live stream (if match is LIVE)
      try {
        const streamRes = await broadcastAPI.getStreamInfo(matchId);
        setLiveStream(streamRes.data.data);
      } catch (err) {
        // Stream might not exist, that's okay
      }

      // Fetch video highlights
      try {
        const highlightsRes = await broadcastAPI.getVideoHighlights(matchId);
        setVideoHighlights(highlightsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch highlights:', err);
      }

      // Fetch podcasts
      try {
        const podcastsRes = await broadcastAPI.getMatchPodcasts(matchId);
        setMatchPodcasts(podcastsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch podcasts:', err);
      }
    } catch (error) {
      console.error('Failed to fetch broadcast data:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading match details...</div>;
  }

  if (!match) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Match not found</p>
            <Link href="/dashboard/matches" className="text-blue-600 hover:underline mt-4 block">
              ← Back to Matches
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      LIVE: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-green-100 text-green-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${matchId}/scorecard/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scorecard-${match.homeTeam?.shortName}-vs-${match.awayTeam?.shortName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF scorecard');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await matchAPI.delete(matchId);
      alert('Match deleted successfully!');
      router.push('/dashboard/matches');
    } catch (error: any) {
      console.error('Failed to delete match:', error);
      alert(error.response?.data?.message || 'Failed to delete match. Please try again.');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Are you sure you want to cancel this match? This will mark it as ABANDONED.`)) {
      return;
    }

    try {
      await matchAPI.cancel(matchId);
      alert('Match cancelled successfully!');
      // Refresh match data instead of reloading the page
      fetchMatch();
    } catch (error: any) {
      console.error('Failed to cancel match:', error);
      alert(error.response?.data?.message || 'Failed to cancel match. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/matches" className="text-sm text-blue-600 hover:underline">
            ← Back to Matches
          </Link>
          <h1 className="text-3xl font-bold mt-2">Match Details</h1>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
            match.status
          )}`}
        >
          {match.status}
        </span>
      </div>

      {/* Match Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{match.tournament?.name}</p>
            <p>{match.venue}</p>
            <p>{new Date(match.matchDate).toLocaleString()}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {match.status === 'SCHEDULED' && (
              <>
                <Link
                  href={`/dashboard/matches/${matchId}/edit`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  ✏️ Edit Match
                </Link>
                <Link
                  href={`/dashboard/matches/${matchId}/score`}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  ▶️ Start & Score Match
                </Link>
                <button
                  onClick={handleCancel}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  ⚠️ Cancel Match
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  🗑️ Delete Match
                </button>
              </>
            )}
            {match.status === 'LIVE' && (
              <>
                <Link
                  href={`/dashboard/matches/${matchId}/score`}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 animate-pulse"
                >
                  🔴 Live Scoring
                </Link>
                <button
                  onClick={handleCancel}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  ⚠️ Cancel Match
                </button>
              </>
            )}
            {match.status === 'COMPLETED' && (
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                📄 Download PDF Scorecard
              </button>
            )}
            <Link
              href={`/dashboard/matches/${matchId}/analytics`}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              📊 Advanced Analytics
            </Link>
            <Link
              href={`/dashboard/matches/${matchId}/visualizations`}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              🎯 Visualizations
            </Link>
            {match.status === 'LIVE' && (
              <Link
                href={`/dashboard/matches/${matchId}/broadcaster`}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2"
              >
                📺 Broadcaster Dashboard
              </Link>
            )}
          </div>

          {/* Administration & Management Features */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Administration & Management</h3>
            <div className="flex gap-4 flex-wrap">
              <Link
                href={`/dashboard/matches/${matchId}/drs`}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                📡 DRS Reviews
              </Link>
              <Link
                href={`/dashboard/matches/${matchId}/injuries`}
                className="bg-rose-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                🏥 Injuries & Substitutes
              </Link>
              <Link
                href={`/dashboard/matches/${matchId}/conditions`}
                className="bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center gap-2"
              >
                🌤️ Weather & Pitch
              </Link>
              <Link
                href={`/dashboard/matches/${matchId}/referee-report`}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                📋 Referee Report
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toss Information */}
      {match.tossWinnerId && (
        <Card>
          <CardHeader>
            <CardTitle>Toss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <span className="font-semibold">
                {match.tossWinnerId === match.homeTeamId
                  ? match.homeTeam?.name
                  : match.awayTeam?.name}
              </span>{' '}
              won the toss and chose to <span className="font-semibold">{match.tossDecision}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Match Result */}
      {match.status === 'COMPLETED' && match.resultText && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-700 mb-2">{match.resultText}</p>
            {match.manOfMatch && (
              <p className="text-gray-600">
                <span className="font-semibold">Man of the Match:</span> {match.manOfMatch}
              </p>
            )}
            {match.winMargin && (
              <p className="text-gray-600">
                <span className="font-semibold">Win Margin:</span> {match.winMargin}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Stream - Only for LIVE matches */}
      {match.status === 'LIVE' && liveStream && liveStream.status === 'LIVE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📺</span>
              <span>Live Stream</span>
              <span className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse">
                LIVE
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveStreamPlayer
              stream={liveStream}
              scoreData={
                match.currentInnings
                  ? {
                      team1: match.homeTeam?.shortName || '',
                      team2: match.awayTeam?.shortName || '',
                      score1:
                        match.currentInnings.battingTeamId === match.homeTeamId
                          ? `${match.currentInnings.totalRuns}/${match.currentInnings.totalWickets}`
                          : '0/0',
                      score2:
                        match.currentInnings.battingTeamId === match.awayTeamId
                          ? `${match.currentInnings.totalRuns}/${match.currentInnings.totalWickets}`
                          : '0/0',
                      currentInnings: match.currentInnings.inningsNumber || 1,
                      battingTeam: match.currentInnings.battingTeam?.name || '',
                      overs: `${match.currentInnings.totalOvers || 0}`,
                    }
                  : undefined
              }
              showScoreOverlay={true}
              showViewerCount={true}
              enablePiP={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Win Predictor - Only for LIVE matches */}
      {match.status === 'LIVE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              <span>Live Win Predictor</span>
              <span className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse">
                LIVE
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WinPredictorChart
              matchId={matchId}
              team1Name={match.homeTeam?.name || 'Team 1'}
              team2Name={match.awayTeam?.name || 'Team 2'}
            />
          </CardContent>
        </Card>
      )}

      {/* Innings Details */}
      {match.innings && match.innings.length > 0 && (
        <div className="space-y-6">
          {match.innings.map((innings: any, index: number) => (
            <Card key={innings.id}>
              <CardHeader>
                <CardTitle>
                  Innings {innings.inningsNumber} - {innings.battingTeamId === match.homeTeamId ? match.homeTeam?.name : match.awayTeam?.name}
                </CardTitle>
                <p className="text-2xl font-bold">
                  {innings.totalRuns}/{innings.totalWickets}{' '}
                  <span className="text-lg text-gray-600">({innings.totalOvers} overs)</span>
                </p>
              </CardHeader>
              <CardContent>
                {/* Batting Scorecard */}
                {innings.battingPerformances && innings.battingPerformances.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Batting</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Batsman
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              R
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              B
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              4s
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              6s
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              SR
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {innings.battingPerformances.map((perf: any) => (
                            <tr key={perf.id}>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <p className="font-medium">{perf.player?.name || 'Unknown'}</p>
                                  {perf.isOut && perf.dismissal && (
                                    <p className="text-xs text-gray-500">{perf.dismissal}</p>
                                  )}
                                  {!perf.isOut && (
                                    <p className="text-xs text-green-600">not out</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-semibold">
                                {perf.runs}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.ballsFaced}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">{perf.fours}</td>
                              <td className="px-4 py-3 text-center text-sm">{perf.sixes}</td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.strikeRate.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bowling Scorecard */}
                {innings.bowlingPerformances && innings.bowlingPerformances.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Bowling</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Bowler
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              O
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              M
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              R
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              W
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Econ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {innings.bowlingPerformances.map((perf: any) => (
                            <tr key={perf.id}>
                              <td className="px-4 py-3 text-sm font-medium">
                                {perf.player?.name || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.oversBowled}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.maidens}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.runsConceded}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-semibold">
                                {perf.wickets}
                              </td>
                              <td className="px-4 py-3 text-center text-sm">
                                {perf.economyRate.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Live Match Link */}
      {match.status === 'LIVE' && (
        <Card>
          <CardContent className="py-6 text-center">
            <Link
              href="/dashboard/live"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              🔴 Watch Live Match
            </Link>
          </CardContent>
        </Card>
      )}

      {/* AI Match Prediction */}
      {match.status === 'SCHEDULED' && (
        <MatchPredictionCard
          matchId={matchId}
          team1Name={match.homeTeam?.name || 'Team 1'}
          team2Name={match.awayTeam?.name || 'Team 2'}
        />
      )}

      {/* Social Features */}
      {(match.status === 'LIVE' || match.status === 'COMPLETED') && (
        <>
          <ShareMatch
            matchId={matchId}
            matchTitle={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
            userId={typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest'}
          />

          <HighlightGallery
            matchId={matchId}
            userId={typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest'}
            showCreateButton={match.status === 'COMPLETED'}
          />

          {match.status === 'LIVE' && (
            <MatchDiscussion
              matchId={matchId}
              userId={typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest'}
            />
          )}
        </>
      )}

      {/* Video Highlights */}
      {videoHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎥</span>
              <span>Match Highlights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              matchId={matchId}
              videoUrl={videoHighlights[0]?.videoUrl || ''}
              videoProvider={videoHighlights[0]?.videoProvider || 'S3'}
              highlights={videoHighlights}
              autoPlay={false}
              showTimeline={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Match Podcasts */}
      {matchPodcasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎙️</span>
              <span>Match Podcasts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {matchPodcasts
                .filter((p) => p.status === 'READY' || p.status === 'PUBLISHED')
                .map((podcast) => (
                  <PodcastPlayer
                    key={podcast.id}
                    podcast={podcast}
                    showChapters={true}
                    showDownload={true}
                    autoPlay={false}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Available */}
      {(!match.innings || match.innings.length === 0) && match.status === 'SCHEDULED' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Match has not started yet</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Match"
        message={`Are you sure you want to delete this match between ${match.homeTeam?.name} and ${match.awayTeam?.name}? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}
