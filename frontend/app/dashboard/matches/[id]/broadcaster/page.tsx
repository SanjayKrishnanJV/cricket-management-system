'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { broadcastAPI, matchAPI, winPredictorAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { io, Socket } from 'socket.io-client';

interface TalkingPoint {
  id: string;
  category: string;
  priority: number;
  headline: string;
  description: string;
  isUsed: boolean;
  contextData?: any;
}

interface BroadcasterSettings {
  layout: string;
  theme: string;
  autoTalkingPoints: boolean;
  panels: any;
}

interface MatchData {
  id: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  currentInnings?: {
    battingTeam: { name: string };
    score: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  status: string;
}

interface WinProbability {
  team1Probability: number;
  team2Probability: number;
}

export default function BroadcasterDashboard() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([]);
  const [settings, setSettings] = useState<BroadcasterSettings | null>(null);
  const [winProb, setWinProb] = useState<WinProbability | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchRes, settingsRes, talkingPointsRes] = await Promise.all([
          matchAPI.getById(matchId),
          broadcastAPI.getBroadcasterSettings(matchId),
          broadcastAPI.getTalkingPoints(matchId),
        ]);

        setMatch(matchRes.data.data);
        setSettings(settingsRes.data.data);
        setTalkingPoints(talkingPointsRes.data.data || []);

        // Load win probability if match is live
        if (matchRes.data.data.status === 'LIVE') {
          try {
            const winProbRes = await winPredictorAPI.getLatest(matchId);
            setWinProb(winProbRes.data.data);
          } catch (err) {
            console.error('Win probability not available');
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load broadcaster dashboard:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [matchId]);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.emit('join-match', matchId);

    newSocket.on('match-update', (data) => {
      setMatch((prev) => ({ ...prev, ...data }));
    });

    newSocket.on('ball-recorded', () => {
      // Refresh match data
      matchAPI.getById(matchId).then((res) => setMatch(res.data.data));

      // Refresh talking points if auto-generation is enabled
      if (settings?.autoTalkingPoints) {
        broadcastAPI.getTalkingPoints(matchId).then((res) => {
          setTalkingPoints(res.data.data || []);
        });
      }

      // Refresh win probability
      winPredictorAPI.getLatest(matchId).then((res) => {
        setWinProb(res.data.data);
      }).catch(() => {});
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-match', matchId);
      newSocket.close();
    };
  }, [matchId, settings]);

  const handleMarkPointUsed = async (pointId: string) => {
    try {
      console.log('Marking point as used:', pointId);
      const res = await broadcastAPI.markTalkingPointUsed(pointId);
      console.log('Mark used response:', res.data);
      setTalkingPoints((prev) =>
        prev.map((p) => (p.id === pointId ? { ...p, isUsed: true } : p))
      );
    } catch (error: any) {
      console.error('Failed to mark talking point as used:', error);
      alert(`Error marking point as used: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateTalkingPoints = async () => {
    try {
      const overNumber = match?.currentInnings?.overs || 0;
      console.log('Generating talking points for match:', matchId, 'over:', overNumber);
      const generateRes = await broadcastAPI.generateTalkingPoints(matchId, { overNumber });
      console.log('Generate response:', generateRes.data);
      const res = await broadcastAPI.getTalkingPoints(matchId);
      console.log('Fetched talking points:', res.data);
      setTalkingPoints(res.data.data || []);
      alert(`Generated ${res.data.data?.length || 0} talking points`);
    } catch (error: any) {
      console.error('Failed to generate talking points:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleExportGraphics = () => {
    alert('Export Graphics feature - This would export current stats as images for broadcast graphics');
  };

  const handleTakeScreenshot = () => {
    alert('Take Screenshot feature - This would capture the current dashboard view');
  };

  const handleCommercialBreak = () => {
    const breakDuration = prompt('Enter commercial break duration (seconds):', '180');
    if (breakDuration) {
      alert(`Commercial break timer set for ${breakDuration} seconds`);
    }
  };

  const handleRefreshData = async () => {
    try {
      const [matchRes, talkingPointsRes] = await Promise.all([
        matchAPI.getById(matchId),
        broadcastAPI.getTalkingPoints(matchId),
      ]);
      setMatch(matchRes.data.data);
      setTalkingPoints(talkingPointsRes.data.data || []);

      if (matchRes.data.data.status === 'LIVE') {
        const winProbRes = await winPredictorAPI.getLatest(matchId);
        setWinProb(winProbRes.data.data);
      }
      alert('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      alert('Failed to refresh data');
    }
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return 'bg-red-600';
    if (priority >= 5) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      MILESTONE: '🎯',
      STAT: '📊',
      RECORD: '🏆',
      PREDICTION: '🔮',
      COMPARISON: '⚖️',
      HISTORY: '📜',
      OTHER: '💡',
    };
    return icons[category] || '💡';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Broadcaster Dashboard...</div>
      </div>
    );
  }

  const unusedPoints = talkingPoints.filter((p) => !p.isUsed).sort((a, b) => b.priority - a.priority);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Top Header */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Live Score Panel */}
        <div className="col-span-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6 border-2 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-300 mb-1">
                {match?.status === 'LIVE' && (
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="text-4xl font-bold">
                {match?.homeTeam.shortName} vs {match?.awayTeam.shortName}
              </div>
            </div>

            {match?.currentInnings && (
              <div className="text-right">
                <div className="text-6xl font-bold">
                  {match.currentInnings.score}/{match.currentInnings.wickets}
                </div>
                <div className="text-2xl text-blue-300 mt-1">
                  {match.currentInnings.overs}.{match.currentInnings.balls} overs
                </div>
                <div className="text-lg text-blue-400 mt-1">
                  {match.currentInnings.battingTeam.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clock & Info Panel */}
        <div className="col-span-4 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-center">
            <div className="text-5xl font-bold font-mono">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Talking Points Panel - Takes 2/3 width */}
        <div className="col-span-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">💬 Talking Points</h2>
            <Button
              onClick={handleGenerateTalkingPoints}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🤖 Generate New Points
            </Button>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
            {unusedPoints.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-4">💭</div>
                <div className="text-xl">No talking points available</div>
                <div className="text-sm mt-2">Click "Generate New Points" to create AI suggestions</div>
              </div>
            ) : (
              unusedPoints.map((point) => (
                <div
                  key={point.id}
                  className="bg-gray-900 rounded-lg p-4 border-l-4 hover:bg-gray-850 transition-all"
                  style={{ borderLeftColor: getPriorityColor(point.priority) }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(point.category)}</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {point.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded text-white ${getPriorityColor(point.priority)}`}>
                          Priority {point.priority}
                        </span>
                      </div>
                      <div className="text-xl font-semibold mb-2">{point.headline}</div>
                      <div className="text-base text-gray-300">{point.description}</div>
                    </div>

                    <Button
                      onClick={() => handleMarkPointUsed(point.id)}
                      size="sm"
                      variant="outline"
                      className="ml-4 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      ✓ Used
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {unusedPoints.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
              {unusedPoints.length} unused talking point{unusedPoints.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>

        {/* Side Panels */}
        <div className="col-span-4 space-y-6">
          {/* Win Predictor */}
          {winProb && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">📈 Win Predictor</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{match?.homeTeam.shortName}</span>
                    <span className="text-2xl font-bold">{winProb.team1Probability}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${winProb.team1Probability}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{match?.awayTeam.shortName}</span>
                    <span className="text-2xl font-bold">{winProb.team2Probability}%</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${winProb.team2Probability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <Button onClick={handleExportGraphics} className="w-full justify-start" variant="outline">
                📊 Export Graphics
              </Button>
              <Button onClick={handleTakeScreenshot} className="w-full justify-start" variant="outline">
                📸 Take Screenshot
              </Button>
              <Button onClick={handleCommercialBreak} className="w-full justify-start" variant="outline">
                🎬 Commercial Break
              </Button>
              <Button onClick={handleRefreshData} className="w-full justify-start" variant="outline">
                🔄 Refresh Data
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">⚙️ Settings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Auto Talking Points</span>
                <span className={settings?.autoTalkingPoints ? 'text-green-400' : 'text-red-400'}>
                  {settings?.autoTalkingPoints ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <span className="text-gray-400">{settings?.theme || 'Dark'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Layout</span>
                <span className="text-gray-400">{settings?.layout || 'Default'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
