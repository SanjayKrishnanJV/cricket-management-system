'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { visualizationAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { WagonWheel } from '@/components/visualizations/WagonWheel';
import { PitchMap } from '@/components/visualizations/PitchMap';
import { FieldPlacementSimulator } from '@/components/visualizations/FieldPlacementSimulator';
import { Replay3D } from '@/components/visualizations/Replay3D';

export default function VisualizationsPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wagon' | 'pitch' | 'field' | '3d'>('wagon');
  const [match, setMatch] = useState<any>(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const [wagonData, setWagonData] = useState<any>(null);
  const [pitchData, setPitchData] = useState<any>(null);
  const [fieldData, setFieldData] = useState<any>(null);
  const [replayData, setReplayData] = useState<any>(null);
  const [selectedBallIndex, setSelectedBallIndex] = useState<number>(0);

  // Wagon wheel comparison state
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [batsman1Id, setBatsman1Id] = useState<string>('');
  const [batsman2Id, setBatsman2Id] = useState<string>('');
  const [wagonData1, setWagonData1] = useState<any>(null);
  const [wagonData2, setWagonData2] = useState<any>(null);

  // Export handlers
  const exportAsSVG = (elementId: string, filename: string) => {
    const svgElement = document.querySelector(`#${elementId} svg`);
    if (!svgElement) {
      alert('No visualization found to export');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const exportAsPNG = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      alert('No visualization found to export');
      return;
    }

    try {
      // For SVG-based visualizations
      const svgElement = element.querySelector('svg');
      if (svgElement) {
        const canvas = document.createElement('canvas');
        const bbox = svgElement.getBoundingClientRect();
        canvas.width = bbox.width * 2; // 2x for better quality
        canvas.height = bbox.height * 2;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.scale(2, 2);
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.href = pngUrl;
              downloadLink.download = filename;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(pngUrl);
            }
          });
          URL.revokeObjectURL(url);
        };

        img.src = url;
      } else {
        // For canvas-based visualizations (3D)
        const canvasElement = element.querySelector('canvas');
        if (canvasElement) {
          canvasElement.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.href = pngUrl;
              downloadLink.download = filename;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(pngUrl);
            }
          });
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export visualization');
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchData();
    }
  }, [matchId]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!matchId || !liveUpdatesEnabled) return;

    // Connect socket
    socketService.connect();

    // Join match room for real-time updates
    socketService.joinMatch(matchId);

    // Listen for ball updates
    const handleBallRecorded = (data: any) => {
      console.log('Ball recorded, refreshing visualizations...', data);
      setLastUpdate(new Date().toLocaleTimeString());

      // Refresh all visualization data
      fetchVisualizationData();
    };

    const handleOverCompleted = (data: any) => {
      console.log('Over completed, refreshing visualizations...', data);
      setLastUpdate(new Date().toLocaleTimeString());

      // Refresh all visualization data
      fetchVisualizationData();
    };

    socketService.getSocket().on('ballRecorded', handleBallRecorded);
    socketService.getSocket().on('overCompleted', handleOverCompleted);

    // Cleanup on unmount
    return () => {
      socketService.getSocket().off('ballRecorded', handleBallRecorded);
      socketService.getSocket().off('overCompleted', handleOverCompleted);
      socketService.leaveMatch(matchId);
    };
  }, [matchId, liveUpdatesEnabled]);

  const fetchVisualizationData = async () => {
    try {
      const [wagonRes, pitchRes, fieldRes, replayRes] = await Promise.all([
        visualizationAPI.getWagonWheel(matchId),
        visualizationAPI.getPitchMap(matchId),
        visualizationAPI.getFieldPlacements(matchId),
        visualizationAPI.get3DReplay(matchId),
      ]);

      setWagonData(wagonRes.data.data);
      setPitchData(pitchRes.data.data);
      setFieldData(fieldRes.data.data);
      setReplayData(replayRes.data.data);
    } catch (error) {
      console.error('Failed to refresh visualization data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchRes, wagonRes, pitchRes, fieldRes, replayRes] = await Promise.all([
        fetch(`http://localhost:5000/api/matches/${matchId}`),
        visualizationAPI.getWagonWheel(matchId),
        visualizationAPI.getPitchMap(matchId),
        visualizationAPI.getFieldPlacements(matchId),
        visualizationAPI.get3DReplay(matchId),
      ]);

      const matchData = await matchRes.json();
      setMatch(matchData.data);
      setWagonData(wagonRes.data.data);
      setPitchData(pitchRes.data.data);
      setFieldData(fieldRes.data.data);
      setReplayData(replayRes.data.data);
    } catch (error) {
      console.error('Failed to fetch visualization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    if (!batsman1Id || !batsman2Id) {
      alert('Please select both batsmen to compare');
      return;
    }

    try {
      const [wagon1Res, wagon2Res] = await Promise.all([
        visualizationAPI.getWagonWheel(matchId, { batsmanId: batsman1Id }),
        visualizationAPI.getWagonWheel(matchId, { batsmanId: batsman2Id }),
      ]);

      setWagonData1(wagon1Res.data.data);
      setWagonData2(wagon2Res.data.data);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      alert('Failed to load comparison data');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading visualizations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/dashboard/matches/${matchId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Match Details
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-3xl font-bold">Advanced Visualizations</h1>
            <p className="text-gray-600 mt-1">Interactive match insights and analysis</p>
          </div>

          {/* Live Updates Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 shadow-sm">
              <button
                onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  liveUpdatesEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    liveUpdatesEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    liveUpdatesEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {liveUpdatesEnabled ? 'Live Updates' : 'Manual Refresh'}
                </span>
              </div>
            </div>
            {lastUpdate && liveUpdatesEnabled && (
              <div className="text-xs text-gray-500">
                Last update: {lastUpdate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {[
          { id: 'wagon', label: 'Wagon Wheel', icon: '🏏' },
          { id: 'pitch', label: 'Pitch Map', icon: '🎯' },
          { id: 'field', label: 'Field Placement', icon: '⚾' },
          { id: '3d', label: '3D Replay', icon: '🎬' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-semibold whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'wagon' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Wagon Wheel - Shot Distribution</CardTitle>
                  <p className="text-sm text-gray-600">Visual representation of where runs were scored on the field</p>
                </div>
                {wagonData && wagonData.data && wagonData.data.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportAsPNG('wagon-wheel-viz', `wagon-wheel-match-${matchId}.png`)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📥 PNG
                    </button>
                    <button
                      onClick={() => exportAsSVG('wagon-wheel-viz', `wagon-wheel-match-${matchId}.svg`)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📥 SVG
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Comparison Mode Toggle */}
              {wagonData && wagonData.data && wagonData.data.length > 0 && (
                <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Comparison Mode</span>
                  <button
                    onClick={() => {
                      setComparisonMode(!comparisonMode);
                      if (comparisonMode) {
                        setBatsman1Id('');
                        setBatsman2Id('');
                        setWagonData1(null);
                        setWagonData2(null);
                      }
                    }}
                    className={`px-4 py-1 rounded ${
                      comparisonMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {comparisonMode ? 'Exit Comparison' : 'Compare Batsmen'}
                  </button>
                </div>
              )}

              {/* Comparison Mode: Batsman Selection */}
              {comparisonMode && wagonData && wagonData.data && wagonData.data.length > 0 && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batsman 1
                      </label>
                      <select
                        value={batsman1Id}
                        onChange={(e) => setBatsman1Id(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select batsman...</option>
                        {match?.innings?.flatMap((innings: any) =>
                          innings.battingPerformances?.map((perf: any) => (
                            <option key={perf.playerId} value={perf.playerId}>
                              {perf.player?.name} ({perf.runs} runs)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batsman 2
                      </label>
                      <select
                        value={batsman2Id}
                        onChange={(e) => setBatsman2Id(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select batsman...</option>
                        {match?.innings?.flatMap((innings: any) =>
                          innings.battingPerformances?.map((perf: any) => (
                            <option key={perf.playerId} value={perf.playerId}>
                              {perf.player?.name} ({perf.runs} runs)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      onClick={loadComparisonData}
                      disabled={!batsman1Id || !batsman2Id}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Load Comparison
                    </button>
                  </div>
                </div>
              )}

              {/* Comparison View: Side-by-Side */}
              {comparisonMode && wagonData1 && wagonData2 ? (
                <div className="py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-center font-semibold mb-2">
                        {match?.innings
                          ?.flatMap((i: any) => i.battingPerformances)
                          ?.find((p: any) => p.playerId === batsman1Id)?.player?.name}
                      </h3>
                      <div id="wagon-wheel-viz-1">
                        <WagonWheel data={wagonData1.data} />
                      </div>
                      <div className="mt-2 text-center text-sm text-gray-600">
                        <p>Total shots: {wagonData1.totalShots}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-center font-semibold mb-2">
                        {match?.innings
                          ?.flatMap((i: any) => i.battingPerformances)
                          ?.find((p: any) => p.playerId === batsman2Id)?.player?.name}
                      </h3>
                      <div id="wagon-wheel-viz-2">
                        <WagonWheel data={wagonData2.data} />
                      </div>
                      <div className="mt-2 text-center text-sm text-gray-600">
                        <p>Total shots: {wagonData2.totalShots}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !comparisonMode && wagonData && wagonData.data && wagonData.data.length > 0 ? (
                <div className="py-4">
                  <div id="wagon-wheel-viz">
                    <WagonWheel data={wagonData.data} />
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Total shots recorded: {wagonData.totalShots}</p>
                  </div>
                </div>
              ) : comparisonMode ? (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 mb-2">Select two batsmen and click "Load Comparison"</p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">🏏</div>
                  <p className="text-gray-500 mb-2">No wagon wheel data available</p>
                  <p className="text-sm text-gray-400">
                    Enable advanced tracking when recording balls to see shot distribution
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'pitch' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Pitch Map - Bowling Heat Map</CardTitle>
                  <p className="text-sm text-gray-600">Where bowlers pitched the ball and outcomes</p>
                </div>
                {pitchData && pitchData.data && pitchData.data.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportAsPNG('pitch-map-viz', `pitch-map-match-${matchId}.png`)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📥 PNG
                    </button>
                    <button
                      onClick={() => exportAsSVG('pitch-map-viz', `pitch-map-match-${matchId}.svg`)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📥 SVG
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pitchData && pitchData.data && pitchData.data.length > 0 ? (
                <div className="py-4">
                  <div id="pitch-map-viz">
                    <PitchMap data={pitchData.data} heatMap={pitchData.heatMap} />
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Total balls recorded: {pitchData.totalBalls}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-500 mb-2">No pitch map data available</p>
                  <p className="text-sm text-gray-400">
                    Enable advanced tracking when recording balls to see bowling patterns
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'field' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Field Placement Simulator</CardTitle>
                  <p className="text-sm text-gray-600">Interactive field positioning editor</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportAsPNG('field-placement-viz', `field-placement-match-${matchId}.png`)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📥 PNG
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="field-placement-viz">
                <FieldPlacementSimulator
                players={(() => {
                  // Get all players from both teams in the match
                  const players: any[] = [];

                  if (match?.team1?.players) {
                    match.team1.players.forEach((p: any) => {
                      players.push({
                        id: p.id,
                        name: p.name,
                        team: match.team1.name,
                      });
                    });
                  }

                  if (match?.team2?.players) {
                    match.team2.players.forEach((p: any) => {
                      players.push({
                        id: p.id,
                        name: p.name,
                        team: match.team2.name,
                      });
                    });
                  }

                  return players;
                })()}
                initialPositions={fieldData?.data?.[0]?.positions}
                onSave={async (positions) => {
                  try {
                    // Get the latest innings or first innings if match just started
                    const currentInnings = match?.innings?.find((i: any) => i.status === 'IN_PROGRESS')
                      || match?.innings?.[match?.innings?.length - 1]
                      || match?.innings?.[0];

                    if (!currentInnings) {
                      alert('No innings found. Start the match first.');
                      return;
                    }

                    await visualizationAPI.saveFieldPlacement(matchId, {
                      inningsId: currentInnings.id,
                      overNumber: currentInnings.totalOvers || 1,
                      positions,
                    });
                    alert('Field placement saved!');
                  } catch (error) {
                    console.error('Failed to save field placement:', error);
                    alert('Failed to save field placement');
                  }
                }}
              />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === '3d' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>3D Match Replay</CardTitle>
                  <p className="text-sm text-gray-600">3D visualization of ball trajectory and shots</p>
                </div>
                {replayData && replayData.data && replayData.data.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportAsPNG('replay-3d-viz', `3d-replay-match-${matchId}-ball-${selectedBallIndex + 1}.png`)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📥 PNG
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {replayData && replayData.data && replayData.data.length > 0 ? (
                <div className="py-4">
                  {/* Ball Selection Controls */}
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBallIndex(Math.max(0, selectedBallIndex - 1))}
                          disabled={selectedBallIndex === 0}
                          className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                        >
                          ← Previous
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                          Ball {selectedBallIndex + 1} of {replayData.data.length}
                        </span>
                        <button
                          onClick={() => setSelectedBallIndex(Math.min(replayData.data.length - 1, selectedBallIndex + 1))}
                          disabled={selectedBallIndex === replayData.data.length - 1}
                          className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                        >
                          Next →
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Jump to ball:</label>
                        <select
                          value={selectedBallIndex}
                          onChange={(e) => setSelectedBallIndex(parseInt(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {replayData.data.map((ball: any, idx: number) => (
                            <option key={idx} value={idx}>
                              Over {ball.overNumber}.{ball.ballNumber} - {ball.bowler} to {ball.batsman}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3D Replay Visualization */}
                  <div id="replay-3d-viz">
                    <Replay3D ballData={replayData.data[selectedBallIndex]} />
                  </div>

                  {/* Ball Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-center gap-4 text-sm flex-wrap">
                      <div className="bg-gray-100 px-3 py-1 rounded">
                        <strong>Over:</strong> {replayData.data[selectedBallIndex].overNumber}.{replayData.data[selectedBallIndex].ballNumber}
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded">
                        <strong>Bowler:</strong> {replayData.data[selectedBallIndex].bowler}
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded">
                        <strong>Batsman:</strong> {replayData.data[selectedBallIndex].batsman}
                      </div>
                      <div className={`px-3 py-1 rounded font-semibold ${
                        replayData.data[selectedBallIndex].isWicket
                          ? 'bg-red-100 text-red-700'
                          : replayData.data[selectedBallIndex].runs >= 4
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {replayData.data[selectedBallIndex].isWicket
                          ? '🎯 WICKET'
                          : `${replayData.data[selectedBallIndex].runs} ${replayData.data[selectedBallIndex].runs === 1 ? 'run' : 'runs'}`}
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      Use mouse to rotate, scroll to zoom, right-click to pan
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-500 mb-2">No 3D replay data available</p>
                  <p className="text-sm text-gray-400">
                    3D trajectory data will be available once advanced tracking is enabled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feature Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Advanced Visualization Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>🏏 Wagon Wheel:</strong> Shows shot distribution across the cricket field
            </div>
            <div>
              <strong>🎯 Pitch Map:</strong> Displays bowling line and length heat map
            </div>
            <div>
              <strong>⚾ Field Placement:</strong> Drag-and-drop fielder positioning tool
            </div>
            <div>
              <strong>🎬 3D Replay:</strong> Interactive 3D ball trajectory animation
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
