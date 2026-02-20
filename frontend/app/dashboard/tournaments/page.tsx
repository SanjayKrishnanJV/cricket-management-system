'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournaments');
      const data = await response.json();
      setTournaments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading tournaments...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournaments</h1>
          <p className="text-gray-600">Browse all cricket tournaments</p>
        </div>
        <Link
          href="/dashboard/tournaments/new"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          ➕ Create Tournament
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} href={`/dashboard/tournaments/${tournament.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
                <p className="text-sm text-gray-600">{tournament.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="font-semibold">{tournament.format}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{tournament.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teams</p>
                    <p className="font-semibold">{tournament.teams?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Matches</p>
                    <p className="font-semibold">{tournament.matches?.length || 0}</p>
                  </div>
                </div>

                {tournament.prizePool && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Prize Pool</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(tournament.prizePool / 10000000).toFixed(2)} Crore
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Dates</p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Start:</span>{' '}
                      <span className="font-medium">
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">End:</span>{' '}
                      <span className="font-medium">
                        {new Date(tournament.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Click to view details →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {tournaments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tournaments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
