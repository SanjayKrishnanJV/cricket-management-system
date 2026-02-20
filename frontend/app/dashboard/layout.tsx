'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import QuickActionMenu from '@/components/QuickActionMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadUser, isLoading } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Handle hydration from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Safety timeout - don't stay in loading state forever
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Dashboard: Load timeout reached, forcing render');
      setLoadTimeout(true);
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      console.log('Dashboard: Loading user data...');
      // Refresh user data from API to ensure it's up to date
      loadUser().catch((err) => {
        console.error('Dashboard: Failed to load user:', err);
      });
    }
  }, [hydrated, isAuthenticated, loadUser]);

  useEffect(() => {
    console.log('Dashboard auth state:', { hydrated, isLoading, isAuthenticated });
    if (hydrated && !isLoading && !isAuthenticated) {
      console.log('Dashboard: Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, isLoading, router]);

  // Don't render until hydrated to avoid flash
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show loading only briefly, don't get stuck
  if (isLoading && !loadTimeout) {
    console.log('Dashboard: Still loading...');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <QuickActionMenu />
    </div>
  );
}
