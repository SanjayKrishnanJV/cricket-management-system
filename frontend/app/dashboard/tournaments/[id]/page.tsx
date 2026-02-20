'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { tournamentAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [pointsTable, setPointsTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchPointsTable();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}`);
      const data = await response.json();
      setTournament(data.data);
    } catch (error) {
      console.error('Failed to fetch tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsTable = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}/points-table`);
      const data = await response.json();
      setPointsTable(data.data || []);
    } catch (error) {
      console.error('Failed to fetch points table:', error);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tournamentAPI.delete(tournamentId);
      alert('Tournament deleted successfully!');
      router.push('/dashboard/tournaments');
    } catch (error: any) {
      console.error('Failed to delete tournament:', error);
      alert(error.response?.data?.message || 'Failed to delete tournament. Please try again.');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading tournament details...</div>;
  }

  if (!tournament) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Tournament not found</p>
            <Link href="/dashboard/tournaments" className="text-blue-600 hover:underline mt-4 block">
              ← Back to Tournaments
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedMatches = tournament.matches?.filter((m: any) => m.status === 'COMPLETED').length || 0;
  const liveMatches = tournament.matches?.filter((m: any) => m.status === 'LIVE').length || 0;
  const upcomingMatches = tournament.matches?.filter((m: any) => m.status === 'SCHEDULED').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/tournaments" className="text-sm text-blue-600 hover:underline">
          ← Back to Tournaments
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            <p className="text-gray-600 mt-1">
              {tournament.format} • {tournament.type.replace('_', ' ')} • Organized by {tournament.admin?.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/tournaments/${tournamentId}/edit`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ✏️ Edit
            </Link>
            <Link
              href={`/dashboard/tournaments/${tournamentId}/teams`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              👥 Manage Teams
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              🗑️ Delete
            </button>
            <Link
              href={`/dashboard/tournaments/${tournamentId}/awards`}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              🏆 View Awards
            </Link>
          </div>
        </div>
      </div>

      {/* Tournament Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-semibold">{tournament.format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-semibold">{tournament.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teams:</span>
              <span className="font-semibold">{tournament.teams?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prize Pool:</span>
              <span className="font-semibold text-green-600">
                ₹{((tournament.prizePool || 0) / 100000).toFixed(2)}L
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Matches:</span>
              <span className="font-semibold">{tournament.matches?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">{completedMatches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Live:</span>
              <span className="font-semibold text-red-600">{liveMatches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upcoming:</span>
              <span className="font-semibold text-blue-600">{upcomingMatches}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Overs/Match:</span>
              <span className="font-semibold">{tournament.oversPerMatch || 20}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Powerplay:</span>
              <span className="font-semibold">{tournament.powerplayOvers || 6} overs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Min Players:</span>
              <span className="font-semibold">{tournament.minPlayersPerTeam || 11}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Players:</span>
              <span className="font-semibold">{tournament.maxPlayersPerTeam || 15}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-semibold">
                {new Date(tournament.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Date:</span>
              <span className="font-semibold">
                {new Date(tournament.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">
                {Math.ceil(
                  (new Date(tournament.endDate).getTime() - new Date(tournament.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-semibold ${
                  tournament.status === 'COMPLETED'
                    ? 'text-green-600'
                    : tournament.status === 'ONGOING'
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {tournament.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Organizer:</span>
              <span className="font-semibold">{tournament.admin?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact:</span>
              <span className="font-semibold text-sm">{tournament.admin?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-semibold text-sm">
                {new Date(tournament.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Rules */}
      {tournament.rules && (
        <Card>
          <CardHeader>
            <CardTitle>Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{tournament.rules}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Table */}
      {pointsTable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Points Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Pos</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Team</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">P</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">W</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">L</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">NR</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Pts</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">NRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pointsTable.map((entry: any, index: number) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-bold">{index + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium">
                        <Link
                          href={`/dashboard/teams/${entry.teamId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {entry.team?.name || 'Unknown Team'}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">{entry.played}</td>
                      <td className="px-4 py-2 text-center text-sm text-green-600 font-semibold">
                        {entry.won}
                      </td>
                      <td className="px-4 py-2 text-center text-sm text-red-600">{entry.lost}</td>
                      <td className="px-4 py-2 text-center text-sm">{entry.noResult}</td>
                      <td className="px-4 py-2 text-center text-sm font-bold text-blue-600">
                        {entry.points}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        {entry.netRunRate > 0 ? '+' : ''}
                        {entry.netRunRate.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>P = Played, W = Won, L = Lost, NR = No Result, Pts = Points, NRR = Net Run Rate</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participating Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Participating Teams ({tournament.teams?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournament.teams?.map((tournamentTeam: any) => (
              <Link
                key={tournamentTeam.id}
                href={`/dashboard/teams/${tournamentTeam.team.id}`}
                className="p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tournamentTeam.team.primaryColor || '#3B82F6' }}
                  >
                    {tournamentTeam.team.shortName}
                  </div>
                  <div>
                    <p className="font-semibold">{tournamentTeam.team.name}</p>
                    <p className="text-sm text-gray-600">
                      {tournamentTeam.team.contracts?.length || 0} players
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {tournament.teams?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No teams registered yet</div>
          )}
        </CardContent>
      </Card>

      {/* Matches Schedule */}
      {tournament.matches && tournament.matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matches Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Match</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Venue</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tournament.matches.map((match: any, index: number) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {new Date(match.matchDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{match.homeTeam?.shortName}</span>
                          <span className="text-gray-400">vs</span>
                          <span>{match.awayTeam?.shortName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">{match.venue}</td>
                      <td className="px-4 py-2 text-center text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            match.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : match.status === 'LIVE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {match.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{match.result || '-'}</td>
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

      {/* Tournament Description */}
      {tournament.description && (
        <Card>
          <CardHeader>
            <CardTitle>About Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{tournament.description}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Tournament"
        message={`Are you sure you want to delete ${tournament.name}? This action cannot be undone and will remove all associated matches, points table, and records.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
      />
    </div>
  );
}
