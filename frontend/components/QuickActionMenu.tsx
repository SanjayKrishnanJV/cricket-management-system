'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuickActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Handle Escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const quickActions = [
    { name: 'Players', icon: '🏏', href: '/dashboard/players', color: 'bg-blue-500' },
    { name: 'Teams', icon: '👥', href: '/dashboard/teams', color: 'bg-green-500' },
    { name: 'Matches', icon: '🎯', href: '/dashboard/matches', color: 'bg-red-500' },
    { name: 'Tournaments', icon: '🏆', href: '/dashboard/tournaments', color: 'bg-yellow-500' },
    { name: 'Users', icon: '👤', href: '/dashboard/users', color: 'bg-purple-500' },
    { name: 'Roles', icon: '🔑', href: '/dashboard/roles', color: 'bg-indigo-500' },
    { name: 'Auctions', icon: '💰', href: '/dashboard/auctions', color: 'bg-orange-500' },
    { name: 'Quick Match', icon: '⚡', href: '/dashboard/matches/quick', color: 'bg-pink-500' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Quick Actions Menu"
      >
        <span className="text-3xl group-hover:rotate-90 transition-transform duration-300">
          {isOpen ? '✕' : '⚡'}
        </span>
      </button>

      {/* Quick Action Menu Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Grid */}
          <div className="fixed bottom-28 right-8 z-50 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-slide-up">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500">Navigate quickly to any section</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .fixed.bottom-28.right-8 {
            right: 50%;
            transform: translateX(50%);
            width: calc(100% - 2rem);
            max-width: 320px;
          }
        }
      `}</style>
    </>
  );
}
