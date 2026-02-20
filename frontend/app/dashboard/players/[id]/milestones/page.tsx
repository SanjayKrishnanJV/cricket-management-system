'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { featuresAPI } from '@/lib/api';

export default function PlayerMilestonesPage() {
  const params = useParams();
  const playerId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any>(null);

  useEffect(() => {
    if (playerId) {
      fetchMilestones();
    }
  }, [playerId]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const response = await featuresAPI.getPlayerMilestones(playerId);
      setMilestones(response.data.data);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
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
            <p className="text-gray-600">Loading player milestones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!milestones) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No milestones data available</p>
            <Link href={`/dashboard/players/${playerId}`} className="text-blue-600 hover:underline mt-4 block">
              ← Back to Player
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/dashboard/players/${playerId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Player
        </Link>
        <h1 className="text-3xl font-bold mt-2">🏆 Player Milestones</h1>
        <p className="text-gray-600 mt-1">{milestones.playerName}</p>
      </div>

      {/* Batting Milestones */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Batting Achievements</h2>

        {/* Milestone Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Fifties</p>
                <p className="text-4xl font-bold text-amber-600">{milestones.batting.fifties.count}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Hundreds</p>
                <p className="text-4xl font-bold text-orange-600">{milestones.batting.hundreds.count}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Double Hundreds</p>
                <p className="text-4xl font-bold text-red-600">{milestones.batting.doubleHundreds.count}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                <p className="text-4xl font-bold text-blue-600">{milestones.batting.highestScore}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hundreds Details */}
        {milestones.batting.hundreds.details && milestones.batting.hundreds.details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Century Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Runs</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Balls</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {milestones.batting.hundreds.details.map((hundred: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">
                          {new Date(hundred.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-orange-600">
                          {hundred.runs}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{hundred.balls}</td>
                        <td className="px-4 py-3 text-sm">{hundred.venue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bowling Milestones */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Bowling Achievements</h2>

        {/* Milestone Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">3 Wickets</p>
                <p className="text-4xl font-bold text-green-600">
                  {milestones.bowling.threeWickets.count}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">4 Wickets</p>
                <p className="text-4xl font-bold text-teal-600">
                  {milestones.bowling.fourWickets.count}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">5 Wicket Hauls</p>
                <p className="text-4xl font-bold text-purple-600">
                  {milestones.bowling.fiveWickets.count}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Best Figures</p>
                <p className="text-4xl font-bold text-indigo-600">
                  {milestones.bowling.bestFigures.wickets}/{milestones.bowling.bestFigures.runs}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5 Wicket Haul Details */}
        {milestones.bowling.fiveWickets.details && milestones.bowling.fiveWickets.details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>5 Wicket Haul Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Figures
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overs</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {milestones.bowling.fiveWickets.details.map((haul: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">
                          {new Date(haul.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">
                          {haul.wickets}/{haul.runs}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{haul.overs}</td>
                        <td className="px-4 py-3 text-sm">{haul.venue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Milestones */}
      {milestones.batting.fifties.count === 0 &&
        milestones.batting.hundreds.count === 0 &&
        milestones.bowling.fiveWickets.count === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No major milestones achieved yet. Keep playing!</p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
