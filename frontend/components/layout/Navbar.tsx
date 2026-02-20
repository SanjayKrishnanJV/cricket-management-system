'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              🏏 Cricket Manager
            </Link>
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                href="/dashboard"
                className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                🏠 Home
              </Link>
              <Link
                href="/dashboard/analytics"
                className="px-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/dashboard/ai-test"
                className="px-2 py-2 text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap"
              >
                🤖 AI
              </Link>
              <Link
                href="/dashboard/about"
                className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                📖 About
              </Link>
              <Link
                href="/dashboard/contact"
                className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                📧 Contact
              </Link>
              <Link
                href="/dashboard/coming-soon"
                className="px-2 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 whitespace-nowrap"
              >
                🚀 Soon
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              title="Settings"
            >
              ⚙️
            </Link>
            <span className="text-sm text-gray-700">
              {user?.name} ({user?.role})
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
