'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { teamAPI, playerAPI } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TeamSquadManagementPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [team, setTeam] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [contractAmount, setContractAmount] = useState('');

  useEffect(() => {
    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  const fetchData = async () => {
    try {
      const [teamRes, squadRes, playersRes] = await Promise.all([
        fetch(`http://localhost:5000/api/teams/${teamId}`),
        teamAPI.getSquad(teamId),
        playerAPI.getAll({ available: true }), // Only fetch players without active contracts
      ]);

      const teamData = await teamRes.json();
      setTeam(teamData.data);

      // The backend returns squad as an object with batsmen, bowlers, allRounders, wicketkeepers
      // We need to flatten this into a single array
      let squadData = [];
      const rawSquadData = squadRes.data.data || squadRes.data;

      if (rawSquadData) {
        // Check if it's the grouped structure
        if (rawSquadData.batsmen || rawSquadData.bowlers || rawSquadData.allRounders || rawSquadData.wicketkeepers) {
          squadData = [
            ...(rawSquadData.batsmen || []),
            ...(rawSquadData.bowlers || []),
            ...(rawSquadData.allRounders || []),
            ...(rawSquadData.wicketkeepers || []),
          ];
        } else if (Array.isArray(rawSquadData)) {
          squadData = rawSquadData;
        }
      }

      setSquad(squadData);

      // Set available players (already filtered by backend to exclude contracted players)
      const availablePlayers = playersRes.data.data || [];
      setAvailablePlayers(availablePlayers);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setSquad([]); // Ensure squad is always an array
      setAvailablePlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayer || !contractAmount) {
      alert('Please select a player and enter contract amount');
      return;
    }

    setAdding(true);
    try {
      // Convert lakhs to actual amount (multiply by 100000)
      const amountInRupees = parseInt(contractAmount) * 100000;
      await teamAPI.addPlayer(teamId, selectedPlayer.id, amountInRupees);
      alert(`${selectedPlayer.name} added to squad successfully!`);
      setShowAddDialog(false);
      setSelectedPlayer(null);
      setContractAmount('');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to add player:', error);
      alert(error.response?.data?.message || 'Failed to add player. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!selectedContract) return;

    setRemoving(true);
    try {
      await teamAPI.removePlayer(teamId, selectedContract.id);
      alert(`${selectedContract.player?.name} removed from squad successfully!`);
      setShowRemoveDialog(false);
      setSelectedContract(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to remove player:', error);
      alert(error.response?.data?.message || 'Failed to remove player. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading squad details...</div>;
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

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/teams/${teamId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Team
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-bold">{team.name} - Squad Management</h1>
            <p className="text-gray-600 mt-1">Add or remove players from your squad</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            ➕ Add Player
          </button>
        </div>
      </div>

      {/* Budget Information */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const totalBudget = team.budget || 0;
            const spentAmount = squad.reduce((sum, contract) => sum + (contract.amount || 0), 0);
            const remainingBudget = totalBudget + spentAmount; // Current budget + spent = original budget
            const spentPercentage = remainingBudget > 0 ? (spentAmount / remainingBudget) * 100 : 0;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{(remainingBudget / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Spent</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{(spentAmount / 10000000).toFixed(2)} Cr
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {spentPercentage.toFixed(1)}% of budget
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(totalBudget / 10000000).toFixed(2)} Cr
                    </p>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Captain and Vice-Captain */}
      {squad.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Leadership</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Captain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Captain
                </label>
                <select
                  value={team.captainId || ''}
                  onChange={async (e) => {
                    try {
                      await teamAPI.setCaptain(teamId, e.target.value || null);
                      alert('Captain set successfully!');
                      fetchData();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to set captain');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Captain</option>
                  {squad.map((contract: any) => (
                    <option key={contract.player.id} value={contract.player.id}>
                      {contract.player.name} - {contract.player.role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {team.captain && (
                  <div className="mt-3 flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <div className="text-3xl">👑</div>
                    <div>
                      <p className="font-semibold text-blue-900">{team.captain.name}</p>
                      <p className="text-sm text-blue-600">{team.captain.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Vice-Captain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vice-Captain
                </label>
                <select
                  value={team.viceCaptainId || ''}
                  onChange={async (e) => {
                    try {
                      await teamAPI.setViceCaptain(teamId, e.target.value || null);
                      alert('Vice-captain set successfully!');
                      fetchData();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to set vice-captain');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Vice-Captain</option>
                  {squad.map((contract: any) => (
                    <option key={contract.player.id} value={contract.player.id}>
                      {contract.player.name} - {contract.player.role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {team.viceCaptain && (
                  <div className="mt-3 flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                    <div className="text-3xl">🎖️</div>
                    <div>
                      <p className="font-semibold text-purple-900">{team.viceCaptain.name}</p>
                      <p className="text-sm text-purple-600">{team.viceCaptain.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Squad */}
      <Card>
        <CardHeader>
          <CardTitle>Current Squad ({squad.length} players)</CardTitle>
        </CardHeader>
        <CardContent>
          {squad.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No players in squad yet. Click "Add Player" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Player</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Age</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Nationality</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Contract Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {squad.map((contract: any) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/players/${contract.player?.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contract.player?.name}
                          </Link>
                          {team.captainId === contract.player?.id && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded" title="Captain">
                              👑 C
                            </span>
                          )}
                          {team.viceCaptainId === contract.player?.id && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded" title="Vice-Captain">
                              🎖️ VC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">{contract.player?.role.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-center text-sm">{contract.player?.age}</td>
                      <td className="px-4 py-2 text-center text-sm">{contract.player?.nationality}</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">
                        ₹{((contract.amount || 0) / 100000).toFixed(2)}L
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowRemoveDialog(true);
                          }}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Player Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Player to Squad</h3>

            {availablePlayers.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
                No players available. All players are either already contracted to teams or no players exist in the system.
                <Link href="/dashboard/players/new" className="block mt-2 text-blue-600 hover:underline font-semibold">
                  Create a new player →
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Player * ({availablePlayers.length} available)
                </label>
                <select
                  value={selectedPlayer?.id || ''}
                  onChange={(e) => {
                    const player = availablePlayers.find(p => p.id === e.target.value);
                    setSelectedPlayer(player);
                  }}
                  disabled={availablePlayers.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a player</option>
                  {availablePlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} - {player.role.replace('_', ' ')} ({player.nationality})
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Base Price Info */}
              {selectedPlayer && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Selected Player Base Price</p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{((selectedPlayer.basePrice || 0) / 100000).toFixed(2)}L
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Contract amount must be at least the base price
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Amount (in Lakhs) *
                </label>
                <input
                  type="number"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                  placeholder="e.g., 50 for ₹50L"
                  min={selectedPlayer ? (selectedPlayer.basePrice / 100000).toFixed(2) : 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {contractAmount && (
                  <>
                    <p className="text-sm text-gray-500 mt-1">
                      = ₹{(parseInt(contractAmount) * 100000).toLocaleString()}
                    </p>
                    {(() => {
                      const amountInRupees = parseInt(contractAmount) * 100000;
                      const remainingBudget = team.budget || 0;
                      const basePrice = selectedPlayer?.basePrice || 0;

                      // Check if below base price
                      if (amountInRupees < basePrice) {
                        return (
                          <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            ⚠️ Contract amount cannot be below base price of ₹{(basePrice / 100000).toFixed(2)}L
                          </div>
                        );
                      }

                      // Check if exceeds budget
                      if (amountInRupees > remainingBudget) {
                        return (
                          <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                            ⚠️ Insufficient budget! You only have ₹{(remainingBudget / 10000000).toFixed(2)} Cr remaining.
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>

              {/* Budget Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Budget Available</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{((team.budget || 0) / 10000000).toFixed(2)} Cr
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedPlayer(null);
                  setContractAmount('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayer}
                disabled={
                  adding ||
                  !selectedPlayer ||
                  !contractAmount ||
                  (parseInt(contractAmount) * 100000) > (team.budget || 0) ||
                  (parseInt(contractAmount) * 100000) < (selectedPlayer?.basePrice || 0)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Player Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        title="Remove Player from Squad"
        message={`Are you sure you want to remove ${selectedContract?.player?.name} from the squad? The contract amount of ₹${((selectedContract?.amount || 0) / 100000).toFixed(2)}L will be released.`}
        confirmText={removing ? 'Removing...' : 'Remove'}
        onConfirm={handleRemovePlayer}
        onCancel={() => {
          setShowRemoveDialog(false);
          setSelectedContract(null);
        }}
        type="danger"
      />
    </div>
  );
}
