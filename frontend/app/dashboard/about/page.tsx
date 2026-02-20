'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">📖</span>
          About Us
        </h1>
        <p className="text-gray-600 mt-2">
          Learn more about Cricket Management System
        </p>
      </div>

      {/* Mission */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-2xl">🎯 Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-lg leading-relaxed">
            To provide the most comprehensive and user-friendly cricket management platform
            that empowers cricket enthusiasts, teams, and tournament organizers to manage
            their cricket activities efficiently and effectively.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">✨ What We Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="text-3xl">🏏</div>
              <h3 className="font-bold text-lg">Complete Management</h3>
              <p className="text-gray-600">
                Manage players, teams, tournaments, and matches all in one place
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">⚡</div>
              <h3 className="font-bold text-lg">Live Scoring</h3>
              <p className="text-gray-600">
                Real-time ball-by-ball scoring with live updates and commentary
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">📊</div>
              <h3 className="font-bold text-lg">Advanced Analytics</h3>
              <p className="text-gray-600">
                Comprehensive statistics and insights for players and teams
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">🎮</div>
              <h3 className="font-bold text-lg">Gamification</h3>
              <p className="text-gray-600">
                Achievements, leaderboards, challenges, and fantasy cricket
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">🤖</div>
              <h3 className="font-bold text-lg">AI Features</h3>
              <p className="text-gray-600">
                Smart predictions, player recommendations, and match insights
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">💰</div>
              <h3 className="font-bold text-lg">Auction System</h3>
              <p className="text-gray-600">
                Conduct player auctions with real-time bidding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-2xl">💻 Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-bold text-lg mb-3">Frontend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Next.js 14 (App Router)</li>
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Socket.IO Client</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Backend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Node.js & Express</li>
                <li>• TypeScript</li>
                <li>• Prisma ORM</li>
                <li>• PostgreSQL</li>
                <li>• Socket.IO</li>
                <li>• node-cron</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ℹ️ Version Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">1.0.0</div>
              <div className="text-sm text-gray-600 mt-2">Current Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">2024.02</div>
              <div className="text-sm text-gray-600 mt-2">Build</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600 mt-2">Free & Open</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
