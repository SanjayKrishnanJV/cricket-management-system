'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { administrationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InjuriesPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [injuries, setInjuries] = useState<any[]>([]);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const [injuryForm, setInjuryForm] = useState({
    playerId: '',
    teamId: '',
    injuryType: '',
    severity: 'MINOR',
    description: '',
    assessedBy: '',
    diagnosis: '',
    treatmentPlan: '',
  });

  const [subForm, setSubForm] = useState({
    replacedPlayerId: '',
    substitutePlayerId: '',
    teamId: '',
    substituteType: 'REGULAR',
    reason: '',
    approvedBy: '',
  });

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [injuriesRes, subsRes] = await Promise.all([
        administrationAPI.getInjuries(matchId),
        administrationAPI.getSubstitutions(matchId),
      ]);
      setInjuries(injuriesRes.data.data || []);
      setSubstitutes(subsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.recordInjury({ matchId, ...injuryForm });
      setShowInjuryModal(false);
      fetchData();
      alert('Injury recorded successfully');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCreateSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.createSubstitution({ matchId, ...subForm });
      setShowSubModal(false);
      fetchData();
      alert('Substitution created successfully');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'SEVERE': return 'bg-orange-100 text-orange-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'MINOR': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800';
      case 'RECOVERED': return 'bg-green-100 text-green-800';
      case 'ONGOING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading injuries data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Injuries & Substitutions</h1>

      {/* Injuries Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Player Injuries</CardTitle>
            <Button
              onClick={() => setShowInjuryModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🏥 Record Injury
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {injuries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No injuries recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {injuries.map((injury) => (
                <div key={injury.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-lg">
                          {injury.player?.name || 'Unknown Player'}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${getSeverityColor(injury.severity)}`}>
                          {injury.severity}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${getStatusColor(injury.status)}`}>
                          {injury.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>{' '}
                          <span className="font-medium">{injury.injuryType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Role:</span>{' '}
                          <span className="font-medium">{injury.player?.role}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>{' '}
                          <span className="font-medium">
                            {new Date(injury.injuredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">{injury.description}</p>

                      {injury.diagnosis && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Diagnosis:</span> {injury.diagnosis}
                        </div>
                      )}

                      {injury.expectedRecovery && (
                        <div className="text-sm text-gray-600">
                          Expected recovery: {new Date(injury.expectedRecovery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Substitutions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Substitutions</CardTitle>
            <Button
              onClick={() => setShowSubModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🔄 Create Substitution
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {substitutes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No substitutions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {substitutes.map((sub) => (
                <div key={sub.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {sub.substituteType}
                        </span>
                        {!sub.endedAt && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">{sub.replacedPlayer?.name}</span>
                        <span className="text-gray-500">→</span>
                        <span className="font-medium text-blue-600">{sub.substitutePlayer?.name}</span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {sub.reason}
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        <span>Can Bat: {sub.canBat ? '✓' : '✗'}</span>
                        <span>Can Bowl: {sub.canBowl ? '✓' : '✗'}</span>
                        <span>Can Field: {sub.canField ? '✓' : '✗'}</span>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Substituted: {new Date(sub.substitutedAt).toLocaleString()}
                        {sub.endedAt && ` • Ended: ${new Date(sub.endedAt).toLocaleString()}`}
                      </div>
                    </div>

                    {!sub.endedAt && (
                      <Button
                        onClick={async () => {
                          if (confirm('End this substitution?')) {
                            await administrationAPI.endSubstitution(sub.id);
                            fetchData();
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="ml-4"
                      >
                        End Substitution
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Injury Modal */}
      {showInjuryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Record Player Injury</h3>
            <form onSubmit={handleRecordInjury} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Player ID *</label>
                  <input
                    type="text"
                    required
                    value={injuryForm.playerId}
                    onChange={(e) => setInjuryForm({ ...injuryForm, playerId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team ID *</label>
                  <input
                    type="text"
                    required
                    value={injuryForm.teamId}
                    onChange={(e) => setInjuryForm({ ...injuryForm, teamId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Injury Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Hamstring, Concussion, Finger"
                    value={injuryForm.injuryType}
                    onChange={(e) => setInjuryForm({ ...injuryForm, injuryType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Severity *</label>
                  <select
                    value={injuryForm.severity}
                    onChange={(e) => setInjuryForm({ ...injuryForm, severity: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="MINOR">Minor</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={injuryForm.description}
                    onChange={(e) => setInjuryForm({ ...injuryForm, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Describe the injury incident..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assessed By</label>
                  <input
                    type="text"
                    placeholder="Physio/Doctor name"
                    value={injuryForm.assessedBy}
                    onChange={(e) => setInjuryForm({ ...injuryForm, assessedBy: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={injuryForm.diagnosis}
                    onChange={(e) => setInjuryForm({ ...injuryForm, diagnosis: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Treatment Plan</label>
                  <textarea
                    rows={2}
                    value={injuryForm.treatmentPlan}
                    onChange={(e) => setInjuryForm({ ...injuryForm, treatmentPlan: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Treatment plan and recovery steps..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowInjuryModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  Record Injury
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Substitution Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create Substitution</h3>
            <form onSubmit={handleCreateSubstitution} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Replaced Player ID *</label>
                  <input
                    type="text"
                    required
                    value={subForm.replacedPlayerId}
                    onChange={(e) => setSubForm({ ...subForm, replacedPlayerId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Substitute Player ID *</label>
                  <input
                    type="text"
                    required
                    value={subForm.substitutePlayerId}
                    onChange={(e) => setSubForm({ ...subForm, substitutePlayerId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team ID *</label>
                  <input
                    type="text"
                    required
                    value={subForm.teamId}
                    onChange={(e) => setSubForm({ ...subForm, teamId: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Substitute Type *</label>
                  <select
                    value={subForm.substituteType}
                    onChange={(e) => setSubForm({ ...subForm, substituteType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="CONCUSSION">Concussion</option>
                    <option value="COVID">COVID</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Reason *</label>
                  <input
                    type="text"
                    required
                    placeholder="Reason for substitution"
                    value={subForm.reason}
                    onChange={(e) => setSubForm({ ...subForm, reason: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Approved By</label>
                  <input
                    type="text"
                    placeholder="Match referee/umpire name"
                    value={subForm.approvedBy}
                    onChange={(e) => setSubForm({ ...subForm, approvedBy: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                <strong>Note:</strong> For concussion substitutes, the replacement must be a like-for-like player (same role).
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Substitution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
