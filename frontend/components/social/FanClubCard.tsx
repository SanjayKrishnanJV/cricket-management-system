'use client';

import { useEffect, useState } from 'react';
import { fanClubAPI } from '@/lib/api';

interface FanClubCardProps {
  playerId: string;
  playerName: string;
  userId?: string;
}

interface FanClub {
  id: string;
  name: string;
  description: string;
  badge: string;
  memberCount: number;
  members: Array<{
    userId: string;
    points: number;
    user: {
      name: string;
    };
  }>;
}

export function FanClubCard({ playerId, playerName, userId = 'guest' }: FanClubCardProps) {
  const [fanClub, setFanClub] = useState<FanClub | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFanClub();
  }, [playerId]);

  const fetchFanClub = async () => {
    try {
      const response = await fanClubAPI.getByPlayer(playerId);
      if (response.data.success && response.data.data) {
        setFanClub(response.data.data);
        // Check if current user is a member
        const member = response.data.data.members?.find(
          (m: any) => m.userId === userId
        );
        setIsMember(!!member);
      }
    } catch (error) {
      console.error('Error fetching fan club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!fanClub) return;
    setActionLoading(true);
    try {
      await fanClubAPI.join(fanClub.id, userId);
      setIsMember(true);
      fetchFanClub(); // Refresh to get updated member count
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join fan club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!fanClub || !confirm('Leave this fan club?')) return;
    setActionLoading(true);
    try {
      await fanClubAPI.leave(fanClub.id, userId);
      setIsMember(false);
      fetchFanClub();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to leave fan club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateFanClub = async () => {
    setActionLoading(true);
    try {
      await fanClubAPI.create({
        playerId,
        name: `${playerName} Fan Club`,
        description: `Official fan club for ${playerName}`,
        badge: '⭐',
      });
      fetchFanClub();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create fan club');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!fanClub) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Fan Club Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to create a fan club for {playerName}!
          </p>
          <button
            onClick={handleCreateFanClub}
            disabled={actionLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {actionLoading ? 'Creating...' : 'Create Fan Club'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{fanClub.badge || '⭐'}</span>
            <div>
              <h3 className="text-xl font-bold">{fanClub.name}</h3>
              <p className="text-sm opacity-90">{fanClub.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{fanClub.memberCount}</div>
            <div className="text-sm opacity-90">Members</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Join/Leave Button */}
        <div className="mb-6">
          {isMember ? (
            <button
              onClick={handleLeave}
              disabled={actionLoading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 font-semibold"
            >
              {actionLoading ? 'Processing...' : 'Leave Fan Club'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={actionLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
            >
              {actionLoading ? 'Joining...' : 'Join Fan Club'}
            </button>
          )}
        </div>

        {/* Top Members Leaderboard */}
        {fanClub.members && fanClub.members.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>🏆</span>
              <span>Top Fans</span>
            </h4>
            <div className="space-y-2">
              {fanClub.members.slice(0, 5).map((member, index) => (
                <div
                  key={member.userId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    member.userId === userId ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {member.user.name}
                        {member.userId === userId && (
                          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{member.points} points</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">#{index + 1}</div>
                </div>
              ))}
            </div>

            {fanClub.memberCount > 5 && (
              <p className="text-sm text-gray-500 text-center mt-3">
                + {fanClub.memberCount - 5} more members
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
