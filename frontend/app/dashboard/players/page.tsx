'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/players');
      const data = await response.json();
      setPlayers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const filteredAndSortedPlayers = () => {
    let filtered = [...players];

    // Apply role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(player => selectedRoles.includes(player.role));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'runs-desc':
          return b.totalRuns - a.totalRuns;
        case 'avg-desc':
          return b.battingAverage - a.battingAverage;
        case 'sr-desc':
          return b.strikeRate - a.strikeRate;
        case 'wickets-desc':
          return b.totalWickets - a.totalWickets;
        case 'econ-asc':
          return a.economyRate - b.economyRate;
        case 'matches-desc':
          return b.totalMatches - a.totalMatches;
        case 'age-asc':
          return a.age - b.age;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getRoleBannerStyle = (role: string) => {
    const banners: any = {
      BATSMAN: {
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.3), rgba(29, 78, 216, 0.4)), url('/images/player-banners/batsman.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      BOWLER: {
        backgroundImage: `linear-gradient(rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.4)), url('/images/player-banners/bowler.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      ALL_ROUNDER: {
        backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3), rgba(126, 34, 206, 0.4)), url('/images/player-banners/all-rounder.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
      WICKETKEEPER: {
        backgroundImage: `linear-gradient(rgba(22, 163, 74, 0.3), rgba(21, 128, 61, 0.4)), url('/images/player-banners/wicketkeeper.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
    };
    return banners[role] || {
      backgroundImage: `linear-gradient(rgba(107, 114, 128, 0.3), rgba(75, 85, 99, 0.4)), url('/images/player-banners/default.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  const getRoleIcon = (role: string) => {
    const icons: any = {
      BATSMAN: '🏏',
      BOWLER: '⚡',
      ALL_ROUNDER: '⭐',
      WICKETKEEPER: '🧤',
    };
    return icons[role] || '🏏';
  };

  if (loading) {
    return <div className="p-8">Loading players...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-gray-600">Browse all registered cricket players</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/players/new"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            ➕ Create Player
          </Link>
          <Link
            href="/dashboard/players/compare"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            ⚖️ Compare Players
          </Link>
        </div>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Role Filters */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Role
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'BATSMAN', label: 'Batsman', icon: '🏏', activeClass: 'bg-blue-600 text-white shadow-md' },
                  { value: 'BOWLER', label: 'Bowler', icon: '⚡', activeClass: 'bg-red-600 text-white shadow-md' },
                  { value: 'ALL_ROUNDER', label: 'All-Rounder', icon: '⭐', activeClass: 'bg-purple-600 text-white shadow-md' },
                  { value: 'WICKETKEEPER', label: 'Wicketkeeper', icon: '🧤', activeClass: 'bg-green-600 text-white shadow-md' },
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedRoles.includes(role.value)
                        ? role.activeClass
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{role.icon}</span>
                    {role.label}
                  </button>
                ))}
                {selectedRoles.length > 0 && (
                  <button
                    onClick={() => setSelectedRoles([])}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                  >
                    ✕ Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="runs-desc">Total Runs (High to Low)</option>
                <option value="avg-desc">Batting Average (High to Low)</option>
                <option value="sr-desc">Strike Rate (High to Low)</option>
                <option value="wickets-desc">Total Wickets (High to Low)</option>
                <option value="econ-asc">Economy Rate (Low to High)</option>
                <option value="matches-desc">Total Matches (High to Low)</option>
                <option value="age-asc">Age (Young to Old)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredAndSortedPlayers().length}</span> of{' '}
              <span className="font-semibold">{players.length}</span> players
              {selectedRoles.length > 0 && (
                <span className="ml-2">
                  (Filtered by: {selectedRoles.map(r => r.replace('_', ' ')).join(', ')})
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedPlayers().map((player) => (
          <Link key={player.id} href={`/dashboard/players/${player.id}`}>
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
              {/* Image Banner Header with Photo */}
              <div
                className="relative h-48 p-6 flex flex-col items-center justify-center"
                style={getRoleBannerStyle(player.role)}
              >
                {/* Role Badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold border border-white/30">
                  {player.role.replace('_', ' ')}
                </div>

                {/* Player Avatar/Photo */}
                <div className="relative w-28 h-28 mb-3">
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${player.imageUrl ? 'hidden' : ''} w-full h-full rounded-full bg-white/30 backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center text-5xl`}>
                    {getRoleIcon(player.role)}
                  </div>
                </div>

                {/* Country Badge */}
                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium border border-white/30">
                  🏳️ {player.nationality}
                </div>
              </div>

              {/* Player Info */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">{player.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{player.age} years old</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{player.totalMatches}</div>
                    <div className="text-xs text-gray-500 uppercase">Matches</div>
                  </div>
                  {player.role !== 'BOWLER' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{player.totalRuns}</div>
                        <div className="text-xs text-gray-500 uppercase">Runs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{player.battingAverage.toFixed(1)}</div>
                        <div className="text-xs text-gray-500 uppercase">Avg</div>
                      </div>
                    </>
                  )}
                  {player.role !== 'BATSMAN' && player.totalWickets > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{player.totalWickets}</div>
                        <div className="text-xs text-gray-500 uppercase">Wickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{player.economyRate.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 uppercase">Econ</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Stats for All-Rounders */}
                {player.role === 'ALL_ROUNDER' && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-600">SR: {player.strikeRate.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-600">Avg: {player.bowlingAverage.toFixed(1)}</div>
                    </div>
                  </div>
                )}

                {/* Hover Effect Arrow */}
                <div className="mt-4 text-center text-gray-400 group-hover:text-blue-600 transition-colors text-sm font-medium">
                  View Details →
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedPlayers().length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {players.length === 0
                ? 'No players found'
                : 'No players match the selected filters'}
            </p>
            {selectedRoles.length > 0 && (
              <button
                onClick={() => setSelectedRoles([])}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
