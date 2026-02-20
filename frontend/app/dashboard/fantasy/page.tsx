'use client';

import { useState } from 'react';

export default function FantasyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🏆 Fantasy Cricket</h1>
        <p className="text-gray-600">Create your fantasy team and compete with others</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-12 text-center text-white mb-8">
        <h2 className="text-3xl font-bold mb-4">🚀 Coming Soon!</h2>
        <p className="text-lg mb-6">
          Fantasy Cricket leagues are being set up. Stay tuned for an amazing experience!
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Create League
          </button>
          <button className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
            Join League
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">Create Leagues</h3>
          <p className="text-gray-600">Set up public or private fantasy leagues with your friends</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">Build Your Team</h3>
          <p className="text-gray-600">Select 11 players within your budget and compete for points</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
          <p className="text-gray-600">Top the leaderboard and earn XP, achievements, and glory</p>
        </div>
      </div>
    </div>
  );
}
