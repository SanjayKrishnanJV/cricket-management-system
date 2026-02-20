'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { administrationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface MatchRefereeReport {
  id: string;
  matchId: string;
  refereeName: string;
  matchSummary: string;
  fairPlay: boolean;
  team1OverRate?: number;
  team2OverRate?: number;
  status: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface MatchIncident {
  id: string;
  reportId: string;
  incidentType: string;
  severity: string;
  description: string;
  overNumber: number;
  playersInvolved: string;
  action: string;
  recordedAt: string;
}

interface CodeViolation {
  id: string;
  reportId: string;
  playerId: string;
  violationType: string;
  description: string;
  penalty: string;
  fineAmount?: number;
  matchBan?: number;
  recordedAt: string;
  player?: {
    name: string;
    teamId: string;
  };
}

export default function RefereeReportPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [report, setReport] = useState<MatchRefereeReport | null>(null);
  const [incidents, setIncidents] = useState<MatchIncident[]>([]);
  const [violations, setViolations] = useState<CodeViolation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<MatchIncident | null>(null);
  const [editingViolation, setEditingViolation] = useState<CodeViolation | null>(null);

  // Form states
  const [reportForm, setReportForm] = useState({
    refereeName: '',
    matchSummary: '',
    fairPlay: true,
    team1OverRate: '',
    team2OverRate: '',
  });

  const [incidentForm, setIncidentForm] = useState({
    incidentType: 'BALL_TAMPERING',
    severity: 'LOW',
    description: '',
    overNumber: '',
    playersInvolved: '',
    action: '',
  });

  const [violationForm, setViolationForm] = useState({
    playerId: '',
    violationType: 'DISSENT',
    description: '',
    penalty: 'WARNING',
    fineAmount: '',
    matchBan: '',
  });

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, incidentsRes, violationsRes] = await Promise.all([
        administrationAPI.getRefereeReport(matchId).catch(() => ({ data: { data: null } })),
        administrationAPI.getIncidentsByMatch(matchId).catch(() => ({ data: { data: [] } })),
        administrationAPI.getViolationsByMatch(matchId).catch(() => ({ data: { data: [] } })),
      ]);

      const reportData = reportRes.data.data;
      setReport(reportData);
      if (reportData) {
        setReportForm({
          refereeName: reportData.refereeName,
          matchSummary: reportData.matchSummary,
          fairPlay: reportData.fairPlay,
          team1OverRate: reportData.team1OverRate?.toString() || '',
          team2OverRate: reportData.team2OverRate?.toString() || '',
        });
      }

      setIncidents(incidentsRes.data.data || []);
      setViolations(violationsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching referee report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      const data = {
        matchId,
        refereeName: reportForm.refereeName,
        matchSummary: reportForm.matchSummary,
        fairPlay: reportForm.fairPlay,
        team1OverRate: reportForm.team1OverRate ? parseFloat(reportForm.team1OverRate) : undefined,
        team2OverRate: reportForm.team2OverRate ? parseFloat(reportForm.team2OverRate) : undefined,
      };

      if (report) {
        await administrationAPI.updateRefereeReport(report.id, data);
      } else {
        await administrationAPI.createRefereeReport(data);
      }

      fetchData();
      alert('Report saved successfully');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report');
    }
  };

  const handleSubmitReport = async () => {
    if (!report) {
      alert('Please save the report first');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this report? It cannot be edited after submission.')) {
      return;
    }

    try {
      await administrationAPI.submitReport(report.id);
      fetchData();
      alert('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!report) {
        alert('Please save the report first');
        return;
      }

      const data = {
        reportId: report.id,
        matchId,
        incidentType: incidentForm.incidentType,
        severity: incidentForm.severity,
        description: incidentForm.description,
        overNumber: parseInt(incidentForm.overNumber),
        playersInvolved: incidentForm.playersInvolved,
        action: incidentForm.action,
      };

      if (editingIncident) {
        await administrationAPI.updateIncident(editingIncident.id, data);
      } else {
        await administrationAPI.recordIncident(data);
      }

      setShowIncidentModal(false);
      setEditingIncident(null);
      setIncidentForm({
        incidentType: 'BALL_TAMPERING',
        severity: 'LOW',
        description: '',
        overNumber: '',
        playersInvolved: '',
        action: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident');
    }
  };

  const handleSaveViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!report) {
        alert('Please save the report first');
        return;
      }

      const data = {
        reportId: report.id,
        matchId,
        playerId: violationForm.playerId,
        violationType: violationForm.violationType,
        description: violationForm.description,
        penalty: violationForm.penalty,
        fineAmount: violationForm.fineAmount ? parseFloat(violationForm.fineAmount) : undefined,
        matchBan: violationForm.matchBan ? parseInt(violationForm.matchBan) : undefined,
      };

      if (editingViolation) {
        await administrationAPI.updateViolation(editingViolation.id, data);
      } else {
        await administrationAPI.recordViolation(data);
      }

      setShowViolationModal(false);
      setEditingViolation(null);
      setViolationForm({
        playerId: '',
        violationType: 'DISSENT',
        description: '',
        penalty: 'WARNING',
        fineAmount: '',
        matchBan: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error saving violation:', error);
      alert('Failed to save violation');
    }
  };

  const openEditIncident = (incident: MatchIncident) => {
    setEditingIncident(incident);
    setIncidentForm({
      incidentType: incident.incidentType,
      severity: incident.severity,
      description: incident.description,
      overNumber: incident.overNumber.toString(),
      playersInvolved: incident.playersInvolved,
      action: incident.action,
    });
    setShowIncidentModal(true);
  };

  const openEditViolation = (violation: CodeViolation) => {
    setEditingViolation(violation);
    setViolationForm({
      playerId: violation.playerId,
      violationType: violation.violationType,
      description: violation.description,
      penalty: violation.penalty,
      fineAmount: violation.fineAmount?.toString() || '',
      matchBan: violation.matchBan?.toString() || '',
    });
    setShowViolationModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPenaltyColor = (penalty: string) => {
    switch (penalty) {
      case 'SUSPENSION': return 'bg-red-100 text-red-800';
      case 'FINE': return 'bg-orange-100 text-orange-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'REPRIMAND': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading referee report...</div>
      </div>
    );
  }

  const isSubmitted = report?.status === 'SUBMITTED';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Match Referee Report</h1>
          {report && (
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {report.status}
              </span>
              {report.submittedAt && (
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(report.submittedAt).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/matches/${matchId}`)}>
          Back to Match
        </Button>
      </div>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Referee Name *</label>
              <input
                type="text"
                value={reportForm.refereeName}
                onChange={(e) => setReportForm({ ...reportForm, refereeName: e.target.value })}
                className="w-full border rounded p-2"
                placeholder="Enter referee name"
                disabled={isSubmitted}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Match Summary *</label>
              <textarea
                value={reportForm.matchSummary}
                onChange={(e) => setReportForm({ ...reportForm, matchSummary: e.target.value })}
                className="w-full border rounded p-2"
                rows={4}
                placeholder="Summarize the match including key events, conditions, and overall assessment"
                disabled={isSubmitted}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team 1 Over Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={reportForm.team1OverRate}
                  onChange={(e) => setReportForm({ ...reportForm, team1OverRate: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 14.5"
                  disabled={isSubmitted}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Team 2 Over Rate</label>
                <input
                  type="number"
                  step="0.1"
                  value={reportForm.team2OverRate}
                  onChange={(e) => setReportForm({ ...reportForm, team2OverRate: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 15.2"
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fairPlay"
                checked={reportForm.fairPlay}
                onChange={(e) => setReportForm({ ...reportForm, fairPlay: e.target.checked })}
                className="rounded"
                disabled={isSubmitted}
              />
              <label htmlFor="fairPlay" className="text-sm font-medium">
                Match played in the spirit of fair play
              </label>
            </div>

            {!isSubmitted && (
              <div className="flex gap-3 justify-end">
                <Button onClick={handleSaveReport}>
                  {report ? 'Update Report' : 'Create Report'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Match Incidents</CardTitle>
          {!isSubmitted && report && (
            <Button onClick={() => setShowIncidentModal(true)}>Add Incident</Button>
          )}
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No incidents recorded</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className="text-sm font-semibold">{incident.incidentType.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-500">Over {incident.overNumber}</span>
                      </div>
                      <p className="text-sm mb-2">{incident.description}</p>
                      <div className="text-sm text-gray-600">
                        <strong>Players Involved:</strong> {incident.playersInvolved}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Action Taken:</strong> {incident.action}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Recorded: {new Date(incident.recordedAt).toLocaleString()}
                      </div>
                    </div>
                    {!isSubmitted && (
                      <Button variant="outline" size="sm" onClick={() => openEditIncident(incident)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Violations Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Code of Conduct Violations</CardTitle>
          {!isSubmitted && report && (
            <Button onClick={() => setShowViolationModal(true)}>Add Violation</Button>
          )}
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No violations recorded</p>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div key={violation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPenaltyColor(violation.penalty)}`}>
                          {violation.penalty}
                        </span>
                        <span className="text-sm font-semibold">{violation.violationType.replace(/_/g, ' ')}</span>
                        {violation.player && (
                          <span className="text-sm text-gray-600">- {violation.player.name}</span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{violation.description}</p>
                      {violation.fineAmount && (
                        <div className="text-sm text-gray-600">
                          <strong>Fine:</strong> ${violation.fineAmount}
                        </div>
                      )}
                      {violation.matchBan && (
                        <div className="text-sm text-gray-600">
                          <strong>Match Ban:</strong> {violation.matchBan} match(es)
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Recorded: {new Date(violation.recordedAt).toLocaleString()}
                      </div>
                    </div>
                    {!isSubmitted && (
                      <Button variant="outline" size="sm" onClick={() => openEditViolation(violation)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Actions */}
      {!isSubmitted && report && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleSaveReport}>
                Save Draft
              </Button>
              <Button onClick={handleSubmitReport} className="bg-green-600 hover:bg-green-700">
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingIncident ? 'Edit' : 'Add'} Incident</h3>
            <form onSubmit={handleSaveIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Incident Type *</label>
                <select
                  value={incidentForm.incidentType}
                  onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="BALL_TAMPERING">Ball Tampering</option>
                  <option value="PITCH_DAMAGE">Pitch Damage</option>
                  <option value="DANGEROUS_PLAY">Dangerous Play</option>
                  <option value="TIME_WASTING">Time Wasting</option>
                  <option value="FIELD_INTRUSION">Field Intrusion</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Severity *</label>
                <select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Over Number *</label>
                <input
                  type="number"
                  min="1"
                  value={incidentForm.overNumber}
                  onChange={(e) => setIncidentForm({ ...incidentForm, overNumber: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 15"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Players Involved *</label>
                <input
                  type="text"
                  value={incidentForm.playersInvolved}
                  onChange={(e) => setIncidentForm({ ...incidentForm, playersInvolved: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., Player A, Player B"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Describe the incident in detail"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Action Taken *</label>
                <textarea
                  value={incidentForm.action}
                  onChange={(e) => setIncidentForm({ ...incidentForm, action: e.target.value })}
                  className="w-full border rounded p-2"
                  rows={2}
                  placeholder="Describe the action taken by officials"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setEditingIncident(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingIncident ? 'Update' : 'Add'} Incident</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingViolation ? 'Edit' : 'Add'} Code Violation</h3>
            <form onSubmit={handleSaveViolation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Player ID *</label>
                <input
                  type="text"
                  value={violationForm.playerId}
                  onChange={(e) => setViolationForm({ ...violationForm, playerId: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="Enter player ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Violation Type *</label>
                <select
                  value={violationForm.violationType}
                  onChange={(e) => setViolationForm({ ...violationForm, violationType: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="DISSENT">Dissent</option>
                  <option value="INAPPROPRIATE_LANGUAGE">Inappropriate Language</option>
                  <option value="AGGRESSIVE_BEHAVIOR">Aggressive Behavior</option>
                  <option value="SLOW_OVER_RATE">Slow Over Rate</option>
                  <option value="UNFAIR_PLAY">Unfair Play</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Penalty *</label>
                <select
                  value={violationForm.penalty}
                  onChange={(e) => setViolationForm({ ...violationForm, penalty: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="WARNING">Warning</option>
                  <option value="REPRIMAND">Reprimand</option>
                  <option value="FINE">Fine</option>
                  <option value="SUSPENSION">Suspension</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={violationForm.description}
                  onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Describe the violation in detail"
                  required
                />
              </div>

              {(violationForm.penalty === 'FINE' || violationForm.penalty === 'SUSPENSION') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fine Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={violationForm.fineAmount}
                      onChange={(e) => setViolationForm({ ...violationForm, fineAmount: e.target.value })}
                      className="w-full border rounded p-2"
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Match Ban (matches)</label>
                    <input
                      type="number"
                      min="0"
                      value={violationForm.matchBan}
                      onChange={(e) => setViolationForm({ ...violationForm, matchBan: e.target.value })}
                      className="w-full border rounded p-2"
                      placeholder="e.g., 2"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowViolationModal(false);
                    setEditingViolation(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingViolation ? 'Update' : 'Add'} Violation</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
