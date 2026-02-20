'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { teamAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`);
      const data = await response.json();
      setTeam(data.data);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teamAPI.delete(teamId);
      alert('Team deleted successfully!');
      router.push('/dashboard/teams');
    } catch (error: any) {
      console.error('Failed to delete team:', error);
      alert(error.response?.data?.message || 'Failed to delete team. Please try again.');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading team details...</div>;
  }

  if (!team) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Team not found</p>
            <Link href="/dashboard/teams" className="text-blue-600 hover:underline mt-4 block">
              ← Back to Teams
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Combine home and away matches
  const allMatches = [
    ...(team.homeMatches || []).map((m: any) => ({ ...m, opponent: m.awayTeam, location: 'Home' })),
    ...(team.awayMatches || []).map((m: any) => ({ ...m, opponent: m.homeTeam, location: 'Away' }))
  ].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

  // Group players by role
  const groupedPlayers = {
    BATSMAN: team.contracts?.filter((c: any) => c.player.role === 'BATSMAN') || [],
    BOWLER: team.contracts?.filter((c: any) => c.player.role === 'BOWLER') || [],
    ALL_ROUNDER: team.contracts?.filter((c: any) => c.player.role === 'ALL_ROUNDER') || [],
    WICKETKEEPER: team.contracts?.filter((c: any) => c.player.role === 'WICKETKEEPER') || [],
  };

  const totalSpent = team.contracts?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0;
  const budgetRemaining = team.budget;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/teams" className="text-sm text-blue-600 hover:underline">
          ← Back to Teams
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            {team.logoUrl && (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-600">{team.shortName} • Owned by {team.owner?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/teams/${teamId}/edit`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ✏️ Edit
            </Link>
            <Link
              href={`/dashboard/teams/${teamId}/squad`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              👥 Manage Squad
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Owner:</span>
              <span className="font-semibold">{team.owner?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Captain:</span>
              <span className="font-semibold">
                {team.captain ? (
                  <Link href={`/dashboard/players/${team.captain.id}`} className="text-blue-600 hover:underline">
                    👑 {team.captain.name}
                  </Link>
                ) : (
                  'Not assigned'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vice-Captain:</span>
              <span className="font-semibold">
                {team.viceCaptain ? (
                  <Link href={`/dashboard/players/${team.viceCaptain.id}`} className="text-blue-600 hover:underline">
                    🎖️ {team.viceCaptain.name}
                  </Link>
                ) : (
                  'Not assigned'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Squad Size:</span>
              <span className="font-semibold">{team.contracts?.length || 0} players</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-semibold text-red-600">₹{(totalSpent / 100000).toFixed(2)}L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Remaining:</span>
              <span className="font-semibold text-green-600">₹{(budgetRemaining / 100000).toFixed(2)}L</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget Usage:</span>
                <span className="font-semibold">
                  {((totalSpent / (totalSpent + budgetRemaining)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(totalSpent / (totalSpent + budgetRemaining)) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Matches Played:</span>
              <span className="font-semibold">{team.teamStats?.matchesPlayed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wins:</span>
              <span className="font-semibold text-green-600">{team.teamStats?.wins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Losses:</span>
              <span className="font-semibold text-red-600">{team.teamStats?.losses || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Win Rate:</span>
              <span className="font-semibold">
                {team.teamStats?.matchesPlayed > 0
                  ? ((team.teamStats.wins / team.teamStats.matchesPlayed) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Squad by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Squad ({team.contracts?.length || 0} Players)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Batsmen */}
            {groupedPlayers.BATSMAN.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">Batsmen ({groupedPlayers.BATSMAN.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedPlayers.BATSMAN.map((contract: any) => (
                    <Link
                      key={contract.id}
                      href={`/dashboard/players/${contract.player.id}`}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contract.player.name}</p>
                          <p className="text-sm text-gray-600">{contract.player.nationality}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            ₹{(contract.amount / 100000).toFixed(2)}L
                          </p>
                          <p className="text-xs text-gray-500">Contract value</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bowlers */}
            {groupedPlayers.BOWLER.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-600">Bowlers ({groupedPlayers.BOWLER.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedPlayers.BOWLER.map((contract: any) => (
                    <Link
                      key={contract.id}
                      href={`/dashboard/players/${contract.player.id}`}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contract.player.name}</p>
                          <p className="text-sm text-gray-600">{contract.player.nationality}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            ₹{(contract.amount / 100000).toFixed(2)}L
                          </p>
                          <p className="text-xs text-gray-500">Contract value</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Rounders */}
            {groupedPlayers.ALL_ROUNDER.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">All Rounders ({groupedPlayers.ALL_ROUNDER.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedPlayers.ALL_ROUNDER.map((contract: any) => (
                    <Link
                      key={contract.id}
                      href={`/dashboard/players/${contract.player.id}`}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contract.player.name}</p>
                          <p className="text-sm text-gray-600">{contract.player.nationality}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            ₹{(contract.amount / 100000).toFixed(2)}L
                          </p>
                          <p className="text-xs text-gray-500">Contract value</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Wicketkeepers */}
            {groupedPlayers.WICKETKEEPER.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-orange-600">Wicketkeepers ({groupedPlayers.WICKETKEEPER.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedPlayers.WICKETKEEPER.map((contract: any) => (
                    <Link
                      key={contract.id}
                      href={`/dashboard/players/${contract.player.id}`}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contract.player.name}</p>
                          <p className="text-sm text-gray-600">{contract.player.nationality}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">
                            ₹{(contract.amount / 100000).toFixed(2)}L
                          </p>
                          <p className="text-xs text-gray-500">Contract value</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {team.contracts?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No players in squad yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      {allMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Opponent</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Venue</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allMatches.slice(0, 10).map((match: any) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {new Date(match.matchDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        vs {match.opponent?.name}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          match.location === 'Home'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {match.location}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          match.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'LIVE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {match.result || '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Link
                          href={`/dashboard/matches/${match.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Team"
        message={`Are you sure you want to delete ${team.name}? This action cannot be undone and will remove all associated contracts, players, and match records.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}
