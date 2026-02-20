'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { administrationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DRSReview {
  id: string;
  overNumber: number;
  ballNumber: number;
  drsType: string;
  onFieldDecision: string;
  thirdUmpireDecision: string;
  finalDecision: string;
  status: string;
  reviewedBy: string;
  ultraEdge: boolean;
  ballTracking: boolean;
  hotSpot: boolean;
  snickoMeter: boolean;
  reviewedAt: string;
  innings: { inningsNumber: number };
}

interface DRSStats {
  totalReviews: number;
  successfulReviews: number;
  successRate: number;
  team1TotalReviews: number;
  team2TotalReviews: number;
  team1ReviewsRemaining: number;
  team2ReviewsRemaining: number;
  byType: Record<string, number>;
}

export default function DRSPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [reviews, setReviews] = useState<DRSReview[]>([]);
  const [stats, setStats] = useState<DRSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<DRSReview | null>(null);

  const [formData, setFormData] = useState({
    inningsId: '',
    overNumber: 0,
    ballNumber: 0,
    reviewingTeamId: '',
    battingTeamId: '',
    bowlingTeamId: '',
    batsmanId: '',
    bowlerId: '',
    drsType: 'LBW',
    onFieldDecision: 'OUT',
    reviewedBy: '',
  });

  const [updateData, setUpdateData] = useState({
    thirdUmpireDecision: 'OUT',
    finalDecision: 'OUT',
    status: 'UPHELD',
    ultraEdge: false,
    ballTracking: false,
    hotSpot: false,
    snickoMeter: false,
    reasoning: '',
    reviewDuration: 0,
  });

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, statsRes] = await Promise.all([
        administrationAPI.getDRSReviews(matchId),
        administrationAPI.getDRSStats(matchId),
      ]);
      setReviews(reviewsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch DRS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.createDRSReview(matchId, formData);
      setShowCreateModal(false);
      fetchData();
      alert('DRS Review created successfully');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      await administrationAPI.updateDRSDecision(selectedReview.id, updateData);
      setShowUpdateModal(false);
      setSelectedReview(null);
      fetchData();
      alert('DRS Decision updated successfully');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPHELD':
        return 'bg-green-100 text-green-800';
      case 'REVERSED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading DRS data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DRS Reviews</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          📡 Create DRS Review
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">
                {stats.successfulReviews} / {stats.totalReviews}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team 1 Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.team1ReviewsRemaining}</div>
              <div className="text-sm text-gray-500">
                Remaining ({stats.team1TotalReviews} used)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team 2 Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.team2ReviewsRemaining}</div>
              <div className="text-sm text-gray-500">
                Remaining ({stats.team2TotalReviews} used)
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No DRS reviews yet. Click "Create DRS Review" to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold">
                          Over {review.overNumber}.{review.ballNumber}
                        </span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {review.drsType}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Innings {review.innings.inningsNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">On-field:</span>{' '}
                          <span className="font-medium">{review.onFieldDecision}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">3rd Umpire:</span>{' '}
                          <span className="font-medium">{review.thirdUmpireDecision}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Final:</span>{' '}
                          <span className="font-medium">{review.finalDecision}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviewed by:</span>{' '}
                          <span className="font-medium">{review.reviewedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        {review.ultraEdge && <span>✓ UltraEdge</span>}
                        {review.ballTracking && <span>✓ Ball Tracking</span>}
                        {review.hotSpot && <span>✓ HotSpot</span>}
                        {review.snickoMeter && <span>✓ Snicko</span>}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedReview(review);
                        setUpdateData({
                          thirdUmpireDecision: review.thirdUmpireDecision,
                          finalDecision: review.finalDecision,
                          status: review.status,
                          ultraEdge: review.ultraEdge,
                          ballTracking: review.ballTracking,
                          hotSpot: review.hotSpot,
                          snickoMeter: review.snickoMeter,
                          reasoning: '',
                          reviewDuration: 0,
                        });
                        setShowUpdateModal(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      Update Decision
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Review Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create DRS Review</h3>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Innings ID</label>
                  <input
                    type="text"
                    required
                    value={formData.inningsId}
                    onChange={(e) => setFormData({ ...formData, inningsId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">DRS Type</label>
                  <select
                    value={formData.drsType}
                    onChange={(e) => setFormData({ ...formData, drsType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="LBW">LBW</option>
                    <option value="CAUGHT">Caught</option>
                    <option value="STUMPED">Stumped</option>
                    <option value="RUN_OUT">Run Out</option>
                    <option value="HIT_WICKET">Hit Wicket</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Over Number</label>
                  <input
                    type="number"
                    required
                    value={formData.overNumber}
                    onChange={(e) => setFormData({ ...formData, overNumber: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ball Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="6"
                    value={formData.ballNumber}
                    onChange={(e) => setFormData({ ...formData, ballNumber: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">On-field Decision</label>
                  <select
                    value={formData.onFieldDecision}
                    onChange={(e) => setFormData({ ...formData, onFieldDecision: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="OUT">OUT</option>
                    <option value="NOT OUT">NOT OUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reviewed By</label>
                  <input
                    type="text"
                    required
                    placeholder="Captain/Player name"
                    value={formData.reviewedBy}
                    onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reviewing Team ID</label>
                  <input
                    type="text"
                    required
                    value={formData.reviewingTeamId}
                    onChange={(e) => setFormData({ ...formData, reviewingTeamId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batting Team ID</label>
                  <input
                    type="text"
                    required
                    value={formData.battingTeamId}
                    onChange={(e) => setFormData({ ...formData, battingTeamId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bowling Team ID</label>
                  <input
                    type="text"
                    required
                    value={formData.bowlingTeamId}
                    onChange={(e) => setFormData({ ...formData, bowlingTeamId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batsman ID</label>
                  <input
                    type="text"
                    required
                    value={formData.batsmanId}
                    onChange={(e) => setFormData({ ...formData, batsmanId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bowler ID</label>
                  <input
                    type="text"
                    required
                    value={formData.bowlerId}
                    onChange={(e) => setFormData({ ...formData, bowlerId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Decision Modal */}
      {showUpdateModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Update DRS Decision</h3>
            <form onSubmit={handleUpdateDecision} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Third Umpire Decision</label>
                  <select
                    value={updateData.thirdUmpireDecision}
                    onChange={(e) => setUpdateData({ ...updateData, thirdUmpireDecision: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="OUT">OUT</option>
                    <option value="NOT_OUT">NOT OUT</option>
                    <option value="UMPIRES_CALL">Umpire's Call</option>
                    <option value="INCONCLUSIVE">Inconclusive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Final Decision</label>
                  <select
                    value={updateData.finalDecision}
                    onChange={(e) => setUpdateData({ ...updateData, finalDecision: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="OUT">OUT</option>
                    <option value="NOT OUT">NOT OUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="UPHELD">Upheld</option>
                    <option value="REVERSED">Reversed</option>
                    <option value="NOT_OUT_STAYS">Not Out Stays</option>
                    <option value="OUT_GIVEN">Out Given</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Review Duration (seconds)</label>
                  <input
                    type="number"
                    value={updateData.reviewDuration}
                    onChange={(e) => setUpdateData({ ...updateData, reviewDuration: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Technology Used</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={updateData.ultraEdge}
                      onChange={(e) => setUpdateData({ ...updateData, ultraEdge: e.target.checked })}
                    />
                    <span>UltraEdge</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={updateData.ballTracking}
                      onChange={(e) => setUpdateData({ ...updateData, ballTracking: e.target.checked })}
                    />
                    <span>Ball Tracking</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={updateData.hotSpot}
                      onChange={(e) => setUpdateData({ ...updateData, hotSpot: e.target.checked })}
                    />
                    <span>HotSpot</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={updateData.snickoMeter}
                      onChange={(e) => setUpdateData({ ...updateData, snickoMeter: e.target.checked })}
                    />
                    <span>Snickometer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reasoning</label>
                <textarea
                  value={updateData.reasoning}
                  onChange={(e) => setUpdateData({ ...updateData, reasoning: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Third umpire's reasoning for the decision..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedReview(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Update Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
