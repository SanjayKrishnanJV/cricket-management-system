'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: string;
  nationality: string;
  age: number;
  basePrice: number;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  economyRate: number;
  auctionBids: Array<{
    amount: number;
    bidder: {
      name: string;
      ownedTeams: Array<{
        name: string;
      }>;
    };
  }>;
}

export default function AuctionPage() {
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAvailablePlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      fetchBidHistory(selectedPlayer.id);
      const highestBid = selectedPlayer.auctionBids?.[0]?.amount || 0;
      setBidAmount(Math.max(selectedPlayer.basePrice, highestBid + 100000));
    }
  }, [selectedPlayer]);

  const fetchAvailablePlayers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auction/available-players');
      const data = await response.json();
      setPlayers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidHistory = async (playerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auction/${playerId}/bids`);
      const data = await response.json();
      setBidHistory(data.data || []);
    } catch (error) {
      console.error('Failed to fetch bid history:', error);
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedPlayer) return;

    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auction/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          amount: bidAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place bid');
      }

      // Refresh data
      await fetchAvailablePlayers();
      await fetchBidHistory(selectedPlayer.id);

      // Update selected player with new bid
      const updatedPlayer = players.find(p => p.id === selectedPlayer.id);
      if (updatedPlayer) {
        setSelectedPlayer({ ...updatedPlayer });
      }

      alert('Bid placed successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to place bid');
      console.error('Failed to place bid:', error);
    }
  };

  const handleSellPlayer = async () => {
    if (!selectedPlayer) return;

    if (!window.confirm(`Confirm selling ${selectedPlayer.name} to the highest bidder?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auction/${selectedPlayer.id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sell player');
      }

      alert(`${selectedPlayer.name} sold to ${data.data.soldTo} for ₹${(data.data.amount / 100000).toFixed(2)}L!`);

      setSelectedPlayer(null);
      fetchAvailablePlayers();
    } catch (error: any) {
      alert(error.message || 'Failed to sell player');
      console.error('Failed to sell player:', error);
    }
  };

  const getCurrentBid = (player: Player) => {
    return player.auctionBids?.[0]?.amount || 0;
  };

  const getCurrentBidder = (player: Player) => {
    return player.auctionBids?.[0]?.bidder?.ownedTeams?.[0]?.name || 'None';
  };

  if (loading) {
    return <div className="p-8">Loading auction...</div>;
  }

  const isTeamOwner = user?.role === 'TEAM_OWNER' || user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'TOURNAMENT_ADMIN';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Player Auction</h1>
          <p className="text-gray-600">Bid on available players to build your team</p>
        </div>
        {selectedPlayer && (
          <Button onClick={() => setSelectedPlayer(null)} variant="outline">
            Clear Selection
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Players ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No players available for auction</p>
                  <p className="text-sm mt-2">All players have been contracted to teams</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {players.map((player) => {
                    const currentBid = getCurrentBid(player);
                    const currentBidder = getCurrentBidder(player);
                    const isSelected = selectedPlayer?.id === player.id;

                    return (
                      <div
                        key={player.id}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">{player.name}</h3>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  player.role === 'BATSMAN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : player.role === 'BOWLER'
                                    ? 'bg-green-100 text-green-800'
                                    : player.role === 'ALL_ROUNDER'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {player.role.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {player.nationality} • {player.age} years
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-gray-600">
                                Runs: <span className="font-semibold">{player.totalRuns}</span>
                              </span>
                              <span className="text-gray-600">
                                Wickets: <span className="font-semibold">{player.totalWickets}</span>
                              </span>
                              <span className="text-gray-600">
                                Avg: <span className="font-semibold">{player.battingAverage.toFixed(2)}</span>
                              </span>
                              <span className="text-gray-600">
                                SR: <span className="font-semibold">{player.strikeRate.toFixed(2)}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500">Base Price</p>
                            <p className="text-sm font-semibold">₹{(player.basePrice / 100000).toFixed(2)}L</p>
                            {currentBid > 0 && (
                              <>
                                <p className="text-xs text-gray-500 mt-2">Current Bid</p>
                                <p className="text-lg font-bold text-green-600">
                                  ₹{(currentBid / 100000).toFixed(2)}L
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{currentBidder}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bidding Panel */}
        <div className="lg:col-span-1">
          {selectedPlayer ? (
            <div className="space-y-4">
              {/* Player Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Selected Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold">{selectedPlayer.name}</h3>
                  <p className="text-gray-600">
                    {selectedPlayer.role.replace('_', ' ')} • {selectedPlayer.nationality}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-semibold">
                        ₹{(selectedPlayer.basePrice / 100000).toFixed(2)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Bid:</span>
                      <span className="font-semibold text-green-600">
                        {getCurrentBid(selectedPlayer) > 0
                          ? `₹${(getCurrentBid(selectedPlayer) / 100000).toFixed(2)}L`
                          : 'No bids yet'}
                      </span>
                    </div>
                    {getCurrentBid(selectedPlayer) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Leading Bidder:</span>
                        <span className="font-semibold">{getCurrentBidder(selectedPlayer)}</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/players/${selectedPlayer.id}`}
                    className="text-blue-600 hover:underline text-sm mt-3 block"
                  >
                    View Full Profile →
                  </Link>
                </CardContent>
              </Card>

              {/* Bidding Form */}
              {isTeamOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Place Bid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bid Amount (₹ Lakhs)
                        </label>
                        <input
                          type="number"
                          value={bidAmount / 100000}
                          onChange={(e) => setBidAmount(parseFloat(e.target.value) * 100000)}
                          step="0.1"
                          min={(selectedPlayer.basePrice / 100000).toFixed(2)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: ₹{(selectedPlayer.basePrice / 100000).toFixed(2)}L
                        </p>
                      </div>
                      {error && <p className="text-sm text-red-600">{error}</p>}
                      <Button onClick={handlePlaceBid} className="w-full">
                        Place Bid ₹{(bidAmount / 100000).toFixed(2)}L
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setBidAmount(bidAmount + 100000)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          +1L
                        </Button>
                        <Button
                          onClick={() => setBidAmount(bidAmount + 500000)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          +5L
                        </Button>
                        <Button
                          onClick={() => setBidAmount(bidAmount + 1000000)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          +10L
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions */}
              {isAdmin && getCurrentBid(selectedPlayer) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleSellPlayer} className="w-full bg-green-600 hover:bg-green-700">
                      Sell Player to {getCurrentBidder(selectedPlayer)}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Bid History */}
              {bidHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bid History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bidHistory.map((bid: any, index: number) => (
                        <div
                          key={bid.id}
                          className={`p-2 rounded ${
                            index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm">
                                {bid.bidder?.ownedTeams?.[0]?.name || bid.bidder?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(bid.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                ₹{(bid.amount / 100000).toFixed(2)}L
                              </p>
                              {index === 0 && (
                                <span className="text-xs text-green-600 font-medium">Winning</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p>Select a player to view details and place bids</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
