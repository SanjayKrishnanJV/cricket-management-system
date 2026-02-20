'use client';

import { useEffect, useState } from 'react';
import { challengeService } from '@/services/gamification';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: string;
  requirements: string;
  xpReward: number;
  pointsReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('DAILY');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await challengeService.getActiveChallenges('PLAYER');
      if (response.success) {
        setChallenges(response.data);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(c => c.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY': return 'bg-blue-500';
      case 'WEEKLY': return 'bg-purple-500';
      case 'MONTHLY': return 'bg-green-500';
      case 'MILESTONE': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DAILY': return '📅';
      case 'WEEKLY': return '📆';
      case 'MONTHLY': return '🗓️';
      case 'MILESTONE': return '🏆';
      default: return '🎯';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
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
        <h1 className="text-4xl font-bold mb-2">🎯 Challenges</h1>
        <p className="text-gray-600">Complete challenges to earn XP and rewards</p>
      </div>

      {/* Challenge Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['DAILY', 'WEEKLY', 'MONTHLY', 'MILESTONE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {getTypeIcon(type)} {type}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`${getTypeColor(challenge.type)} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl mr-2">{getTypeIcon(challenge.type)}</span>
                  <span className="text-sm font-bold uppercase">{challenge.type}</span>
                </div>
                <span className="text-sm opacity-90">
                  {getTimeRemaining(challenge.endDate)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
              <p className="text-gray-600 mb-4">{challenge.description}</p>

              {/* Progress Bar Placeholder */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ⚡ {challenge.xpReward} XP
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ {challenge.pointsReward} pts
                  </span>
                </div>
              </div>

              {/* Claim Button */}
              <button
                disabled
                className="w-full mt-4 bg-gray-300 text-gray-500 py-2 rounded-lg font-semibold cursor-not-allowed"
              >
                Not Completed
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {filter.toLowerCase()} challenges available</p>
        </div>
      )}
    </div>
  );
}
