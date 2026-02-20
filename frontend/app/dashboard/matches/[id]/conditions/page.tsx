'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { administrationAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface WeatherRecord {
  id: string;
  matchId: string;
  condition: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainfall?: number;
  dlsAffected: boolean;
  recordedAt: string;
}

interface PitchRecord {
  id: string;
  matchId: string;
  condition: string;
  grassCoverage?: number;
  hardness?: number;
  wearLevel?: number;
  cracks?: number;
  recordedAt: string;
}

interface DLSCalculation {
  id: string;
  matchId: string;
  inningsId: string;
  originalTarget: number;
  revisedTarget: number;
  oversLost: number;
  wicketsLost: number;
  resourcePercentage: number;
  calculatedAt: string;
}

export default function ConditionsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [weatherRecords, setWeatherRecords] = useState<WeatherRecord[]>([]);
  const [pitchRecords, setPitchRecords] = useState<PitchRecord[]>([]);
  const [dlsCalculations, setDlsCalculations] = useState<DLSCalculation[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showDLSModal, setShowDLSModal] = useState(false);

  // Form states
  const [weatherForm, setWeatherForm] = useState({
    condition: 'SUNNY',
    temperature: '',
    humidity: '',
    windSpeed: '',
    rainfall: '',
    dlsAffected: false,
  });

  const [pitchForm, setPitchForm] = useState({
    condition: 'EXCELLENT',
    grassCoverage: '',
    hardness: '',
    wearLevel: '',
    cracks: '',
  });

  const [dlsForm, setDlsForm] = useState({
    inningsId: '',
    originalTarget: '',
    oversLost: '',
    wicketsLost: '',
  });

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [weatherRes, pitchRes, dlsRes, currentWeatherRes] = await Promise.all([
        administrationAPI.getWeatherByMatch(matchId),
        administrationAPI.getPitchConditions(matchId),
        administrationAPI.getDLSCalculations(matchId),
        administrationAPI.getCurrentWeather(matchId),
      ]);

      setWeatherRecords(weatherRes.data.data || []);
      setPitchRecords(pitchRes.data.data || []);
      setDlsCalculations(dlsRes.data.data || []);
      setCurrentWeather(currentWeatherRes.data.data || null);
    } catch (error) {
      console.error('Error fetching conditions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.recordWeather({
        matchId,
        condition: weatherForm.condition,
        temperature: weatherForm.temperature ? parseFloat(weatherForm.temperature) : undefined,
        humidity: weatherForm.humidity ? parseInt(weatherForm.humidity) : undefined,
        windSpeed: weatherForm.windSpeed ? parseFloat(weatherForm.windSpeed) : undefined,
        rainfall: weatherForm.rainfall ? parseFloat(weatherForm.rainfall) : undefined,
        dlsAffected: weatherForm.dlsAffected,
      });

      setShowWeatherModal(false);
      setWeatherForm({
        condition: 'SUNNY',
        temperature: '',
        humidity: '',
        windSpeed: '',
        rainfall: '',
        dlsAffected: false,
      });
      fetchData();
    } catch (error) {
      console.error('Error recording weather:', error);
      alert('Failed to record weather');
    }
  };

  const handleRecordPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.recordPitchCondition({
        matchId,
        condition: pitchForm.condition,
        grassCoverage: pitchForm.grassCoverage ? parseInt(pitchForm.grassCoverage) : undefined,
        hardness: pitchForm.hardness ? parseInt(pitchForm.hardness) : undefined,
        wearLevel: pitchForm.wearLevel ? parseInt(pitchForm.wearLevel) : undefined,
        cracks: pitchForm.cracks ? parseInt(pitchForm.cracks) : undefined,
      });

      setShowPitchModal(false);
      setPitchForm({
        condition: 'EXCELLENT',
        grassCoverage: '',
        hardness: '',
        wearLevel: '',
        cracks: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error recording pitch condition:', error);
      alert('Failed to record pitch condition');
    }
  };

  const handleCalculateDLS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await administrationAPI.calculateDLS({
        matchId,
        inningsId: dlsForm.inningsId,
        originalTarget: parseInt(dlsForm.originalTarget),
        oversLost: parseFloat(dlsForm.oversLost),
        wicketsLost: parseInt(dlsForm.wicketsLost),
      });

      setShowDLSModal(false);
      setDlsForm({
        inningsId: '',
        originalTarget: '',
        oversLost: '',
        wicketsLost: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error calculating DLS:', error);
      alert('Failed to calculate DLS');
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'SUNNY': return '☀️';
      case 'CLOUDY': return '☁️';
      case 'OVERCAST': return '🌥️';
      case 'RAINY': return '🌧️';
      case 'DRIZZLE': return '🌦️';
      case 'STORMY': return '⛈️';
      default: return '🌤️';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'AVERAGE': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-orange-100 text-orange-800';
      case 'UNPLAYABLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading conditions data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weather & Pitch Conditions</h1>
        <Button variant="outline" onClick={() => router.push(`/dashboard/matches/${matchId}`)}>
          Back to Match
        </Button>
      </div>

      {/* Current Weather Display */}
      {currentWeather && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon(currentWeather.condition)} Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Condition</div>
                <div className="text-lg font-semibold">{currentWeather.condition}</div>
              </div>
              {currentWeather.temperature && (
                <div>
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-lg font-semibold">{currentWeather.temperature}°C</div>
                </div>
              )}
              {currentWeather.humidity && (
                <div>
                  <div className="text-sm text-gray-600">Humidity</div>
                  <div className="text-lg font-semibold">{currentWeather.humidity}%</div>
                </div>
              )}
              {currentWeather.windSpeed && (
                <div>
                  <div className="text-sm text-gray-600">Wind Speed</div>
                  <div className="text-lg font-semibold">{currentWeather.windSpeed} km/h</div>
                </div>
              )}
              {currentWeather.rainfall && (
                <div>
                  <div className="text-sm text-gray-600">Rainfall</div>
                  <div className="text-lg font-semibold">{currentWeather.rainfall} mm</div>
                </div>
              )}
              {currentWeather.dlsAffected && (
                <div className="col-span-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ⚠️ DLS Affected
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weather History</CardTitle>
          <Button onClick={() => setShowWeatherModal(true)}>Record Weather</Button>
        </CardHeader>
        <CardContent>
          {weatherRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No weather records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Condition</th>
                    <th className="text-left p-3">Temperature</th>
                    <th className="text-left p-3">Humidity</th>
                    <th className="text-left p-3">Wind</th>
                    <th className="text-left p-3">Rainfall</th>
                    <th className="text-left p-3">DLS</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(record.recordedAt).toLocaleString()}</td>
                      <td className="p-3">
                        {getWeatherIcon(record.condition)} {record.condition}
                      </td>
                      <td className="p-3">{record.temperature ? `${record.temperature}°C` : '-'}</td>
                      <td className="p-3">{record.humidity ? `${record.humidity}%` : '-'}</td>
                      <td className="p-3">{record.windSpeed ? `${record.windSpeed} km/h` : '-'}</td>
                      <td className="p-3">{record.rainfall ? `${record.rainfall} mm` : '-'}</td>
                      <td className="p-3">
                        {record.dlsAffected && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Yes
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pitch Conditions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pitch Conditions</CardTitle>
          <Button onClick={() => setShowPitchModal(true)}>Assess Pitch</Button>
        </CardHeader>
        <CardContent>
          {pitchRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pitch assessments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Condition</th>
                    <th className="text-left p-3">Grass Coverage</th>
                    <th className="text-left p-3">Hardness</th>
                    <th className="text-left p-3">Wear Level</th>
                    <th className="text-left p-3">Cracks</th>
                  </tr>
                </thead>
                <tbody>
                  {pitchRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(record.recordedAt).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(record.condition)}`}>
                          {record.condition}
                        </span>
                      </td>
                      <td className="p-3">{record.grassCoverage ? `${record.grassCoverage}%` : '-'}</td>
                      <td className="p-3">{record.hardness ? `${record.hardness}/10` : '-'}</td>
                      <td className="p-3">{record.wearLevel ? `${record.wearLevel}%` : '-'}</td>
                      <td className="p-3">{record.cracks ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DLS Calculations Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DLS Calculations</CardTitle>
          <Button onClick={() => setShowDLSModal(true)}>Calculate DLS</Button>
        </CardHeader>
        <CardContent>
          {dlsCalculations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No DLS calculations yet</p>
          ) : (
            <div className="space-y-4">
              {dlsCalculations.map((calc) => (
                <div key={calc.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Original Target</div>
                      <div className="text-lg font-semibold">{calc.originalTarget}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Revised Target</div>
                      <div className="text-lg font-semibold text-blue-600">{calc.revisedTarget}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Overs Lost</div>
                      <div className="text-lg font-semibold">{calc.oversLost}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Wickets Lost</div>
                      <div className="text-lg font-semibold">{calc.wicketsLost}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Resources</div>
                      <div className="text-lg font-semibold">{calc.resourcePercentage}%</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Calculated at: {new Date(calc.calculatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Recording Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Record Weather</h3>
            <form onSubmit={handleRecordWeather} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Condition *</label>
                <select
                  value={weatherForm.condition}
                  onChange={(e) => setWeatherForm({ ...weatherForm, condition: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="SUNNY">Sunny</option>
                  <option value="CLOUDY">Cloudy</option>
                  <option value="OVERCAST">Overcast</option>
                  <option value="RAINY">Rainy</option>
                  <option value="DRIZZLE">Drizzle</option>
                  <option value="STORMY">Stormy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weatherForm.temperature}
                  onChange={(e) => setWeatherForm({ ...weatherForm, temperature: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 28.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Humidity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weatherForm.humidity}
                  onChange={(e) => setWeatherForm({ ...weatherForm, humidity: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Wind Speed (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weatherForm.windSpeed}
                  onChange={(e) => setWeatherForm({ ...weatherForm, windSpeed: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rainfall (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weatherForm.rainfall}
                  onChange={(e) => setWeatherForm({ ...weatherForm, rainfall: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 2.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dlsAffected"
                  checked={weatherForm.dlsAffected}
                  onChange={(e) => setWeatherForm({ ...weatherForm, dlsAffected: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="dlsAffected" className="text-sm font-medium">
                  DLS Affected (requires calculation)
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setShowWeatherModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Weather</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pitch Assessment Modal */}
      {showPitchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Assess Pitch Condition</h3>
            <form onSubmit={handleRecordPitch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Overall Condition *</label>
                <select
                  value={pitchForm.condition}
                  onChange={(e) => setPitchForm({ ...pitchForm, condition: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="AVERAGE">Average</option>
                  <option value="POOR">Poor</option>
                  <option value="UNPLAYABLE">Unplayable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grass Coverage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pitchForm.grassCoverage}
                  onChange={(e) => setPitchForm({ ...pitchForm, grassCoverage: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hardness (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={pitchForm.hardness}
                  onChange={(e) => setPitchForm({ ...pitchForm, hardness: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Wear Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pitchForm.wearLevel}
                  onChange={(e) => setPitchForm({ ...pitchForm, wearLevel: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Number of Cracks</label>
                <input
                  type="number"
                  min="0"
                  value={pitchForm.cracks}
                  onChange={(e) => setPitchForm({ ...pitchForm, cracks: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 3"
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setShowPitchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Assessment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DLS Calculator Modal */}
      {showDLSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">DLS Calculator</h3>
            <form onSubmit={handleCalculateDLS} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <strong>Note:</strong> This calculator uses a simplified DLS formula. For official matches, use the ICC DLS calculator.
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Innings ID *</label>
                <input
                  type="text"
                  value={dlsForm.inningsId}
                  onChange={(e) => setDlsForm({ ...dlsForm, inningsId: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="Enter innings ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Original Target *</label>
                <input
                  type="number"
                  min="1"
                  value={dlsForm.originalTarget}
                  onChange={(e) => setDlsForm({ ...dlsForm, originalTarget: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 250"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Overs Lost *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={dlsForm.oversLost}
                  onChange={(e) => setDlsForm({ ...dlsForm, oversLost: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 10.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Wickets Lost *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={dlsForm.wicketsLost}
                  onChange={(e) => setDlsForm({ ...dlsForm, wicketsLost: e.target.value })}
                  className="w-full border rounded p-2"
                  placeholder="e.g., 3"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setShowDLSModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Calculate</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
