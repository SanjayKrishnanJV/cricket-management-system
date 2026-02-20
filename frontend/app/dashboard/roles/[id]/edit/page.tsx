'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { roleAPI } from '@/lib/api';

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<any>({});
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissionIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchRoleData();
    fetchPermissions();
  }, [roleId]);

  const fetchRoleData = async () => {
    try {
      const response = await roleAPI.getById(roleId);
      const role = response.data.data;

      if (!role.isCustom) {
        alert('System roles cannot be edited');
        router.push('/dashboard/roles');
        return;
      }

      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        permissionIds: role.permissions?.map((p: any) => p.id) || [],
        isActive: role.isActive,
      });
    } catch (error) {
      console.error('Failed to fetch role:', error);
      alert('Failed to load role data');
      router.push('/dashboard/roles');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await roleAPI.getAllPermissions();
      setPermissions(response.data.data.groupedByCategory || {});
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = permissions[category] || [];
    const categoryPermissionIds = categoryPermissions.map((p: any) => p.id);
    const allSelected = categoryPermissionIds.every((id: string) =>
      formData.permissionIds.includes(id)
    );

    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        permissionIds: prev.permissionIds.filter(id => !categoryPermissionIds.includes(id)),
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        permissionIds: [...new Set([...prev.permissionIds, ...categoryPermissionIds])],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await roleAPI.update(roleId, {
        displayName: formData.displayName,
        description: formData.description,
        permissionIds: formData.permissionIds,
        isActive: formData.isActive,
      });
      alert('Role updated successfully!');
      router.push(`/dashboard/roles/${roleId}`);
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError(err.response?.data?.message || 'Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || loadingPermissions) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link href={`/dashboard/roles/${roleId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Role Details
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Custom Role</h1>
        <p className="text-gray-600 mt-1">Update role details and permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Name
              </label>
              <input
                type="text"
                value={formData.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Internal name cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Content Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this role can do..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (users can be assigned this role)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Permissions</CardTitle>
              <span className="text-sm text-gray-600">
                {formData.permissionIds.length} selected
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.keys(permissions).map((category) => {
                const categoryPerms = permissions[category] || [];
                const categoryPermIds = categoryPerms.map((p: any) => p.id);
                const allSelected = categoryPermIds.every((id: string) =>
                  formData.permissionIds.includes(id)
                );
                const someSelected = categoryPermIds.some((id: string) =>
                  formData.permissionIds.includes(id)
                );

                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleCategoryPermissions(category)}
                        className={`text-sm px-3 py-1 rounded ${
                          allSelected
                            ? 'bg-blue-100 text-blue-700'
                            : someSelected
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPerms.map((permission: any) => (
                        <label
                          key={permission.id}
                          className="flex items-start gap-3 p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
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
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || formData.permissionIds.length === 0}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
          <Link
            href={`/dashboard/roles/${roleId}`}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
