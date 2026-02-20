'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { featuresAPI, playerAPI } from '@/lib/api';

export default function PlayerComparisonPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const response = await playerAPI.getAll();
      setPlayers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const comparePlayersHandler = async () => {
    if (!player1Id || !player2Id) {
      alert('Please select both players');
      return;
    }

    if (player1Id === player2Id) {
      alert('Please select different players');
      return;
    }

    setLoading(true);
    try {
      const response = await featuresAPI.comparePlayers(player1Id, player2Id);
      setComparison(response.data.data);
    } catch (error) {
      console.error('Failed to compare players:', error);
      alert('Failed to compare players');
    } finally {
      setLoading(false);
    }
  };

  // Fetch players on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/players" className="text-sm text-blue-600 hover:underline">
          ← Back to Players
        </Link>
        <h1 className="text-3xl font-bold mt-2">⚖️ Player Comparison</h1>
        <p className="text-gray-600 mt-1">Compare two players side-by-side</p>
      </div>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Players to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player 1</label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingPlayers}
              >
                <option value="">Select Player 1</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player 2</label>
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingPlayers}
              >
                <option value="">Select Player 2</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={comparePlayersHandler}
                disabled={!player1Id || !player2Id || loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Comparing...' : 'Compare'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Player Names */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
              <CardContent className="pt-6 text-center">
                <h2 className="text-2xl font-bold text-blue-900">{comparison.player1.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{comparison.player1.role}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300">
              <CardContent className="pt-6 text-center">
                <h2 className="text-2xl font-bold text-red-900">{comparison.player2.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{comparison.player2.role}</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Statistical Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statistic</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                        {comparison.player1.name}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-red-600">
                        {comparison.player2.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Matches Played</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.matches}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.matches}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">Total Runs</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold text-blue-600">
                        {comparison.player1.stats.runs}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold text-red-600">
                        {comparison.player2.stats.runs}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Batting Average</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.battingAverage?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.battingAverage?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">Strike Rate</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.strikeRate?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.strikeRate?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Highest Score</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.highestScore}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.highestScore}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">Fifties</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.fifties}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.fifties}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Hundreds</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.hundreds}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.hundreds}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">Total Wickets</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold text-blue-600">
                        {comparison.player1.stats.wickets}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold text-red-600">
                        {comparison.player2.stats.wickets}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">Bowling Average</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.bowlingAverage?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.bowlingAverage?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">Economy Rate</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.economyRate?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.economyRate?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium">5 Wicket Hauls</td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player1.stats.fiveWickets}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-semibold">
                        {comparison.player2.stats.fiveWickets}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Based on the statistics above, you can analyze which player performs better in various aspects
                of the game. Consider batting averages, strike rates, and bowling figures to make informed
                decisions for team selection or fantasy cricket.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Comparison Yet */}
      {!comparison && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Select two players above to compare their statistics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
