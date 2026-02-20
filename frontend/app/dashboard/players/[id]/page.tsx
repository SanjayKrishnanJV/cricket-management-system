'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { playerAPI, fanClubAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FanClubCard } from '@/components/social/FanClubCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InjuryRiskCard } from '@/components/ai/InjuryRiskCard';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fanClubs, setFanClubs] = useState<any[]>([]);
  const [showCreateFanClub, setShowCreateFanClub] = useState(false);
  const [fanClubName, setFanClubName] = useState('');
  const [fanClubDescription, setFanClubDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
      fetchAnalytics();
      fetchFanClubs();
    }
  }, [playerId]);

  const fetchPlayer = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/players/${playerId}`);
      const data = await response.json();
      setPlayer(data.data);
    } catch (error) {
      console.error('Failed to fetch player:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/player/${playerId}`);
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchFanClubs = async () => {
    try {
      const response = await fanClubAPI.getByPlayer(playerId);
      setFanClubs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch fan clubs:', error);
      setFanClubs([]);
    }
  };

  const handleCreateFanClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanClubName.trim()) {
      alert('Please enter a fan club name');
      return;
    }

    setCreating(true);
    try {
      await fanClubAPI.create({
        playerId,
        name: fanClubName,
        description: fanClubDescription || undefined,
      });
      alert('Fan club created successfully!');
      setFanClubName('');
      setFanClubDescription('');
      setShowCreateFanClub(false);
      fetchFanClubs();
    } catch (error: any) {
      console.error('Failed to create fan club:', error);
      alert(error.response?.data?.message || 'Failed to create fan club');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await playerAPI.delete(playerId);
      alert('Player deleted successfully!');
      router.push('/dashboard/players');
    } catch (error: any) {
      console.error('Failed to delete player:', error);
      alert(error.response?.data?.message || 'Failed to delete player. Please try again.');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading player details...</div>;
  }

  if (!player) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Player not found</p>
            <Link href="/dashboard/players" className="text-blue-600 hover:underline mt-4 block">
              ← Back to Players
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/players" className="text-sm text-blue-600 hover:underline">
          ← Back to Players
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="text-gray-600 mt-1">{player.nationality} • {player.role.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/players/${playerId}/edit`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              🗑️ Delete
            </button>
            <Link
              href={`/dashboard/players/${playerId}/milestones`}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              🏆 View Milestones
            </Link>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-semibold">{player.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-semibold">{player.role.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nationality:</span>
              <span className="font-semibold">{player.nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Matches:</span>
              <span className="font-semibold">{player.totalMatches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-semibold">₹{(player.basePrice / 100000).toFixed(2)}L</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batting Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Runs:</span>
              <span className="font-semibold">{player.totalRuns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-semibold">{player.battingAverage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strike Rate:</span>
              <span className="font-semibold">{player.strikeRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest Score:</span>
              <span className="font-semibold">{player.highestScore}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bowling Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Wickets:</span>
              <span className="font-semibold">{player.totalWickets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average:</span>
              <span className="font-semibold">
                {player.bowlingAverage > 0 ? player.bowlingAverage.toFixed(2) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Economy:</span>
              <span className="font-semibold">
                {player.economyRate > 0 ? player.economyRate.toFixed(2) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Figures:</span>
              <span className="font-semibold">{player.bestBowlingFigures || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.battingByMatch && analytics.battingByMatch.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Recent Batting</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Runs</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Balls</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.battingByMatch.slice(0, 5).map((match: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{new Date(match.matchDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-center text-sm font-semibold">{match.runs}</td>
                          <td className="px-4 py-2 text-center text-sm">{match.balls}</td>
                          <td className="px-4 py-2 text-center text-sm">{match.strikeRate.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {analytics.bowlingByMatch && analytics.bowlingByMatch.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Recent Bowling</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Overs</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Wickets</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Runs</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.bowlingByMatch.slice(0, 5).map((match: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{new Date(match.matchDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-center text-sm">{match.overs}</td>
                          <td className="px-4 py-2 text-center text-sm font-semibold">{match.wickets}</td>
                          <td className="px-4 py-2 text-center text-sm">{match.runs}</td>
                          <td className="px-4 py-2 text-center text-sm">{match.economyRate.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Injury Risk Assessment */}
      <div className="mt-8 border-t-2 border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-4">🤖 AI Insights</h2>
        <InjuryRiskCard playerId={playerId} playerName={player.name} />
      </div>

      {/* Fan Clubs Section */}
      <div className="mt-8 border-t-2 border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">👥 Fan Clubs</h2>
          <Button
            variant="primary"
            onClick={() => setShowCreateFanClub(!showCreateFanClub)}
          >
            {showCreateFanClub ? 'Cancel' : '+ Create Fan Club'}
          </Button>
        </div>

        {/* Create Fan Club Form */}
        {showCreateFanClub && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Fan Club</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFanClub} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fan Club Name *
                  </label>
                  <Input
                    type="text"
                    value={fanClubName}
                    onChange={(e) => setFanClubName(e.target.value)}
                    placeholder={`e.g., ${player.name} Fans United`}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={fanClubDescription}
                    onChange={(e) => setFanClubDescription(e.target.value)}
                    placeholder="Describe your fan club..."
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2"
                    rows={3}
                  />
                </div>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Fan Club'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fan Clubs List */}
        {fanClubs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                No fan clubs yet. Be the first to create one for {player.name}!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fanClubs.map((fanClub) => (
              <FanClubCard
                key={fanClub.id}
                fanClub={fanClub}
                onJoin={fetchFanClubs}
                onLeave={fetchFanClubs}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Player"
        message={`Are you sure you want to delete ${player.name}? This action cannot be undone and will remove all associated statistics and records.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}
