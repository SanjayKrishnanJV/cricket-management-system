'use client';

import { useEffect, useState } from 'react';
import { achievementService } from '@/services/gamification';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  iconUrl?: string;
  points: number;
  criteria: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await achievementService.getAllAchievements();
      if (response.success) {
        setAchievements(response.data);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = filter === 'ALL'
    ? achievements
    : achievements.filter(a => a.category === filter);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'bg-orange-700 text-orange-100';
      case 'SILVER': return 'bg-gray-400 text-gray-900';
      case 'GOLD': return 'bg-yellow-500 text-yellow-900';
      case 'PLATINUM': return 'bg-blue-400 text-blue-900';
      case 'DIAMOND': return 'bg-cyan-400 text-cyan-900';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BATTING': return '🏏';
      case 'BOWLING': return '⚾';
      case 'FIELDING': return '🧤';
      case 'MILESTONE': return '🏆';
      case 'SPECIAL': return '⭐';
      case 'STREAK': return '🔥';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏆 Achievements</h1>
        <p className="text-gray-600">Unlock achievements by accomplishing cricket milestones</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'BATTING', 'BOWLING', 'FIELDING', 'MILESTONE', 'SPECIAL', 'STREAK'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`p-4 ${getTierColor(achievement.tier)}`}>
              <div className="flex items-center justify-between">
                <span className="text-4xl">{getCategoryIcon(achievement.category)}</span>
                <span className="text-sm font-bold uppercase">{achievement.tier}</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
              <p className="text-gray-600 mb-4">{achievement.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{achievement.category}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {achievement.points} pts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No achievements found for this category</p>
        </div>
      )}
    </div>
  );
}
