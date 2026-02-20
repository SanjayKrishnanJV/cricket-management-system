'use client';

import { useEffect, useState } from 'react';
import { MatchPredictionCard } from '@/components/ai/MatchPredictionCard';
import { PerformancePredictionCard } from '@/components/ai/PerformancePredictionCard';
import { TeamSuggestionCard } from '@/components/ai/TeamSuggestionCard';
import { InjuryRiskCard } from '@/components/ai/InjuryRiskCard';
import { matchAPI, playerAPI, teamAPI } from '@/lib/api';

export default function AITestPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchRes, playerRes, teamRes] = await Promise.all([
        matchAPI.getAll(),
        playerAPI.getAll(),
        teamAPI.getAll(),
      ]);

      const matchData = matchRes.data.data || [];
      const playerData = playerRes.data.data || [];
      const teamData = teamRes.data.data || [];

      setMatches(matchData);
      setPlayers(playerData);
      setTeams(teamData);

      // Auto-select first available items
      if (matchData.length > 0) setSelectedMatch(matchData[0].id);
      if (playerData.length > 0) setSelectedPlayer(playerData[0].id);
      if (teamData.length > 0) setSelectedTeam(teamData[0].id);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const getMatchName = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    return match ? `${match.homeTeam?.name || 'Team 1'} vs ${match.awayTeam?.name || 'Team 2'}` : 'Select Match';
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Select Player';
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Select Team';
  };

  const selectedMatchObj = matches.find(m => m.id === selectedMatch);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🤖 AI Insights & Predictions</h1>
        <p className="text-gray-600">
          Access all AI-powered analytics and predictions in one place. Select match, player, and team data to generate insights.
        </p>
      </div>

      {/* Data Selectors */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📊 Select Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Match Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match ({matches.length} available)
            </label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a match</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.homeTeam?.name || 'Team 1'} vs {match.awayTeam?.name || 'Team 2'} ({match.status})
                </option>
              ))}
            </select>
          </div>

          {/* Player Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player ({players.length} available)
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.role}) - {player.totalMatches} matches
                </option>
              ))}
            </select>
          </div>

          {/* Team Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team ({teams.length} available)
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Feature 1: Match Prediction */}
      {selectedMatch && selectedMatchObj && (
        <div>
          <h2 className="text-2xl font-bold mb-4">1️⃣ Match Prediction</h2>
          <MatchPredictionCard
            matchId={selectedMatch}
            team1Name={selectedMatchObj.homeTeam?.name || 'Team 1'}
            team2Name={selectedMatchObj.awayTeam?.name || 'Team 2'}
          />
        </div>
      )}

      {/* AI Feature 2: Performance Prediction */}
      {selectedMatch && selectedPlayer && (
        <div>
          <h2 className="text-2xl font-bold mb-4">2️⃣ Performance Prediction</h2>
          <PerformancePredictionCard
            matchId={selectedMatch}
            playerId={selectedPlayer}
            playerName={getPlayerName(selectedPlayer)}
          />
        </div>
      )}

      {/* AI Feature 3: Team Suggestion */}
      {selectedMatch && selectedTeam && (
        <div>
          <h2 className="text-2xl font-bold mb-4">3️⃣ Optimal Team Selection</h2>
          <TeamSuggestionCard
            matchId={selectedMatch}
            teamId={selectedTeam}
            teamName={getTeamName(selectedTeam)}
          />
        </div>
      )}

      {/* AI Feature 4: Injury Risk */}
      {selectedPlayer && (
        <div>
          <h2 className="text-2xl font-bold mb-4">4️⃣ Injury Risk Assessment</h2>
          <InjuryRiskCard
            playerId={selectedPlayer}
            playerName={getPlayerName(selectedPlayer)}
          />
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">📋 Database Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Matches:</p>
            <p className="text-2xl font-bold">{matches.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Players:</p>
            <p className="text-2xl font-bold">{players.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Teams:</p>
            <p className="text-2xl font-bold">{teams.length}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 text-green-900">💡 How to Use</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
          <li>Select a match, player, and team from the dropdowns above</li>
          <li>Scroll down to explore all 4 AI-powered features</li>
          <li>Click "Generate Prediction" / "Generate Suggestion" / "Assess Injury Risk" to get insights</li>
          <li>All predictions are based on real historical data from your database</li>
          <li>For accurate predictions, ensure players/teams have sufficient match history</li>
          <li>Predictions update in real-time as new match data is recorded</li>
        </ol>
      </div>
    </div>
  );
}
