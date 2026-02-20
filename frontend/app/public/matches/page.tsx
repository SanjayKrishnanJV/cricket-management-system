'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function PublicMatchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            🏏 Cricket Management
          </h1>
          <p className="text-xl opacity-90">
            Follow live matches, catch up on history, and stay updated with upcoming fixtures
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Live Matches */}
          <Link href="/public/matches/live">
            <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-red-200">
              <CardHeader className="bg-gradient-to-br from-red-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </div>
                  <CardTitle className="text-2xl">Live Matches</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-7xl mb-4">🔴</div>
                  <p className="text-gray-600 mb-4">
                    Watch cricket action happening right now with live scores and ball-by-ball commentary
                  </p>
                  <span className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    View Live Matches →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Upcoming Matches */}
          <Link href="/public/matches/upcoming">
            <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-purple-200">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardTitle className="text-2xl">Upcoming Matches</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-7xl mb-4">📅</div>
                  <p className="text-gray-600 mb-4">
                    Plan ahead and never miss a match with our complete schedule of upcoming fixtures
                  </p>
                  <span className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                    View Schedule →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Match History */}
          <Link href="/public/matches/history">
            <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-green-200">
              <CardHeader className="bg-gradient-to-br from-green-50 to-teal-50">
                <CardTitle className="text-2xl">Match History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-7xl mb-4">📜</div>
                  <p className="text-gray-600 mb-4">
                    Relive past matches with complete scorecards, statistics, and match summaries
                  </p>
                  <span className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Browse History →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Real-time Updates</h3>
                <p className="text-sm text-gray-600">Live scores updated every 10 seconds</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Detailed Statistics</h3>
                <p className="text-sm text-gray-600">Complete batting and bowling figures</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📝</div>
                <h3 className="font-semibold mb-1">Ball-by-Ball Commentary</h3>
                <p className="text-sm text-gray-600">Follow every delivery with live commentary</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-semibold mb-1">Match Results</h3>
                <p className="text-sm text-gray-600">Instant results and highlights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/80 text-sm">
          <p>© 2026 Cricket Management System • All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
