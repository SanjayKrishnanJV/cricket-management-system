'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { matchAPI, teamAPI, playerAPI } from '@/lib/api';

export default function QuickMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    venue: '',
    matchDate: '',
    customOvers: 20,
    minPlayers: 11,
  });

  const [homeSquad, setHomeSquad] = useState<any[]>([]);
  const [awaySquad, setAwaySquad] = useState<any[]>([]);
  const [showHomeSquad, setShowHomeSquad] = useState(false);
  const [showAwaySquad, setShowAwaySquad] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchAllPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getAll();
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      const response = await playerAPI.getAll();
      setAllPlayers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const loadTeamSquad = async (teamId: string, isHome: boolean) => {
    try {
      const response = await teamAPI.getSquad(teamId);
      const rawSquadData = response.data.data || response.data;

      let squadData = [];
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

      const playersWithIds = squadData.map((contract: any) => ({
        id: contract.player.id,
        name: contract.player.name,
        role: contract.player.role,
        contractId: contract.id,
      }));

      if (isHome) {
        setHomeSquad(playersWithIds);
        setShowHomeSquad(true);
      } else {
        setAwaySquad(playersWithIds);
        setShowAwaySquad(true);
      }
    } catch (error) {
      console.error('Failed to load team squad:', error);
    }
  };

  const handleTeamChange = (teamId: string, isHome: boolean) => {
    if (isHome) {
      setFormData(prev => ({ ...prev, homeTeamId: teamId }));
      if (teamId) loadTeamSquad(teamId, true);
      else setHomeSquad([]);
    } else {
      setFormData(prev => ({ ...prev, awayTeamId: teamId }));
      if (teamId) loadTeamSquad(teamId, false);
      else setAwaySquad([]);
    }
  };

  const addPlayerToSquad = (player: any, isHome: boolean) => {
    if (isHome) {
      if (!homeSquad.find(p => p.id === player.id)) {
        setHomeSquad([...homeSquad, player]);
      }
    } else {
      if (!awaySquad.find(p => p.id === player.id)) {
        setAwaySquad([...awaySquad, player]);
      }
    }
  };

  const removePlayerFromSquad = (playerId: string, isHome: boolean) => {
    if (isHome) {
      setHomeSquad(homeSquad.filter(p => p.id !== playerId));
    } else {
      setAwaySquad(awaySquad.filter(p => p.id !== playerId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (homeSquad.length < formData.minPlayers) {
      setError(`Home team must have at least ${formData.minPlayers} players`);
      setLoading(false);
      return;
    }

    if (awaySquad.length < formData.minPlayers) {
      setError(`Away team must have at least ${formData.minPlayers} players`);
      setLoading(false);
      return;
    }

    try {
      const matchData = {
        ...formData,
        isQuickMatch: true,
        homeSquad: homeSquad.map(p => p.id),
        awaySquad: awaySquad.map(p => p.id),
      };

      const response = await matchAPI.create(matchData);
      alert('Quick match created successfully!');
      router.push(`/dashboard/matches/${response.data.data.id}`);
    } catch (err: any) {
      console.error('Failed to create quick match:', err);
      setError(err.response?.data?.message || 'Failed to create quick match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <Link href="/dashboard/matches" className="text-sm text-blue-600 hover:underline">
          ← Back to Matches
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create Quick Match</h1>
        <p className="text-gray-600 mt-1">Set up a quick match with custom squads</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Team *
                </label>
                <select
                  value={formData.homeTeamId}
                  onChange={(e) => handleTeamChange(e.target.value, true)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select home team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id} disabled={team.id === formData.awayTeamId}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Away Team *
                </label>
                <select
                  value={formData.awayTeamId}
                  onChange={(e) => handleTeamChange(e.target.value, false)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select away team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id} disabled={team.id === formData.homeTeamId}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Wankhede Stadium, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.matchDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overs Per Side *
                </label>
                <input
                  type="number"
                  value={formData.customOvers}
                  onChange={(e) => setFormData(prev => ({ ...prev, customOvers: parseInt(e.target.value) }))}
                  required
                  min={1}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Common formats: 20 (T20), 50 (ODI)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Players Per Team *
                </label>
                <input
                  type="number"
                  value={formData.minPlayers}
                  onChange={(e) => setFormData(prev => ({ ...prev, minPlayers: parseInt(e.target.value) }))}
                  required
                  min={1}
                  max={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Standard: 11 players per team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Home Team Squad */}
        {formData.homeTeamId && (
          <Card>
            <CardHeader>
              <CardTitle>
                {teams.find(t => t.id === formData.homeTeamId)?.name || 'Home Team'} Squad ({homeSquad.length} players)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {homeSquad.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-xs text-gray-600">({player.role.replace('_', ' ')})</span>
                      <button
                        type="button"
                        onClick={() => removePlayerFromSquad(player.id, true)}
                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Player to Squad
                  </label>
                  <select
                    onChange={(e) => {
                      const player = allPlayers.find(p => p.id === e.target.value);
                      if (player) {
                        addPlayerToSquad({
                          id: player.id,
                          name: player.name,
                          role: player.role,
                        }, true);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a player to add</option>
                    {allPlayers
                      .filter(p => !homeSquad.find(s => s.id === p.id) && !awaySquad.find(s => s.id === p.id))
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.role.replace('_', ' ')}
                        </option>
                      ))}
                  </select>
                </div>

                {homeSquad.length < formData.minPlayers && (
                  <p className="text-sm text-red-600">⚠️ Minimum {formData.minPlayers} players required</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Away Team Squad */}
        {formData.awayTeamId && (
          <Card>
            <CardHeader>
              <CardTitle>
                {teams.find(t => t.id === formData.awayTeamId)?.name || 'Away Team'} Squad ({awaySquad.length} players)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {awaySquad.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-xs text-gray-600">({player.role.replace('_', ' ')})</span>
                      <button
                        type="button"
                        onClick={() => removePlayerFromSquad(player.id, false)}
                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Player to Squad
                  </label>
                  <select
                    onChange={(e) => {
                      const player = allPlayers.find(p => p.id === e.target.value);
                      if (player) {
                        addPlayerToSquad({
                          id: player.id,
                          name: player.name,
                          role: player.role,
                        }, false);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a player to add</option>
                    {allPlayers
                      .filter(p => !awaySquad.find(s => s.id === p.id) && !homeSquad.find(s => s.id === p.id))
                      .map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.role.replace('_', ' ')}
                        </option>
                      ))}
                  </select>
                </div>

                {awaySquad.length < formData.minPlayers && (
                  <p className="text-sm text-red-600">⚠️ Minimum {formData.minPlayers} players required</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !formData.homeTeamId || !formData.awayTeamId || homeSquad.length < formData.minPlayers || awaySquad.length < formData.minPlayers}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Quick Match'}
          </button>
          <Link
            href="/dashboard/matches"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
