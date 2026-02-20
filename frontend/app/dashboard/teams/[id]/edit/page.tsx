'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { teamAPI, userAPI } from '@/lib/api';

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logoUrl: '',
    primaryColor: '#3B82F6',
    budget: 10000000,
    ownerId: '',
  });

  useEffect(() => {
    fetchTeam();
    fetchUsers();
  }, [teamId]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      const allUsers = response.data.data || [];
      // Filter to only show users with TEAM_OWNER role
      const eligibleUsers = allUsers.filter((u: any) => u.role === 'TEAM_OWNER');
      setUsers(eligibleUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTeam = async () => {
    try {
      const response = await teamAPI.getById(teamId);
      const team = response.data.data;
      setFormData({
        name: team.name,
        shortName: team.shortName,
        logoUrl: team.logoUrl || '',
        primaryColor: team.primaryColor || '#3B82F6',
        budget: team.budget,
        ownerId: team.ownerId || '',
      });
    } catch (err) {
      console.error('Failed to fetch team:', err);
      setError('Failed to load team data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        logoUrl: formData.logoUrl || undefined,
      };
      await teamAPI.update(teamId, submitData);
      alert('Team updated successfully!');
      router.push(`/dashboard/teams/${teamId}`);
    } catch (err: any) {
      console.error('Failed to update team:', err);
      setError(err.response?.data?.message || 'Failed to update team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-8">Loading team data...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <Link href={`/dashboard/teams/${teamId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Team
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Team</h1>
        <p className="text-gray-600 mt-1">Update team information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
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
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mumbai Indians"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Name *
              </label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MI"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum 5 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Owner *
              </label>
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select team owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Owner will manage the team and participate in auctions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color *
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₹) *
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min={0}
                step={100000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                ₹{(formData.budget / 10000000).toFixed(2)} Crore
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/team-logo.png"
              />
              {formData.logoUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                  <img
                    src={formData.logoUrl}
                    alt="Team logo preview"
                    className="w-24 h-24 object-contain border border-gray-300 rounded-lg bg-gray-50"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Invalid image URL';
                      e.currentTarget.className = 'w-24 h-24 flex items-center justify-center border border-red-300 rounded-lg bg-red-50 text-red-600 text-xs';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Team'}
              </button>
              <Link
                href={`/dashboard/teams/${teamId}`}
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
