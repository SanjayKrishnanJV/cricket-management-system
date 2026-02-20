'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { winPredictorAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface WinPredictorChartProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
}

export function WinPredictorChart({ matchId, team1Name, team2Name }: WinPredictorChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [matchId]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    socketService.connect();
    socketService.joinMatch(matchId);

    const handleWinProbabilityUpdate = (data: any) => {
      console.log('Win probability updated:', data);
      fetchData(); // Refresh the chart data
    };

    socketService.getSocket().on('winProbabilityUpdate', handleWinProbabilityUpdate);

    return () => {
      socketService.getSocket().off('winProbabilityUpdate', handleWinProbabilityUpdate);
      socketService.leaveMatch(matchId);
    };
  }, [matchId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, latestRes] = await Promise.all([
        winPredictorAPI.getHistory(matchId),
        winPredictorAPI.getLatest(matchId),
      ]);

      if (historyRes.data.success) {
        // Format data for chart
        const formattedData = historyRes.data.data.map((item: any) => ({
          over: `${item.overNumber}.${item.ballNumber}`,
          team1Prob: item.team1Probability,
          team2Prob: item.team2Probability,
          overNumber: item.overNumber,
          ballNumber: item.ballNumber,
        }));

        setData(formattedData);
      }

      if (latestRes.data.success) {
        setLatest(latestRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching win probability data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500">No win probability data available yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Probability will be calculated after each ball
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Probability Display */}
      {latest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{team1Name}</h3>
              <div className="text-3xl font-bold text-blue-600">
                {latest.team1Probability.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 bg-white rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${latest.team1Probability}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{team2Name}</h3>
              <div className="text-3xl font-bold text-red-600">
                {latest.team2Probability.toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 bg-white rounded-full h-4 overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-500"
                style={{ width: `${latest.team2Probability}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Win Probability Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-center">Win Probability Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="over"
              label={{ value: 'Over.Ball', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Win Probability (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              formatter={(value: any) => `${value.toFixed(1)}%`}
            />
            <Legend />
            <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="50%" />
            <Line
              type="monotone"
              dataKey="team1Prob"
              stroke="#2563eb"
              strokeWidth={2}
              name={team1Name}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="team2Prob"
              stroke="#dc2626"
              strokeWidth={2}
              name={team2Name}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Match Context */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600">Current Score</p>
            <p className="font-semibold text-lg">
              {latest.currentScore}/{latest.wicketsLost}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-600">Balls Remaining</p>
            <p className="font-semibold text-lg">{latest.ballsRemaining}</p>
          </div>
          {latest.target && (
            <>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600">Target</p>
                <p className="font-semibold text-lg">{latest.target}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600">Required RR</p>
                <p className="font-semibold text-lg">{latest.requiredRunRate?.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
