'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { roleAPI } from '@/lib/api';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleDetails();
  }, [roleId]);

  const fetchRoleDetails = async () => {
    try {
      const response = await roleAPI.getById(roleId);
      setRole(response.data.data);
    } catch (error) {
      console.error('Failed to fetch role details:', error);
      alert('Failed to load role details');
      router.push('/dashboard/roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!role?.isCustom) {
      alert('System roles cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${role.displayName}"?`)) return;

    try {
      await roleAPI.delete(roleId);
      alert('Role deleted successfully!');
      router.push('/dashboard/roles');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  if (loading) {
    return <div className="p-8">Loading role details...</div>;
  }

  if (!role) {
    return <div className="p-8">Role not found</div>;
  }

  // Group permissions by category
  const permissionsByCategory = (role.permissions || []).reduce((acc: any, perm: any) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/dashboard/roles" className="text-sm text-blue-600 hover:underline">
          ← Back to Roles
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{role.displayName}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                role.isCustom ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {role.isCustom ? 'Custom Role' : 'System Role'}
              </span>
              {!role.isActive && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Inactive
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {role.isCustom && (
              <>
                <Link
                  href={`/dashboard/roles/${roleId}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Edit Role
                </Link>
                <button
                  onClick={handleDeleteRole}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Role
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role Name</label>
              <p className="text-lg font-semibold mt-1">{role.displayName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Internal Name</label>
              <p className="text-lg font-mono mt-1">{role.name}</p>
            </div>
          </div>

          {role.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-700 mt-1">{role.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-500">Total Permissions</label>
              <p className="text-2xl font-bold text-blue-600 mt-1">{role.permissions?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Users Assigned</label>
              <p className="text-2xl font-bold text-green-600 mt-1">{role.users?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-2xl font-bold mt-1">
                {role.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions ({role.permissions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(permissionsByCategory).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No permissions assigned to this role</p>
          ) : (
            <div className="space-y-6">
              {Object.keys(permissionsByCategory).map((category) => (
                <div key={category} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 capitalize mb-3">
                    {category.replace(/_/g, ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissionsByCategory[category].map((permission: any) => (
                      <div
                        key={permission.id}
                        className="flex items-start gap-3 p-3 rounded border border-gray-200 bg-gray-50"
                      >
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {permission.displayName}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Users */}
      {role.users && role.users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Users ({role.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned On</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {role.users.map((userRole: any) => (
                    <tr key={userRole.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{userRole.user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{userRole.user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(userRole.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info for System Roles */}
      {!role.isCustom && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">System Role</h3>
                <p className="text-sm text-blue-800">
                  This is a system-defined role and cannot be edited or deleted. System roles provide essential access control for the cricket management platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
