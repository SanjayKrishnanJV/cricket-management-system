'use client';

import { useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';
import { useMatchStore } from '@/store/matchStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { matchAPI, authAPI } from '@/lib/api';
import LivePoll from '@/components/polls/LivePoll';
import PollCreator from '@/components/polls/PollCreator';
import PollLeaderboard from '@/components/polls/PollLeaderboard';
import UserVoteHistory from '@/components/polls/UserVoteHistory';

export default function LiveMatchPage() {
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentary, setCommentary] = useState<any[]>([]);
  const { liveScore, updateLiveScore } = useMatchStore();

  useEffect(() => {
    loadLiveMatches();
    loadCurrentUser();
    socketService.connect();

    return () => {
      if (selectedMatch) {
        socketService.leaveMatch(selectedMatch);
      }
    };
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      socketService.joinMatch(selectedMatch);
      socketService.onScoreUpdate((data) => {
        updateLiveScore(data.liveScore);
        // Add to commentary when ball is recorded
        if (data.ball) {
          addCommentary(data.ball);
        }
        // Update over history with new data
        processOverHistory(data.liveScore);
      });

      // Initial load
      loadMatchScore(selectedMatch);

      return () => {
        socketService.leaveMatch(selectedMatch);
        socketService.offScoreUpdate();
      };
    }
  }, [selectedMatch]);

  const loadLiveMatches = async () => {
    try {
      const response = await matchAPI.getAll({ status: 'LIVE' });
      setLiveMatches(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedMatch(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load live matches:', error);
    }
  };

  const loadMatchScore = async (matchId: string) => {
    try {
      const response = await matchAPI.getLiveScore(matchId);
      updateLiveScore(response.data.data);
      // Process over history from the loaded data
      processOverHistory(response.data.data);
    } catch (error) {
      console.error('Failed to load match score:', error);
    }
  };

  const [overHistory, setOverHistory] = useState<any[]>([]);

  const processOverHistory = (liveScoreData: any) => {
    if (!liveScoreData?.currentInnings?.balls) {
      setOverHistory([]);
      return;
    }

    const balls = liveScoreData.currentInnings.balls || [];

    // Group balls by over
    const groupedByOver: { [key: number]: any[] } = {};
    balls.forEach((ball: any) => {
      if (!groupedByOver[ball.overNumber]) {
        groupedByOver[ball.overNumber] = [];
      }
      groupedByOver[ball.overNumber].push(ball);
    });

    // Convert to array and sort by over number (descending for latest first)
    const overs = Object.keys(groupedByOver)
      .map(overNum => ({
        overNumber: parseInt(overNum),
        balls: groupedByOver[parseInt(overNum)].sort((a, b) => a.ballNumber - b.ballNumber),
        totalRuns: groupedByOver[parseInt(overNum)].reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0),
      }))
      .sort((a, b) => b.overNumber - a.overNumber); // Latest over first

    setOverHistory(overs);
  };

  const addCommentary = (ball: any) => {
    const comment = generateCommentary(ball);
    setCommentary(prev => [comment, ...prev].slice(0, 50)); // Keep last 50 balls
  };

  const generateCommentary = (ball: any) => {
    const over = `${ball.overNumber}.${ball.ballNumber}`;
    let text = '';

    if (ball.isWicket) {
      text = `WICKET! ${ball.batsman?.name} is OUT! ${ball.dismissalType || 'Dismissed'}`;
    } else if (ball.runs === 6) {
      text = `SIX! ${ball.batsman?.name} smashes it for a maximum!`;
    } else if (ball.runs === 4) {
      text = `FOUR! Beautiful shot by ${ball.batsman?.name}`;
    } else if (ball.isNoBall) {
      text = `NO BALL! ${ball.runs} runs scored. Free hit coming up!`;
    } else if (ball.isWide) {
      text = `WIDE! ${ball.bowler?.name} strays down the leg side`;
    } else if (ball.runs === 0) {
      text = `Dot ball. ${ball.bowler?.name} keeps it tight`;
    } else {
      text = `${ball.runs} run${ball.runs > 1 ? 's' : ''} taken by ${ball.batsman?.name}`;
    }

    return {
      over,
      text,
      runs: ball.runs,
      isWicket: ball.isWicket,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  if (!liveScore || !liveScore.live) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🔴</span>
            Live Match
          </h1>
          <p className="text-gray-600 mt-2">Real-time cricket action</p>
        </div>
        {liveMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No live matches at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select a Live Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {liveMatches.map((match) => (
                  <Button
                    key={match.id}
                    variant={selectedMatch === match.id ? 'primary' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedMatch(match.id)}
                  >
                    {match.homeTeam?.name} vs {match.awayTeam?.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const match = liveScore.match;
  const currentInnings = liveScore.currentInnings;
  const onStrike = currentInnings.battingPerformances?.find((p: any) => !p.isOut && p.onStrike);
  const offStrike = currentInnings.battingPerformances?.find((p: any) => !p.isOut && !p.onStrike);
  const currentBowler = currentInnings.bowlingPerformances?.find((p: any) => p.currentlyBowling);

  // Calculate yet to bat and bowl
  const battedPlayers = currentInnings.battingPerformances?.map((p: any) => p.playerId) || [];
  const bowledPlayers = currentInnings.bowlingPerformances?.map((p: any) => p.playerId) || [];

  // Get target for second innings
  const isSecondInnings = currentInnings.inningsNumber === 2;
  const firstInningsScore = isSecondInnings && liveScore.match.innings?.[0]
    ? liveScore.match.innings[0].totalRuns
    : null;
  const target = firstInningsScore !== null ? firstInningsScore + 1 : null;
  const runsNeeded = target ? target - currentInnings.totalRuns : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl animate-pulse">🔴</span>
          Live Match
        </h1>
        <p className="text-gray-600 mt-2">{match.venue}</p>
      </div>

      {/* Match Header */}
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Innings {currentInnings.inningsNumber} • {match.matchType || 'T20'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="animate-pulse rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                ● LIVE
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Score */}
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">
                  {currentInnings.totalRuns}/{currentInnings.totalWickets}
                </div>
                <div className="text-xl text-gray-600 mt-2">
                  Overs: {currentInnings.totalOvers}
                </div>
                {isSecondInnings && target && runsNeeded !== null && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-3">Target: {target}</div>

                    {/* Runs Needed */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-green-600">
                        {runsNeeded > 0 ? runsNeeded : 0} runs needed
                      </div>
                      <div className="text-lg text-gray-700 mt-1">
                        in {Math.max(0, ((match.totalOvers || 20) * 6) - Math.floor(currentInnings.totalOvers * 6))} balls
                      </div>
                    </div>

                    {/* Run Rates Comparison */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Current Run Rate</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {(currentInnings.totalRuns / (currentInnings.totalOvers || 1)).toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-xs text-gray-600 mb-1">Required Run Rate</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {runsNeeded > 0 && ((match.totalOvers || 20) - currentInnings.totalOvers) > 0
                            ? (runsNeeded / ((match.totalOvers || 20) - currentInnings.totalOvers)).toFixed(2)
                            : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Players */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-xs text-gray-600 mb-1">On Strike</div>
                  <div className="font-bold text-green-700">
                    {onStrike?.player?.name || 'N/A'}
                  </div>
                  {onStrike && (
                    <div className="text-sm text-gray-700 mt-1">
                      {onStrike.runs} ({onStrike.ballsFaced})
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Non-Strike</div>
                  <div className="font-bold text-blue-700">
                    {offStrike?.player?.name || 'N/A'}
                  </div>
                  {offStrike && (
                    <div className="text-sm text-gray-700 mt-1">
                      {offStrike.runs} ({offStrike.ballsFaced})
                    </div>
                  )}
                </div>

                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <div className="text-xs text-gray-600 mb-1">Bowling</div>
                  <div className="font-bold text-red-700">
                    {currentBowler?.player?.name || 'N/A'}
                  </div>
                  {currentBowler && (
                    <div className="text-sm text-gray-700 mt-1">
                      {currentBowler.wickets}-{currentBowler.runsConceded} ({currentBowler.oversBowled})
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Balls */}
              {currentInnings.lastBalls && currentInnings.lastBalls.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-semibold text-sm text-gray-700">This Over</h3>
                  <div className="flex space-x-2 flex-wrap gap-2">
                    {currentInnings.lastBalls.slice(-6).map((ball: any, index: number) => (
                      <div
                        key={index}
                        className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${
                          ball.isWicket
                            ? 'bg-red-500 text-white'
                            : ball.runs === 6
                            ? 'bg-green-500 text-white'
                            : ball.runs === 4
                            ? 'bg-blue-500 text-white'
                            : ball.runs > 0
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                      >
                        {ball.isWicket ? 'W' : ball.runs}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Over-by-Over Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Over-by-Over Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {overHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Over history will appear here</p>
                ) : (
                  overHistory.map((over) => (
                    <div key={over.overNumber} className="border rounded-lg p-4 bg-gray-50">
                      {/* Over Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-800">
                            Over {over.overNumber}
                          </span>
                          <span className="text-sm text-gray-600">
                            {over.totalRuns} run{over.totalRuns !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Bowler and Batsmen Info */}
                      {over.balls.length > 0 && (
                        <div className="mb-3 text-sm text-gray-600">
                          <span className="font-semibold">{over.balls[0].bowler?.name || 'Unknown'}</span>
                          {' to '}
                          <span className="font-semibold">{over.balls[0].batsman?.name || 'Unknown'}</span>
                          {over.balls[0].nonStriker?.name && (
                            <span> & {over.balls[0].nonStriker.name}</span>
                          )}
                        </div>
                      )}

                      {/* Ball-by-Ball */}
                      <div className="flex flex-wrap gap-2">
                        {over.balls.map((ball: any, index: number) => {
                          const getBallDisplay = () => {
                            if (ball.isWicket) return 'W';
                            if (ball.isWide) return `WD${ball.runs || 0}`;
                            if (ball.isNoBall) return `NB${ball.runs || 0}`;
                            if (ball.isBye) return `B${ball.runs || 0}`;
                            if (ball.isLegBye) return `LB${ball.runs || 0}`;
                            return ball.runs?.toString() || '0';
                          };

                          const getBallColor = () => {
                            if (ball.isWicket) return 'bg-red-500 text-white';
                            if (ball.runs === 6) return 'bg-purple-500 text-white';
                            if (ball.runs === 4) return 'bg-blue-500 text-white';
                            if (ball.runs === 3) return 'bg-green-600 text-white';
                            if (ball.runs === 2) return 'bg-green-500 text-white';
                            if (ball.runs === 1) return 'bg-green-400 text-white';
                            if (ball.isWide || ball.isNoBall) return 'bg-yellow-500 text-white';
                            if (ball.isBye || ball.isLegBye) return 'bg-orange-500 text-white';
                            return 'bg-gray-400 text-white';
                          };

                          return (
                            <div
                              key={index}
                              className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-sm ${getBallColor()}`}
                              title={`Ball ${ball.ballNumber}: ${getBallDisplay()} - ${ball.batsman?.name || ''}`}
                            >
                              {getBallDisplay()}
                            </div>
                          );
                        })}
                      </div>

                      {/* Over Summary */}
                      {over.balls.some((b: any) => b.isWicket) && (
                        <div className="mt-3 text-sm text-red-600 font-semibold">
                          {over.balls.filter((b: any) => b.isWicket).map((b: any) => (
                            <div key={b.id}>
                              ⚠️ {b.batsman?.name} - {b.dismissalType || 'OUT'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Commentary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📢 Live Commentary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commentary.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Commentary will appear here as balls are bowled</p>
                ) : (
                  commentary.map((comment, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        comment.isWicket
                          ? 'bg-red-50 border-red-500'
                          : comment.runs >= 4
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-bold text-sm text-gray-600">{comment.over}</span>
                          <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Batting Scorecard */}
          {currentInnings.battingPerformances && (
            <Card>
              <CardHeader>
                <CardTitle>Batting Scorecard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Batsman</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">R</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">B</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">4s</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">6s</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentInnings.battingPerformances.map((perf: any) => (
                        <tr
                          key={perf.id}
                          className={`${
                            perf.onStrike ? 'bg-green-50 font-semibold' : ''
                          } ${!perf.isOut && !perf.onStrike ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm">
                            {perf.player?.name || 'Unknown'}
                            {perf.onStrike && <span className="ml-2 text-green-600">*</span>}
                            {!perf.isOut && !perf.onStrike && <span className="ml-2 text-blue-600">†</span>}
                            {perf.isOut && (
                              <span className="ml-2 text-xs text-gray-500">({perf.dismissal})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-semibold">{perf.runs}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.ballsFaced}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.fours}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.sixes}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.strikeRate.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bowling Scorecard */}
          {currentInnings.bowlingPerformances && (
            <Card>
              <CardHeader>
                <CardTitle>Bowling Figures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Bowler</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">O</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">M</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">R</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">W</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentInnings.bowlingPerformances.map((perf: any) => (
                        <tr
                          key={perf.id}
                          className={perf.currentlyBowling ? 'bg-red-50 font-semibold' : ''}
                        >
                          <td className="px-4 py-3 text-sm">
                            {perf.player?.name || 'Unknown'}
                            {perf.currentlyBowling && <span className="ml-2 text-red-600">●</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-sm">{perf.oversBowled}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.maidens}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.runsConceded}</td>
                          <td className="px-4 py-3 text-center text-sm font-semibold">{perf.wickets}</td>
                          <td className="px-4 py-3 text-center text-sm">{perf.economyRate.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Match Summary */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Match Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-gray-600">Match Type</div>
                <div className="font-semibold">{match.matchType || 'T20'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Venue</div>
                <div className="font-semibold text-sm">{match.venue}</div>
              </div>
              {match.tossWinner && (
                <div>
                  <div className="text-xs text-gray-600">Toss</div>
                  <div className="font-semibold text-sm">
                    {match.tossWinner.name} won and chose to {match.tossDecision}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-600">Current RR</div>
                <div className="font-semibold">
                  {(currentInnings.totalRuns / (currentInnings.totalOvers || 1)).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yet to Bat */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yet to Bat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentInnings.battingTeam?.squad?.filter((p: any) => !battedPlayers.includes(p.playerId)).length === 0 ? (
                  <p className="text-sm text-gray-500">All players have batted</p>
                ) : (
                  currentInnings.battingTeam?.squad
                    ?.filter((p: any) => !battedPlayers.includes(p.playerId))
                    .map((player: any, index: number) => (
                      <div key={index} className="text-sm py-2 px-3 bg-gray-50 rounded">
                        {player.player?.name || `Player ${index + 1}`}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Yet to Bowl */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yet to Bowl</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentInnings.bowlingTeam?.squad?.filter((p: any) => !bowledPlayers.includes(p.playerId)).length === 0 ? (
                  <p className="text-sm text-gray-500">All bowlers have bowled</p>
                ) : (
                  currentInnings.bowlingTeam?.squad
                    ?.filter((p: any) => !bowledPlayers.includes(p.playerId))
                    .map((player: any, index: number) => (
                      <div key={index} className="text-sm py-2 px-3 bg-gray-50 rounded">
                        {player.player?.name || `Player ${index + 1}`}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Win Probability */}
          {liveScore.winProbability && (
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg">Win Probability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-200">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${liveScore.winProbability.teamBattingWinProb}%` }}
                    ></div>
                    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-between px-3 text-sm font-bold text-white">
                      <span className="drop-shadow-md">{liveScore.winProbability.teamBattingWinProb}%</span>
                      <span className="drop-shadow-md">{liveScore.winProbability.teamFieldingWinProb}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-600">
                    {liveScore.winProbability.prediction}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Live Polls & Predictions Section */}
      {currentUser && (
        <div className="mt-8 border-t-2 border-gray-200 pt-8">
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🗳️</span>
            Live Polls & Predictions
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LivePoll matchId={match.id} userId={currentUser.id} />
            </div>

            <div className="space-y-6">
              {(currentUser.role === 'SUPER_ADMIN' ||
                currentUser.role === 'TOURNAMENT_ADMIN' ||
                currentUser.role === 'SCORER') && (
                <PollCreator matchId={match.id} userId={currentUser.id} />
              )}
              <PollLeaderboard matchId={match.id} />
              <UserVoteHistory matchId={match.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
