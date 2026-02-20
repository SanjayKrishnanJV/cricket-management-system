'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';

type TabType = 'profile' | 'users' | 'roles' | 'general';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const tabs = [
    { id: 'profile' as TabType, label: '👤 My Profile', icon: '👤' },
    ...(isSuperAdmin
      ? [
          { id: 'users' as TabType, label: '👥 Users Management', icon: '👥' },
          { id: 'roles' as TabType, label: '🔐 Roles Management', icon: '🔐' },
        ]
      : []),
    { id: 'general' as TabType, label: '⚙️ General', icon: '⚙️' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile({
        email: formData.email,
        name: formData.name,
      });
      alert('Profile updated successfully!');
      // Refresh user data
      const response = await authAPI.getProfile();
      useAuthStore.getState().setUser(response.data.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    try {
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      alert('Password changed successfully!');
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">⚙️</span>
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and application settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
                  />
                </div>
                <Button type="submit" variant="primary">
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" variant="primary">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">User ID:</span>
                <span className="text-sm text-gray-900">{user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  {user?.role || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Management Tab (SUPER_ADMIN only) */}
      {activeTab === 'users' && isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Manage all users, their roles, and permissions in the system.
              </p>
              <Button onClick={() => router.push('/dashboard/users')} variant="primary">
                Go to Users Management →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Management Tab (SUPER_ADMIN only) */}
      {activeTab === 'roles' && isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Roles Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Create and manage roles with specific permissions for different user types.
              </p>
              <Button onClick={() => router.push('/dashboard/roles')} variant="primary">
                Go to Roles Management →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Receive email notifications for important events
                </p>
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Live Match Alerts</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Get notified when matches go live
                </p>
              </div>
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Achievement Notifications
                  </span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Receive notifications when you unlock achievements
                </p>
              </div>
              <Button variant="primary">Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Default View
                </label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Dashboard</option>
                  <option>Live Matches</option>
                  <option>Tournaments</option>
                </select>
              </div>
              <Button variant="primary">Save Display Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Version:</span>
                <span className="text-sm text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Build:</span>
                <span className="text-sm text-gray-900">2024.02</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Environment:</span>
                <span className="text-sm text-gray-900">Development</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
