'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { matchAPI, tournamentAPI, teamAPI } from '@/lib/api';

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [match, setMatch] = useState<any>(null);
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
    if (matchId) {
      fetchData();
    }
  }, [matchId]);

  const fetchData = async () => {
    try {
      const [matchRes, tournamentsRes, teamsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/matches/${matchId}`),
        tournamentAPI.getAll(),
        teamAPI.getAll(),
      ]);

      const matchData = await matchRes.json();
      const match = matchData.data;

      // Check if match is scheduled
      if (match.status !== 'SCHEDULED') {
        setError('Only scheduled matches can be edited');
        setLoadingData(false);
        return;
      }

      setMatch(match);
      setTournaments(tournamentsRes.data.data || []);
      setTeams(teamsRes.data.data || []);

      // Convert UTC date to local datetime-local format
      let localDateTime = '';
      if (match.matchDate) {
        const date = new Date(match.matchDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      // Pre-populate form with existing data
      setFormData({
        tournamentId: match.tournamentId || '',
        homeTeamId: match.homeTeamId || '',
        awayTeamId: match.awayTeamId || '',
        venue: match.venue || '',
        matchDate: localDateTime,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load match details');
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
      // Convert datetime-local to ISO string preserving local timezone
      const submitData = {
        ...formData,
        matchDate: new Date(formData.matchDate).toISOString(),
      };

      await matchAPI.update(matchId, submitData);
      alert('Match updated successfully!');
      router.push(`/dashboard/matches/${matchId}`);
    } catch (err: any) {
      console.error('Failed to update match:', err);
      setError(err.response?.data?.message || 'Failed to update match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-8">Loading match details...</div>;
  }

  if (error && !match) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/dashboard/matches" className="text-blue-600 hover:underline">
              ← Back to Matches
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Link href={`/dashboard/matches/${matchId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Match
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Match</h1>
        <p className="text-gray-600 mt-1">Update match details</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament *
              </label>
              <select
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Match'}
              </button>
              <Link
                href={`/dashboard/matches/${matchId}`}
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
