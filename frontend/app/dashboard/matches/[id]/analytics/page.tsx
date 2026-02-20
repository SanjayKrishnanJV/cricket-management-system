'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '@/lib/api';

export default function MatchAnalyticsPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [manhattanData, setManhattanData] = useState<any>(null);
  const [wormData, setWormData] = useState<any>(null);
  const [partnerships, setPartnerships] = useState<any>(null);
  const [phaseData, setPhaseData] = useState<any>(null);

  useEffect(() => {
    if (matchId) {
      fetchAnalytics();
    }
  }, [matchId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [manhattanRes, wormRes, partnershipRes, phaseRes] = await Promise.all([
        analyticsAPI.getManhattan(matchId),
        analyticsAPI.getWorm(matchId),
        analyticsAPI.getPartnerships(matchId),
        analyticsAPI.getPhases(matchId),
      ]);

      setManhattanData(manhattanRes.data.data);
      setWormData(wormRes.data.data);
      setPartnerships(partnershipRes.data.data);
      setPhaseData(phaseRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading advanced analytics...</p>
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
        <h1 className="text-3xl font-bold mt-2">Advanced Match Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive match analysis and visualizations</p>
      </div>

      {/* Manhattan Chart - Run Rate by Over */}
      {manhattanData && manhattanData.data && manhattanData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manhattan Chart - Run Rate by Over</CardTitle>
            <p className="text-sm text-gray-600">Runs scored in each over for both innings</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {manhattanData.data.map((innings: any, idx: number) => (
                <div key={idx}>
                  <h3 className="text-lg font-semibold mb-4">
                    Innings {innings.inningsNumber}: {innings.teamName}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={innings.overs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="overNumber" label={{ value: 'Over', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-semibold">Over {data.overNumber}</p>
                                <p className="text-sm">Runs: {data.runs}</p>
                                <p className="text-sm">Wickets: {data.wickets}</p>
                                {data.isMaiden && <p className="text-sm text-green-600">Maiden Over</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="runs" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Worm Chart - Cumulative Runs */}
      {wormData && wormData.data && wormData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Worm Chart - Cumulative Run Progression</CardTitle>
            <p className="text-sm text-gray-600">Run accumulation throughout the innings</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="overNumber"
                  type="number"
                  domain={[0, 20]}
                  label={{ value: 'Over', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {wormData.data.map((innings: any, idx: number) => (
                  <Line
                    key={idx}
                    data={innings.overs}
                    type="monotone"
                    dataKey="runs"
                    stroke={idx === 0 ? '#3b82f6' : '#ef4444'}
                    name={`${innings.teamShortName} - Innings ${innings.inningsNumber}`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Phase-wise Analysis */}
      {phaseData && phaseData.data && phaseData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phase-wise Analysis</CardTitle>
            <p className="text-sm text-gray-600">
              Performance breakdown by match phases (Powerplay, Middle, Death)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {phaseData.data.map((innings: any, idx: number) => (
                <div key={idx}>
                  <h3 className="text-lg font-semibold mb-4">
                    Innings {innings.inningsNumber}: {innings.teamName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Powerplay */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">⚡ Powerplay</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Runs:</span> {innings.powerplay.runs}</p>
                        <p><span className="font-medium">Wickets:</span> {innings.powerplay.wickets}</p>
                        <p><span className="font-medium">Overs:</span> {innings.powerplay.overs}</p>
                        <p><span className="font-medium">Run Rate:</span> {innings.powerplay.runRate}</p>
                      </div>
                    </div>

                    {/* Middle Overs */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">🏏 Middle Overs</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Runs:</span> {innings.middle.runs}</p>
                        <p><span className="font-medium">Wickets:</span> {innings.middle.wickets}</p>
                        <p><span className="font-medium">Overs:</span> {innings.middle.overs}</p>
                        <p><span className="font-medium">Run Rate:</span> {innings.middle.runRate}</p>
                      </div>
                    </div>

                    {/* Death Overs */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">🔥 Death Overs</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Runs:</span> {innings.death.runs}</p>
                        <p><span className="font-medium">Wickets:</span> {innings.death.wickets}</p>
                        <p><span className="font-medium">Overs:</span> {innings.death.overs}</p>
                        <p><span className="font-medium">Run Rate:</span> {innings.death.runRate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partnership Analysis */}
      {partnerships && partnerships.data && partnerships.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partnership Analysis</CardTitle>
            <p className="text-sm text-gray-600">Detailed breakdown of batting partnerships</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {partnerships.data.map((innings: any, idx: number) => (
                <div key={idx}>
                  <h3 className="text-lg font-semibold mb-4">
                    Innings {innings.inningsNumber}: {innings.teamName}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Partnership
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Runs
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Balls
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Run Rate
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Wicket
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {innings.partnerships.map((partnership: any, pIdx: number) => (
                          <tr key={pIdx}>
                            <td className="px-4 py-3 text-sm">
                              {partnership.batsman1}
                              {partnership.batsman2 && ` & ${partnership.batsman2}`}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold">
                              {partnership.runs}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {partnership.balls}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {partnership.balls > 0
                                ? ((partnership.runs / partnership.balls) * 6).toFixed(2)
                                : '0.00'}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {partnership.wicket || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Available */}
      {(!manhattanData || !manhattanData.data || manhattanData.data.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No analytics data available for this match yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
