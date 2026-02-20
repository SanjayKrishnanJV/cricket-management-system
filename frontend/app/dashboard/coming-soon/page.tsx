'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ComingSoonPage() {
  const upcomingFeatures = [
    {
      icon: '📱',
      title: 'Mobile App',
      description: 'Native iOS and Android apps for on-the-go management',
      eta: 'Q2 2024',
      status: 'In Development',
    },
    {
      icon: '🎥',
      title: 'Video Highlights',
      description: 'Auto-generate match highlights with AI',
      eta: 'Q2 2024',
      status: 'Planning',
    },
    {
      icon: '🏆',
      title: 'Fantasy Cricket Full Version',
      description: 'Complete fantasy cricket with private leagues',
      eta: 'Q1 2024',
      status: 'In Development',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics Dashboard',
      description: 'Deep dive into player and team statistics',
      eta: 'Q2 2024',
      status: 'Planning',
    },
    {
      icon: '🌍',
      title: 'Multi-Language Support',
      description: 'Support for 10+ languages',
      eta: 'Q3 2024',
      status: 'Planning',
    },
    {
      icon: '🔔',
      title: 'Push Notifications',
      description: 'Real-time push notifications for mobile',
      eta: 'Q2 2024',
      status: 'Planning',
    },
    {
      icon: '📈',
      title: 'Player Market Value',
      description: 'Dynamic player valuations based on performance',
      eta: 'Q2 2024',
      status: 'Research',
    },
    {
      icon: '🎯',
      title: 'AI Match Predictor',
      description: 'ML-based match outcome predictions',
      eta: 'Q3 2024',
      status: 'Research',
    },
    {
      icon: '👥',
      title: 'Social Features',
      description: 'Follow players, teams, and share content',
      eta: 'Q3 2024',
      status: 'Planning',
    },
    {
      icon: '📺',
      title: 'Live Streaming Integration',
      description: 'Stream matches directly from the platform',
      eta: 'Q4 2024',
      status: 'Research',
    },
    {
      icon: '🏅',
      title: 'Coaching Module',
      description: 'Tools for coaches to track player development',
      eta: 'Q3 2024',
      status: 'Planning',
    },
    {
      icon: '💳',
      title: 'Payment Gateway',
      description: 'Handle tournament fees and prize money',
      eta: 'Q4 2024',
      status: 'Planning',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Development':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Planning':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Research':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🚀</span>
          Coming Soon
        </h1>
        <p className="text-gray-600 mt-2">
          Exciting features and improvements on the horizon
        </p>
      </div>

      {/* Banner */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
        <CardContent className="py-8 text-center">
          <h2 className="text-3xl font-bold mb-4">✨ Big Things Are Coming!</h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            We're constantly working on new features to make Cricket Management System
            the best cricket platform in the world. Here's what we're building next.
          </p>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📅 Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingFeatures.map((feature, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{feature.icon}</div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(
                      feature.status
                    )}`}
                  >
                    {feature.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Feature */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-2xl">💡 Have an Idea?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            We'd love to hear your suggestions! If you have a feature request or idea
            to improve Cricket Management System, please let us know.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/contact'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📧 Contact Us
            </button>
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              🐙 GitHub Issues
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ℹ️ Status Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                In Development
              </span>
              <span className="text-sm text-gray-600">Actively being built</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                Planning
              </span>
              <span className="text-sm text-gray-600">Design phase</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                Research
              </span>
              <span className="text-sm text-gray-600">Exploring feasibility</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
