'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { userAPI, roleAPI } from '@/lib/api';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');
  const [addingRole, setAddingRole] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchUserRoles();
    fetchAllRoles();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await userAPI.getById(userId);
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      alert('Failed to load user details');
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await roleAPI.getUserRoles(userId);
      setUserRoles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const response = await roleAPI.getAll();
      setAllRoles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleAddRole = async () => {
    if (!selectedRoleToAdd) {
      alert('Please select a role to add');
      return;
    }

    setAddingRole(true);
    try {
      await roleAPI.assignToUser(userId, selectedRoleToAdd);
      alert('Role assigned successfully!');
      setShowAddRoleModal(false);
      setSelectedRoleToAdd('');
      fetchUserRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign role');
    } finally {
      setAddingRole(false);
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to remove role "${roleName}" from this user?`)) {
      return;
    }

    try {
      await roleAPI.removeFromUser(userId, roleId);
      alert('Role removed successfully!');
      fetchUserRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove role');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to delete user "${user?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await userAPI.delete(userId);
      alert('User deleted successfully!');
      router.push('/dashboard/users');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TOURNAMENT_ADMIN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TEAM_OWNER':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'SCORER':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  if (loading) {
    return <div className="p-8">Loading user details...</div>;
  }

  if (!user) {
    return <div className="p-8">User not found</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/dashboard/users" className="text-sm text-blue-600 hover:underline">
          ← Back to Users
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <div className="flex gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/users/${userId}/edit`}>
              <Button variant="primary">Edit User</Button>
            </Link>
            <Button variant="outline" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </div>
        </div>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg font-semibold mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-lg mt-1">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-500">Primary Role</label>
              <p className="text-lg font-semibold mt-1">{user.role.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-lg mt-1">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {user.updatedAt && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-lg mt-1">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assigned Roles ({userRoles.length})</CardTitle>
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              ➕ Add Role
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRoles.map((userRole: any) => (
                <div
                  key={userRole.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{userRole.role.displayName}</h3>
                      {userRole.role.description && (
                        <p className="text-sm text-gray-600 mt-1">{userRole.role.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userRole.role.isCustom ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {userRole.role.isCustom ? 'Custom' : 'System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {userRole.role.permissions?.length || 0} permissions
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRole(userRole.role.id, userRole.role.displayName)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                      title="Remove role"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    Assigned on {new Date(userRole.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No additional roles assigned. Click "Add Role" to assign roles to this user.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Teams Owned */}
      {user.ownedTeams && user.ownedTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teams Owned ({user.ownedTeams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.ownedTeams.map((team: any) => (
                <Link
                  key={team.id}
                  href={`/dashboard/teams/${team.id}`}
                  className="border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-all"
                >
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  {team.shortName && (
                    <p className="text-sm text-gray-600 mt-1">{team.shortName}</p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium">₹{team.budget?.toLocaleString() || 0}</span>
                    </div>
                    {team.captain && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Captain:</span>
                        <span className="font-medium">{team.captain.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    View Team →
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Teams Message */}
      {user.role === 'TEAM_OWNER' && (!user.ownedTeams || user.ownedTeams.length === 0) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">No Teams Assigned</h3>
                <p className="text-sm text-yellow-800">
                  This team owner doesn't have any teams assigned yet. Create a new team and assign this user as the owner.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link href={`/dashboard/users/${userId}/edit`}>
              <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Edit User Information</div>
                    <div className="text-sm text-gray-600">Update name, email, or role</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            </Link>

            <button
              onClick={() => {
                const newPassword = prompt('Enter new password for this user:');
                if (newPassword) {
                  // This would call the reset password API
                  alert('Password reset functionality - implement with resetPassword API');
                }
              }}
              className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Reset Password</div>
                  <div className="text-sm text-gray-600">Set a new password for this user</div>
                </div>
                <span className="text-gray-400">🔑</span>
              </div>
            </button>

            <button
              onClick={handleDeleteUser}
              className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-red-700">Delete User</div>
                  <div className="text-sm text-red-600">Permanently remove this user account</div>
                </div>
                <span className="text-red-400">🗑️</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Role to User</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={selectedRoleToAdd}
                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a role --</option>
                {allRoles
                  .filter(role => !userRoles.some(ur => ur.role.id === role.id))
                  .map(role => (
                    <option key={role.id} value={role.id}>
                      {role.displayName} {role.isCustom ? '(Custom)' : '(System)'}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only roles not already assigned are shown
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddRole}
                disabled={addingRole || !selectedRoleToAdd}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingRole ? 'Adding...' : 'Add Role'}
              </button>
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setSelectedRoleToAdd('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
