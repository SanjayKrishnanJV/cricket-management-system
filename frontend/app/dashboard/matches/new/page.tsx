'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { matchAPI, tournamentAPI, teamAPI } from '@/lib/api';

export default function NewMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tournamentId: '',
    homeTeamId: '',
    awayTeamId: '',
    venue: '',
    matchDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsRes, teamsRes] = await Promise.all([
        tournamentAPI.getAll(),
        teamAPI.getAll(),
      ]);
      setTournaments(tournamentsRes.data.data || []);
      setTeams(teamsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load tournaments and teams');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.homeTeamId === formData.awayTeamId) {
      setError('Home team and away team cannot be the same');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await matchAPI.create(formData);
      alert('Match created successfully!');
      router.push('/dashboard/matches');
    } catch (err: any) {
      console.error('Failed to create match:', err);
      setError(err.response?.data?.message || 'Failed to create match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-8">Loading tournaments and teams...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Link href="/dashboard/matches" className="text-sm text-blue-600 hover:underline">
          ← Back to Matches
        </Link>
        <h1 className="text-3xl font-bold mt-2">Schedule New Match</h1>
        <p className="text-gray-600 mt-1">Create a new cricket match</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {tournaments.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                No tournaments found. Please <Link href="/dashboard/tournaments/new" className="underline font-semibold">create a tournament</Link> first.
              </div>
            )}

            {teams.length < 2 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                You need at least 2 teams. Please <Link href="/dashboard/teams/new" className="underline font-semibold">create teams</Link> first.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament *
              </label>
              <select
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleChange}
                required
                disabled={tournaments.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.format})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Team *
              </label>
              <select
                name="homeTeamId"
                value={formData.homeTeamId}
                onChange={handleChange}
                required
                disabled={teams.length < 2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Away Team *
              </label>
              <select
                name="awayTeamId"
                value={formData.awayTeamId}
                onChange={handleChange}
                required
                disabled={teams.length < 2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option
                    key={team.id}
                    value={team.id}
                    disabled={team.id === formData.homeTeamId}
                  >
                    {team.name} ({team.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
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
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || tournaments.length === 0 || teams.length < 2}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Schedule Match'}
              </button>
              <Link
                href="/dashboard/matches"
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
