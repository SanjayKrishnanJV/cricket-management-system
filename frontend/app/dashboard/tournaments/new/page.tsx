'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { tournamentAPI } from '@/lib/api';

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    format: 'T20',
    type: 'LEAGUE',
    startDate: '',
    endDate: '',
    prizePool: 1000000,
    description: '',
    numberOfTeams: 4,
    autoScheduleMatches: true,
    oversPerMatch: 20,
    powerplayOvers: 6,
    maxPlayersPerTeam: 15,
    minPlayersPerTeam: 11,
    rules: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const numericFields = ['prizePool', 'oversPerMatch', 'powerplayOvers', 'maxPlayersPerTeam', 'minPlayersPerTeam', 'numberOfTeams'];

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : numericFields.includes(name) ? Number(value) : value,
    }));

    // Auto-update default values when format changes
    if (name === 'format') {
      if (value === 'T20') {
        setFormData(prev => ({ ...prev, format: value, oversPerMatch: 20, powerplayOvers: 6 }));
      } else if (value === 'ODI') {
        setFormData(prev => ({ ...prev, format: value, oversPerMatch: 50, powerplayOvers: 10 }));
      } else if (value === 'TEST') {
        setFormData(prev => ({ ...prev, format: value, oversPerMatch: 90, powerplayOvers: 0 }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        prizePool: formData.prizePool || undefined,
        description: formData.description || undefined,
        rules: formData.rules || undefined,
      };
      await tournamentAPI.create(submitData);
      alert('Tournament created successfully!');
      router.push('/dashboard/tournaments');
    } catch (err: any) {
      console.error('Failed to create tournament:', err);
      setError(err.response?.data?.message || 'Failed to create tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Link href="/dashboard/tournaments" className="text-sm text-blue-600 hover:underline">
          ← Back to Tournaments
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create New Tournament</h1>
        <p className="text-gray-600 mt-1">Set up a new cricket tournament</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Details</CardTitle>
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
                Tournament Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Indian Premier League 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format *
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI (One Day)</option>
                  <option value="TEST">Test Match</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LEAGUE">League</option>
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="LEAGUE_KNOCKOUT">League + Knockout</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Teams *
                </label>
                <input
                  type="number"
                  name="numberOfTeams"
                  value={formData.numberOfTeams}
                  onChange={handleChange}
                  required
                  min={2}
                  max={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Each team will play all others once
                </p>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoScheduleMatches"
                    checked={formData.autoScheduleMatches}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Auto-schedule matches after teams are added
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Pool (₹) (Optional)
              </label>
              <input
                type="number"
                name="prizePool"
                value={formData.prizePool}
                onChange={handleChange}
                min={0}
                step={100000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                ₹{(formData.prizePool / 10000000).toFixed(2)} Crore
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the tournament..."
              />
            </div>

            {/* Custom Tournament Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Custom Tournament Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overs Per Match *
                  </label>
                  <input
                    type="number"
                    name="oversPerMatch"
                    value={formData.oversPerMatch}
                    onChange={handleChange}
                    required
                    min={1}
                    max={90}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.format === 'T20' ? 'Default: 20 overs' : formData.format === 'ODI' ? 'Default: 50 overs' : 'Default: 90 overs'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Powerplay Overs *
                  </label>
                  <input
                    type="number"
                    name="powerplayOvers"
                    value={formData.powerplayOvers}
                    onChange={handleChange}
                    required
                    min={0}
                    max={formData.oversPerMatch}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    First {formData.powerplayOvers} overs with fielding restrictions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Players Per Team *
                  </label>
                  <input
                    type="number"
                    name="minPlayersPerTeam"
                    value={formData.minPlayersPerTeam}
                    onChange={handleChange}
                    required
                    min={1}
                    max={formData.maxPlayersPerTeam}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum squad size required
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Players Per Team *
                  </label>
                  <input
                    type="number"
                    name="maxPlayersPerTeam"
                    value={formData.maxPlayersPerTeam}
                    onChange={handleChange}
                    required
                    min={formData.minPlayersPerTeam}
                    max={25}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum squad size allowed
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Rules (Optional)
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Super Over in case of tie, DLS method for rain-affected matches, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify any special tournament rules or regulations
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
              <Link
                href="/dashboard/tournaments"
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
