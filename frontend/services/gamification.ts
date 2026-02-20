const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Achievement Service
export const achievementService = {
  getAllAchievements: async () => {
    const res = await fetch(`${API_URL}/achievements`);
    return res.json();
  },

  getPlayerAchievements: async (playerId: string) => {
    const res = await fetch(`${API_URL}/achievements/player/${playerId}`);
    return res.json();
  },

  getPlayerAchievementStats: async (playerId: string) => {
    const res = await fetch(`${API_URL}/achievements/player/${playerId}/stats`);
    return res.json();
  },

  seedAchievements: async (token: string) => {
    const res = await fetch(`${API_URL}/achievements/seed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },
};

// Leaderboard Service
export const leaderboardService = {
  getLeaderboard: async (type: string, period: string = 'ALL_TIME', tournamentId?: string, limit: number = 50) => {
    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
      ...(tournamentId && { tournamentId }),
    });
    const res = await fetch(`${API_URL}/leaderboard/${type}?${params}`);
    return res.json();
  },

  getPlayerRank: async (playerId: string, type: string, tournamentId?: string) => {
    const params = new URLSearchParams({
      ...(tournamentId && { tournamentId }),
    });
    const res = await fetch(`${API_URL}/leaderboard/player/${playerId}/rank/${type}?${params}`);
    return res.json();
  },

  recalculateLeaderboards: async (token: string) => {
    const res = await fetch(`${API_URL}/leaderboard/recalculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },
};

// Rewards Service
export const rewardsService = {
  getUserProfile: async (userId: string) => {
    const res = await fetch(`${API_URL}/rewards/profile/${userId}`);
    return res.json();
  },

  updateLoginStreak: async (token: string) => {
    const res = await fetch(`${API_URL}/rewards/streak`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.json();
  },

  setTitle: async (token: string, title: string) => {
    const res = await fetch(`${API_URL}/rewards/title`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    return res.json();
  },

  getLevelLeaderboard: async (limit: number = 50) => {
    const res = await fetch(`${API_URL}/rewards/leaderboard/levels?limit=${limit}`);
    return res.json();
  },

  getXPLeaderboard: async (limit: number = 50) => {
    const res = await fetch(`${API_URL}/rewards/leaderboard/xp?limit=${limit}`);
    return res.json();
  },
};

// Challenge Service
export const challengeService = {
  getActiveChallenges: async (target: string = 'PLAYER') => {
    const res = await fetch(`${API_URL}/challenges/active?target=${target}`);
    return res.json();
  },

  getPlayerProgress: async (playerId: string) => {
    const res = await fetch(`${API_URL}/challenges/player/${playerId}/progress`);
    return res.json();
  },

  getUserProgress: async (token: string) => {
    const res = await fetch(`${API_URL}/challenges/user/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  claimReward: async (token: string, progressId: string) => {
    const res = await fetch(`${API_URL}/challenges/progress/${progressId}/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  generateDailyChallenges: async (token: string) => {
    const res = await fetch(`${API_URL}/challenges/daily/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },
};

// Fantasy Service
export const fantasyService = {
  createLeague: async (token: string, data: {
    name: string;
    type: string;
    tournamentId: string;
    maxTeams?: number;
    teamBudget?: number;
    maxPlayers?: number;
  }) => {
    const res = await fetch(`${API_URL}/fantasy/leagues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  joinLeague: async (token: string, joinCode: string) => {
    const res = await fetch(`${API_URL}/fantasy/leagues/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ joinCode }),
    });
    return res.json();
  },

  createTeam: async (token: string, data: {
    leagueId: string;
    name: string;
    players: string[];
    captain?: string;
    viceCaptain?: string;
  }) => {
    const res = await fetch(`${API_URL}/fantasy/teams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getLeagueLeaderboard: async (leagueId: string) => {
    const res = await fetch(`${API_URL}/fantasy/leagues/${leagueId}/leaderboard`);
    return res.json();
  },

  getPlayerValues: async (tournamentId: string) => {
    const res = await fetch(`${API_URL}/fantasy/values/${tournamentId}`);
    return res.json();
  },

  initializePlayerValues: async (token: string, tournamentId: string) => {
    const res = await fetch(`${API_URL}/fantasy/values/${tournamentId}/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  calculateMatchPoints: async (token: string, matchId: string) => {
    const res = await fetch(`${API_URL}/fantasy/matches/${matchId}/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  getTeamDetails: async (teamId: string) => {
    const res = await fetch(`${API_URL}/fantasy/teams/${teamId}`);
    return res.json();
  },
};
