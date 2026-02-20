'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { featuresAPI } from '@/lib/api';

export default function TournamentAwardsPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [awards, setAwards] = useState<any>(null);

  useEffect(() => {
    if (tournamentId) {
      fetchAwards();
    }
  }, [tournamentId]);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const response = await featuresAPI.getTournamentAwards(tournamentId);
      setAwards(response.data.data);
    } catch (error) {
      console.error('Failed to fetch awards:', error);
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
            <p className="text-gray-600">Loading tournament awards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!awards) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No awards data available</p>
            <Link href={`/dashboard/tournaments/${tournamentId}`} className="text-blue-600 hover:underline mt-4 block">
              ← Back to Tournament
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
        <Link href={`/dashboard/tournaments/${tournamentId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Tournament
        </Link>
        <h1 className="text-3xl font-bold mt-2">🏆 Tournament Awards</h1>
        <p className="text-gray-600 mt-1">{awards.tournamentName}</p>
      </div>

      {/* Champion */}
      {awards.champion && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              <span>Tournament Champion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {awards.champion.logoUrl && (
                <img
                  src={awards.champion.logoUrl}
                  alt={awards.champion.teamName}
                  className="w-24 h-24 object-contain"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold text-yellow-900 mb-2">
                  {awards.champion.teamName}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Played</p>
                    <p className="text-xl font-semibold">{awards.champion.played}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Won</p>
                    <p className="text-xl font-semibold text-green-600">{awards.champion.won}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points</p>
                    <p className="text-xl font-semibold text-blue-600">{awards.champion.points}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">NRR</p>
                    <p className="text-xl font-semibold">{awards.champion.netRunRate.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orange Cap */}
        {awards.awards.orangeCap && (
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧡</span>
                <span>Orange Cap (Most Runs)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {awards.awards.orangeCap.imageUrl && (
                  <img
                    src={awards.awards.orangeCap.imageUrl}
                    alt={awards.awards.orangeCap.playerName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-orange-400"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-orange-900">
                    {awards.awards.orangeCap.playerName}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Runs</p>
                  <p className="text-2xl font-bold text-orange-600">{awards.awards.orangeCap.runs}</p>
                </div>
                <div>
                  <p className="text-gray-600">Matches</p>
                  <p className="text-2xl font-bold">{awards.awards.orangeCap.matches}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average</p>
                  <p className="text-xl font-semibold">{awards.awards.orangeCap.average}</p>
                </div>
                <div>
                  <p className="text-gray-600">Highest Score</p>
                  <p className="text-xl font-semibold">{awards.awards.orangeCap.highestScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purple Cap */}
        {awards.awards.purpleCap && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💜</span>
                <span>Purple Cap (Most Wickets)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {awards.awards.purpleCap.imageUrl && (
                  <img
                    src={awards.awards.purpleCap.imageUrl}
                    alt={awards.awards.purpleCap.playerName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-purple-400"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">
                    {awards.awards.purpleCap.playerName}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Wickets</p>
                  <p className="text-2xl font-bold text-purple-600">{awards.awards.purpleCap.wickets}</p>
                </div>
                <div>
                  <p className="text-gray-600">Matches</p>
                  <p className="text-2xl font-bold">{awards.awards.purpleCap.matches}</p>
                </div>
                <div>
                  <p className="text-gray-600">Average</p>
                  <p className="text-xl font-semibold">{awards.awards.purpleCap.average}</p>
                </div>
                <div>
                  <p className="text-gray-600">Best Figures</p>
                  <p className="text-xl font-semibold">{awards.awards.purpleCap.bestFigures}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Most Sixes */}
        {awards.awards.mostSixes && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🚀</span>
                <span>Most Sixes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-1">{awards.awards.mostSixes.playerName}</p>
              <p className="text-3xl font-bold text-blue-600">{awards.awards.mostSixes.sixes} Sixes</p>
            </CardContent>
          </Card>
        )}

        {/* Most Fours */}
        {awards.awards.mostFours && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>✨</span>
                <span>Most Fours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-1">{awards.awards.mostFours.playerName}</p>
              <p className="text-3xl font-bold text-green-600">{awards.awards.mostFours.fours} Fours</p>
            </CardContent>
          </Card>
        )}

        {/* Best Strike Rate */}
        {awards.awards.bestStrikeRate && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⚡</span>
                <span>Best Strike Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-1">{awards.awards.bestStrikeRate.playerName}</p>
              <p className="text-3xl font-bold text-yellow-600">{awards.awards.bestStrikeRate.strikeRate}</p>
              <p className="text-sm text-gray-600 mt-2">
                {awards.awards.bestStrikeRate.runs} runs from {awards.awards.bestStrikeRate.balls} balls
              </p>
            </CardContent>
          </Card>
        )}

        {/* Best Economy */}
        {awards.awards.bestEconomy && (
          <Card className="border-2 border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🎯</span>
                <span>Best Economy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-1">{awards.awards.bestEconomy.playerName}</p>
              <p className="text-3xl font-bold text-indigo-600">{awards.awards.bestEconomy.economy}</p>
              <p className="text-sm text-gray-600 mt-2">
                {awards.awards.bestEconomy.wickets} wickets in {awards.awards.bestEconomy.overs} overs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
