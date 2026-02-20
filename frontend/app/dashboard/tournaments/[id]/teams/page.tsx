'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { tournamentAPI, teamAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TournamentTeamsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [generatingFixtures, setGeneratingFixtures] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    }
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      const [tournamentRes, allTeamsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/tournaments/${tournamentId}`),
        teamAPI.getAll(),
      ]);

      const tournamentData = await tournamentRes.json();
      const tournament = tournamentData.data;
      setTournament(tournament);

      // Get registered teams
      const registered = tournament.teams || [];
      setRegisteredTeams(registered);

      // Filter out teams already registered
      const allTeams = allTeamsRes.data.data || [];
      const registeredTeamIds = registered.map((tt: any) => tt.team.id);
      setAvailableTeams(allTeams.filter((t: any) => !registeredTeamIds.includes(t.id)));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeam) {
      alert('Please select a team');
      return;
    }

    setAdding(true);
    try {
      await tournamentAPI.addTeam(tournamentId, selectedTeam.id);
      alert(`${selectedTeam.name} added to tournament successfully!`);
      setShowAddDialog(false);
      setSelectedTeam(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to add team:', error);
      alert(error.response?.data?.message || 'Failed to add team. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (registeredTeams.length < 2) {
      alert('You need at least 2 teams to generate fixtures');
      return;
    }

    if (!confirm(`This will generate ${tournament.type === 'ROUND_ROBIN' ? 'round-robin' : 'knockout'} fixtures for all ${registeredTeams.length} teams. Continue?`)) {
      return;
    }

    setGeneratingFixtures(true);
    try {
      await tournamentAPI.generateFixtures(tournamentId);
      alert('Fixtures generated successfully!');
      router.push(`/dashboard/tournaments/${tournamentId}`);
    } catch (error: any) {
      console.error('Failed to generate fixtures:', error);
      alert(error.response?.data?.message || 'Failed to generate fixtures. Please try again.');
    } finally {
      setGeneratingFixtures(false);
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

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/tournaments/${tournamentId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Tournament
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold">{tournament.name} - Team Management</h1>
            <p className="text-gray-600 mt-1">Add teams and generate fixtures for the tournament</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              ➕ Add Team
            </button>
            <button
              onClick={handleGenerateFixtures}
              disabled={generatingFixtures || registeredTeams.length < 2}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generatingFixtures ? '⏳ Generating...' : '🗓️ Generate Fixtures'}
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Format:</span>
            <span className="font-semibold">{tournament.format}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-semibold">{tournament.type.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Registered Teams:</span>
            <span className="font-semibold">{registeredTeams.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Matches Scheduled:</span>
            <span className="font-semibold">{tournament.matches?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Registered Teams */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Teams ({registeredTeams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {registeredTeams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No teams registered yet. Click "Add Team" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredTeams.map((tournamentTeam: any) => (
                <div
                  key={tournamentTeam.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: tournamentTeam.team.primaryColor || '#3B82F6' }}
                    >
                      {tournamentTeam.team.shortName}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/teams/${tournamentTeam.team.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {tournamentTeam.team.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {tournamentTeam.team.contracts?.length || 0} players
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Teams */}
      {availableTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Teams ({availableTeams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTeams.map((team: any) => (
                <div
                  key={team.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowAddDialog(true);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.primaryColor || '#3B82F6' }}
                    >
                      {team.shortName}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-gray-600">
                        {team.contracts?.length || 0} players
                      </p>
                    </div>
                    <button className="text-green-600 hover:text-green-800 font-medium text-sm">
                      Add →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Team Confirmation Dialog */}
      {showAddDialog && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Team to Tournament</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedTeam.primaryColor || '#3B82F6' }}
                >
                  {selectedTeam.shortName}
                </div>
                <div>
                  <p className="font-semibold">{selectedTeam.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTeam.contracts?.length || 0} players in squad
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to add <strong>{selectedTeam.name}</strong> to{' '}
              <strong>{tournament.name}</strong>?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedTeam(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeam}
                disabled={adding}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
