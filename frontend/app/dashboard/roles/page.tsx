'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { roleAPI } from '@/lib/api';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getAll();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) return;

    try {
      await roleAPI.delete(roleId);
      alert('Role deleted successfully!');
      fetchRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const getRoleBadge = (isCustom: boolean, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-500';
    return isCustom ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return <div className="p-8">Loading roles...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600">Manage system roles and custom roles with permissions</p>
        </div>
        <Link
          href="/dashboard/roles/new"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          ➕ Create Custom Role
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{role.displayName}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(role.isCustom, role.isActive)}`}>
                      {role.isCustom ? 'Custom' : 'System'}
                    </span>
                    {!role.isActive && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {role.description || 'No description provided'}
                </p>

                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="font-medium">{role.permissions?.length || 0}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-medium">{role.userCount || 0}</span>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Link
                    href={`/dashboard/roles/${role.id}`}
                    className="flex-1 text-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    View Details
                  </Link>
                  {role.isCustom && (
                    <>
                      <Link
                        href={`/dashboard/roles/${role.id}/edit`}
                        className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRole(role.id, role.displayName)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No roles found</p>
          </CardContent>
        </Card>
      )}

      {/* Info section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About Roles & Permissions</h3>
              <p className="text-sm text-blue-800">
                <strong>System Roles</strong> are pre-defined and cannot be deleted. You can create <strong>Custom Roles</strong> with specific permission combinations for your organization's needs. Each role can be assigned to multiple users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
