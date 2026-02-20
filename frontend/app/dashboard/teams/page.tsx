'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams');
      const data = await response.json();
      setTeams(data.data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading teams...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-gray-600">View all cricket teams</p>
        </div>
        <Link
          href="/dashboard/teams/new"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          ➕ Create Team
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {team.logoUrl && (
                      <img
                        src={team.logoUrl}
                        alt={`${team.name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{team.name}</span>
                  </div>
                  <span className="text-sm font-normal text-gray-600">({team.shortName})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Owner:</span>
                    <span className="font-medium">{team.owner?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="font-medium">
                      ₹{(team.budget / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Squad Size:</span>
                    <span className="font-medium">{team.contracts?.length || 0} players</span>
                  </div>
                  {team.teamStats && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm font-semibold mb-2">Statistics</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-600">Played</p>
                            <p className="font-bold">{team.teamStats.totalMatches}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Won</p>
                            <p className="font-bold text-green-600">{team.teamStats.matchesWon}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Lost</p>
                            <p className="font-bold text-red-600">{team.teamStats.matchesLost}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-4 text-blue-600 text-sm font-medium">
                    Click to view details →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No teams found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
