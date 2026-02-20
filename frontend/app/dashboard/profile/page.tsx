'use client';

import { useEffect, useState } from 'react';
import { rewardsService } from '@/services/gamification';

interface UserProfile {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  totalPoints: number;
  currentTitle?: string;
  loginStreak: number;
  predictionStreak: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, get user ID from auth context
    const loadProfile = async () => {
      try {
        // This would use actual user ID from auth
        // const response = await rewardsService.getUserProfile(userId);
        // For now, showing placeholder data
        setProfile({
          totalXP: 2450,
          level: 7,
          xpToNextLevel: 3200,
          totalPoints: 1250,
          currentTitle: 'Cricket Enthusiast',
          loginStreak: 15,
          predictionStreak: 8,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const calculateXPProgress = () => {
    if (!profile) return 0;
    return (profile.totalXP / profile.xpToNextLevel) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">👤 Your Profile</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-center gap-6">
          <div className="bg-white rounded-full p-6">
            <span className="text-6xl">👤</span>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Player Name</h2>
            <p className="text-xl opacity-90">{profile.currentTitle || 'No title'}</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-sm opacity-75">Level</div>
                <div className="text-2xl font-bold">{profile.level}</div>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-sm opacity-75">Total Points</div>
                <div className="text-2xl font-bold">{profile.totalPoints}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">⚡ Experience Progress</h3>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level {profile.level}</span>
            <span>Level {profile.level + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${calculateXPProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{profile.totalXP} XP</span>
            <span>{profile.xpToNextLevel} XP</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-blue-600">{profile.loginStreak}</div>
          <div className="text-gray-600">Day Login Streak</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-green-600">{profile.predictionStreak}</div>
          <div className="text-gray-600">Prediction Streak</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-yellow-600">12</div>
          <div className="text-gray-600">Achievements</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-purple-600">{profile.totalPoints}</div>
          <div className="text-gray-600">Total Points</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">📜 Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <div className="font-semibold">Achievement Unlocked: Century King</div>
              <div className="text-sm text-gray-600">2 hours ago</div>
            </div>
            <span className="text-green-600 font-bold">+100 XP</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <div className="font-semibold">15 Day Login Streak</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <span className="text-green-600 font-bold">+50 XP</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <div className="font-semibold">Challenge Completed: Half-Century Hero</div>
              <div className="text-sm text-gray-600">Yesterday</div>
            </div>
            <span className="text-green-600 font-bold">+50 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
