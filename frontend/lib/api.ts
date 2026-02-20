import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { email?: string; name?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
  resetPassword: (userId: string, newPassword: string) =>
    api.post('/auth/reset-password', { userId, newPassword }),
};

export const userAPI = {
  getAll: () => api.get('/auth/users'),
  getById: (id: string) => api.get(`/auth/users/${id}`),
  update: (id: string, data: any) => api.put(`/auth/users/${id}`, data),
  delete: (id: string) => api.delete(`/auth/users/${id}`),
};

export const roleAPI = {
  getAll: () => api.get('/roles'),
  getById: (id: string) => api.get(`/roles/${id}`),
  create: (data: any) => api.post('/roles', data),
  update: (id: string, data: any) => api.put(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
  getAllPermissions: () => api.get('/roles/permissions/all'),
  assignToUser: (userId: string, roleId: string) =>
    api.post('/roles/assign', { userId, roleId }),
  removeFromUser: (userId: string, roleId: string) =>
    api.post('/roles/remove', { userId, roleId }),
  getUserRoles: (userId: string) => api.get(`/roles/user/${userId}`),
};

export const playerAPI = {
  getAll: (filters?: any) => api.get('/players', { params: filters }),
  getById: (id: string) => api.get(`/players/${id}`),
  create: (data: any) => api.post('/players', data),
  update: (id: string, data: any) => api.put(`/players/${id}`, data),
  delete: (id: string) => api.delete(`/players/${id}`),
  getAnalytics: (id: string) => api.get(`/players/${id}/analytics`),
};

export const teamAPI = {
  getAll: () => api.get('/teams'),
  getById: (id: string) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  getSquad: (id: string) => api.get(`/teams/${id}/squad`),
  addPlayer: (id: string, playerId: string, amount: number) =>
    api.post(`/teams/${id}/players`, { playerId, amount }),
  removePlayer: (teamId: string, contractId: string) =>
    api.delete(`/teams/${teamId}/players/${contractId}`),
  setCaptain: (id: string, playerId: string | null) =>
    api.post(`/teams/${id}/captain`, { playerId }),
  setViceCaptain: (id: string, playerId: string | null) =>
    api.post(`/teams/${id}/vice-captain`, { playerId }),
};

export const tournamentAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id: string) => api.get(`/tournaments/${id}`),
  create: (data: any) => api.post('/tournaments', data),
  update: (id: string, data: any) => api.put(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
  addTeam: (id: string, teamId: string) =>
    api.post(`/tournaments/${id}/teams`, { teamId }),
  generateFixtures: (id: string) =>
    api.post(`/tournaments/${id}/generate-fixtures`),
  getPointsTable: (id: string) => api.get(`/tournaments/${id}/points-table`),
  scheduleMatches: (id: string) => api.post(`/tournaments/${id}/schedule-matches`),
  schedulePlayoffs: (id: string) => api.post(`/tournaments/${id}/schedule-playoffs`),
  getStandings: (id: string) => api.get(`/tournaments/${id}/standings`),
};

export const matchAPI = {
  getAll: (filters?: any) => api.get('/matches', { params: filters }),
  getById: (id: string) => api.get(`/matches/${id}`),
  create: (data: any) => api.post('/matches', data),
  update: (id: string, data: any) => api.put(`/matches/${id}`, data),
  delete: (id: string) => api.delete(`/matches/${id}`),
  cancel: (id: string) => api.post(`/matches/${id}/cancel`),
  recordToss: (id: string, tossWinnerId: string, tossDecision: string) =>
    api.post(`/matches/${id}/toss`, { tossWinnerId, tossDecision }),
  startInnings: (id: string, inningsNumber: number) =>
    api.post(`/matches/${id}/innings`, { inningsNumber }),
  recordBall: (id: string, data: any) => api.post(`/matches/${id}/ball`, data),
  completeInnings: (id: string, inningsId: string) =>
    api.post(`/matches/${id}/complete-innings`, { inningsId }),
  completeMatch: (id: string) => api.post(`/matches/${id}/complete`),
  getLiveScore: (id: string) => api.get(`/matches/${id}/live`),
};

export const auctionAPI = {
  getAvailablePlayers: () => api.get('/auction/available-players'),
  getCurrentBids: (playerId: string) => api.get(`/auction/${playerId}/bids`),
  getHighestBid: (playerId: string) =>
    api.get(`/auction/${playerId}/highest-bid`),
  placeBid: (playerId: string, amount: number) =>
    api.post('/auction/bid', { playerId, amount }),
  sellPlayer: (playerId: string) => api.post(`/auction/${playerId}/sell`),
  resetAuction: (playerId: string) =>
    api.delete(`/auction/${playerId}/reset`),
};

export const analyticsAPI = {
  getMatchAnalytics: (matchId: string) =>
    api.get(`/analytics/match/${matchId}`),
  getPlayerAnalytics: (playerId: string) =>
    api.get(`/analytics/player/${playerId}`),
  getTeamAnalytics: (teamId: string) => api.get(`/analytics/team/${teamId}`),
  getTournamentAnalytics: (tournamentId: string) =>
    api.get(`/analytics/tournament/${tournamentId}`),
  // Advanced Analytics
  getManhattan: (matchId: string) => api.get(`/analytics/match/${matchId}/manhattan`),
  getWorm: (matchId: string) => api.get(`/analytics/match/${matchId}/worm`),
  getPartnerships: (matchId: string) => api.get(`/analytics/match/${matchId}/partnerships`),
  getPhases: (matchId: string) => api.get(`/analytics/match/${matchId}/phases`),
};

export const featuresAPI = {
  // Player Features
  getPlayerMilestones: (playerId: string) =>
    api.get(`/features/players/${playerId}/milestones`),
  comparePlayers: (player1Id: string, player2Id: string) =>
    api.get(`/features/players/compare?player1Id=${player1Id}&player2Id=${player2Id}`),

  // Tournament Features
  getTournamentAwards: (tournamentId: string) =>
    api.get(`/features/tournaments/${tournamentId}/awards`),

  // Team Features
  getHeadToHead: (team1Id: string, team2Id: string) =>
    api.get(`/features/teams/head-to-head?team1Id=${team1Id}&team2Id=${team2Id}`),

  // Match Features
  getMatchPrediction: (matchId: string) =>
    api.get(`/features/matches/${matchId}/prediction`),
  getFantasyPoints: (matchId: string) =>
    api.get(`/features/matches/${matchId}/fantasy-points`),

  // Venue Features
  getVenueStatistics: (venue: string) =>
    api.get(`/features/venues/${encodeURIComponent(venue)}/statistics`),
};

export const visualizationAPI = {
  // Wagon Wheel
  getWagonWheel: (matchId: string, filters?: {
    batsmanId?: string;
    bowlerId?: string;
    inningsNumber?: number;
    minRuns?: number;
  }) => api.get(`/analytics/matches/${matchId}/wagon-wheel`, { params: filters }),

  // Pitch Map
  getPitchMap: (matchId: string, filters?: {
    bowlerId?: string;
    batsmanId?: string;
    inningsNumber?: number;
  }) => api.get(`/analytics/matches/${matchId}/pitch-map`, { params: filters }),

  // Field Placement
  getFieldPlacements: (matchId: string, overNumber?: number) =>
    api.get(`/analytics/matches/${matchId}/field-placements`, { params: { overNumber } }),
  saveFieldPlacement: (matchId: string, data: any) =>
    api.post(`/analytics/matches/${matchId}/field-placements`, data),

  // 3D Replay
  get3DReplay: (matchId: string, filters?: {
    overNumber?: number;
    ballNumber?: number;
    inningsNumber?: number;
  }) => api.get(`/analytics/matches/${matchId}/3d-replay`, { params: filters }),
};

export const pollAPI = {
  // Create a new poll
  create: (data: {
    matchId: string;
    question: string;
    options: string[];
    type?: string;
    overNumber?: number;
    expiresAt?: string;
  }) => api.post('/polls', data),

  // Get polls by match
  getByMatch: (matchId: string, status?: string) =>
    api.get(`/polls/match/${matchId}`, { params: { status } }),

  // Get a specific poll
  getById: (pollId: string) => api.get(`/polls/${pollId}`),

  // Vote on a poll
  vote: (pollId: string, answer: string) =>
    api.post(`/polls/${pollId}/vote`, { answer }),

  // Close a poll
  close: (pollId: string) => api.put(`/polls/${pollId}/close`),

  // Resolve a poll with correct answer
  resolve: (pollId: string, correctAnswer: string) =>
    api.put(`/polls/${pollId}/resolve`, { correctAnswer }),

  // Get user's votes
  getUserVotes: (matchId?: string) =>
    api.get('/polls/user/votes', { params: { matchId } }),

  // Get leaderboard
  getLeaderboard: (matchId?: string) =>
    api.get('/polls/leaderboard/top', { params: { matchId } }),

  // Create suggested polls
  createSuggested: (matchId: string) =>
    api.post(`/polls/match/${matchId}/suggested`),
};

export const winPredictorAPI = {
  // Calculate win probability
  calculate: (matchId: string, data: {
    inningsId: string;
    overNumber: number;
    ballNumber: number;
  }) => api.post(`/matches/${matchId}/win-probability`, data),

  // Get probability history
  getHistory: (matchId: string) =>
    api.get(`/matches/${matchId}/win-probability/history`),

  // Get latest probability
  getLatest: (matchId: string) =>
    api.get(`/matches/${matchId}/win-probability/latest`),
};

export const multiMatchAPI = {
  // Get all live matches
  getAllLive: () => api.get('/matches/live/all'),
};

// Social & Community APIs
export const socialAPI = {
  // Social Media Sharing
  generateShareImage: (matchId: string, type: string, userId: string) =>
    api.post(`/social/share/matches/${matchId}/generate`, { type, userId }),
  markAsShared: (shareImageId: string, platform: string) =>
    api.post(`/social/share/${shareImageId}/shared`, { platform }),
  getShareHistory: (userId: string, limit?: number) =>
    api.get(`/social/share/users/${userId}/history`, { params: { limit } }),
  getMatchShareStats: (matchId: string) =>
    api.get(`/social/share/matches/${matchId}/stats`),
};

export const fanClubAPI = {
  // Fan Clubs
  create: (data: { playerId: string; name: string; description?: string; badge?: string }) =>
    api.post('/social/fan-clubs', data),
  getAll: () => api.get('/social/fan-clubs'),
  getByPlayer: (playerId: string) => api.get(`/social/fan-clubs/players/${playerId}`),
  join: (fanClubId: string, userId: string) =>
    api.post(`/social/fan-clubs/${fanClubId}/join`, { userId }),
  leave: (fanClubId: string, userId: string) =>
    api.post(`/social/fan-clubs/${fanClubId}/leave`, { userId }),
  getUserMemberships: (userId: string) =>
    api.get(`/social/fan-clubs/users/${userId}/memberships`),
  getLeaderboard: (fanClubId: string, limit?: number) =>
    api.get(`/social/fan-clubs/${fanClubId}/leaderboard`, { params: { limit } }),
};

export const matchDiscussionAPI = {
  // Match Discussion / Comments
  postComment: (matchId: string, message: string, userId: string, replyToId?: string) =>
    api.post(`/social/matches/${matchId}/comments`, { message, userId, replyToId }),
  getComments: (matchId: string, limit?: number, offset?: number) =>
    api.get(`/social/matches/${matchId}/comments`, { params: { limit, offset } }),
  getTopComments: (matchId: string, limit?: number) =>
    api.get(`/social/matches/${matchId}/comments/top`, { params: { limit } }),
  addReaction: (commentId: string, emoji: string, userId: string) =>
    api.post(`/social/comments/${commentId}/reactions`, { emoji, userId }),
  updateKarma: (commentId: string, action: 'upvote' | 'downvote') =>
    api.post(`/social/comments/${commentId}/karma`, { action }),
  togglePin: (commentId: string) => api.post(`/social/comments/${commentId}/pin`),
  deleteComment: (commentId: string, userId: string) =>
    api.delete(`/social/comments/${commentId}`, { data: { userId } }),
};

export const highlightAPI = {
  // Highlights
  create: (matchId: string, data: {
    title: string;
    category: string;
    description?: string;
    ballId?: string;
    tags?: string[];
    userId: string;
  }) => api.post(`/social/matches/${matchId}/highlights`, data),
  getByMatch: (matchId: string, category?: string) =>
    api.get(`/social/matches/${matchId}/highlights`, { params: { category } }),
  getById: (highlightId: string) => api.get(`/social/highlights/${highlightId}`),
  getByUser: (userId: string) => api.get(`/social/highlights/users/${userId}`),
  getTrending: (limit?: number) => api.get('/social/highlights/trending', { params: { limit } }),
  searchByTag: (tag: string) => api.get('/social/highlights/search', { params: { tag } }),
  share: (highlightId: string) => api.post(`/social/highlights/${highlightId}/share`),
  toggleVisibility: (highlightId: string, userId: string) =>
    api.post(`/social/highlights/${highlightId}/visibility`, { userId }),
  delete: (highlightId: string, userId: string) =>
    api.delete(`/social/highlights/${highlightId}`, { data: { userId } }),
  getStats: (matchId: string) => api.get(`/social/matches/${matchId}/highlights/stats`),
};

// AI & Machine Learning APIs
export const aiAPI = {
  // Match Prediction
  predictMatch: (matchId: string) =>
    api.post(`/ai/predictions/matches/${matchId}/predict`),
  getMatchPrediction: (matchId: string) =>
    api.get(`/ai/predictions/matches/${matchId}`),
  getPredictionTrends: (matchId: string, limit?: number) =>
    api.get(`/ai/predictions/matches/${matchId}/trends`, { params: { limit } }),

  // Team Selection
  suggestTeam: (matchId: string, teamId: string, data: {
    pitchType?: string;
    weather?: string;
    oppositionTeamId?: string;
  }) => api.post(`/ai/team-selection/matches/${matchId}/teams/${teamId}/suggest`, data),
  getTeamSuggestion: (matchId: string, teamId: string) =>
    api.get(`/ai/team-selection/matches/${matchId}/teams/${teamId}`),

  // Performance Prediction
  predictPerformance: (matchId: string, playerId: string) =>
    api.post(`/ai/performance/matches/${matchId}/players/${playerId}/predict`),
  getPerformancePrediction: (matchId: string, playerId: string) =>
    api.get(`/ai/performance/matches/${matchId}/players/${playerId}`),
  getMatchPerformancePredictions: (matchId: string) =>
    api.get(`/ai/performance/matches/${matchId}`),

  // Injury Risk
  assessInjuryRisk: (playerId: string) =>
    api.post(`/ai/injury-risk/players/${playerId}/assess`),
  getInjuryRisk: (playerId: string) =>
    api.get(`/ai/injury-risk/players/${playerId}`),
  getHighRiskPlayers: () =>
    api.get('/ai/injury-risk/high-risk'),
  getInjuryRiskTrends: (playerId: string, limit?: number) =>
    api.get(`/ai/injury-risk/players/${playerId}/trends`, { params: { limit } }),
};

// Broadcasting & Media APIs
export const broadcastAPI = {
  // Video Highlights
  createVideoHighlight: (matchId: string, data: {
    ballId?: string;
    videoUrl: string;
    videoProvider: string;
    startTimestamp: number;
    ballTimestamp?: number;
    title: string;
    category: string;
    description?: string;
    thumbnailUrl?: string;
  }) => api.post(`/broadcast/matches/${matchId}/highlights`, data),

  getVideoHighlights: (matchId: string, filters?: {
    category?: string;
    ballId?: string;
    inningsNumber?: number;
  }) => api.get(`/broadcast/matches/${matchId}/highlights`, { params: filters }),

  linkBallToVideo: (ballId: string, data: {
    videoId: string;
    timestamp: number;
  }) => api.post(`/broadcast/balls/${ballId}/video`, data),

  autoGenerateHighlights: (matchId: string) =>
    api.post(`/broadcast/matches/${matchId}/highlights/auto-generate`),

  // Live Streaming
  setupLiveStream: (matchId: string, data: {
    streamUrl: string;
    streamProvider: string;
    streamKey?: string;
    hlsUrl?: string;
    dashUrl?: string;
    rtmpUrl?: string;
    qualityLevels?: any;
  }) => api.post(`/broadcast/matches/${matchId}/stream`, data),

  updateStreamStatus: (matchId: string, status: string) =>
    api.patch(`/broadcast/matches/${matchId}/stream/status`, { status }),

  getStreamInfo: (matchId: string) =>
    api.get(`/broadcast/matches/${matchId}/stream`),

  updateStreamAnalytics: (matchId: string, viewers: number) =>
    api.patch(`/broadcast/matches/${matchId}/stream/analytics`, { viewers }),

  // Podcasts
  generatePodcast: (matchId: string, data?: {
    title?: string;
    voice?: string;
    language?: string;
    format?: string;
    includeAnalysis?: boolean;
  }) => api.post(`/broadcast/matches/${matchId}/podcast/generate`, data || {}),

  getPodcastStatus: (podcastId: string) =>
    api.get(`/broadcast/podcasts/${podcastId}`),

  publishPodcast: (podcastId: string) =>
    api.post(`/broadcast/podcasts/${podcastId}/publish`),

  getMatchPodcasts: (matchId: string) =>
    api.get(`/broadcast/matches/${matchId}/podcasts`),

  // Broadcaster Dashboard
  getBroadcasterSettings: (matchId: string) =>
    api.get(`/broadcast/matches/${matchId}/broadcaster/settings`),

  updateBroadcasterSettings: (matchId: string, data: {
    layout?: string;
    theme?: string;
    autoTalkingPoints?: boolean;
    panels?: any;
    graphics?: any;
    notifications?: any;
  }) => api.patch(`/broadcast/matches/${matchId}/broadcaster/settings`, data),

  getTalkingPoints: (matchId: string) =>
    api.get(`/broadcast/matches/${matchId}/broadcaster/talking-points`),

  generateTalkingPoints: (matchId: string, data: {
    overNumber?: number;
  }) => api.post(`/broadcast/matches/${matchId}/broadcaster/talking-points/generate`, data),

  markTalkingPointUsed: (pointId: string) =>
    api.post(`/broadcast/talking-points/${pointId}/mark-used`),
};

// Administration & Management API
export const administrationAPI = {
  // DRS (Decision Review System)
  createDRSReview: (matchId: string, data: any) =>
    api.post(`/administration/drs`, { matchId, ...data }),

  getDRSReviews: (matchId: string) =>
    api.get(`/administration/drs/match/${matchId}`),

  updateDRSDecision: (reviewId: string, data: any) =>
    api.put(`/administration/drs/${reviewId}`, data),

  getDRSStats: (matchId: string) =>
    api.get(`/administration/drs/match/${matchId}/stats`),

  // Injury Management
  recordInjury: (data: any) =>
    api.post(`/administration/injuries`, data),

  updateInjury: (injuryId: string, data: any) =>
    api.put(`/administration/injuries/${injuryId}`, data),

  getInjuries: (matchId: string) =>
    api.get(`/administration/injuries/match/${matchId}`),

  getActiveInjuries: () =>
    api.get(`/administration/injuries/active`),

  // Substitutions
  createSubstitution: (data: any) =>
    api.post(`/administration/substitutions`, data),

  endSubstitution: (substituteId: string) =>
    api.put(`/administration/substitutions/${substituteId}/end`),

  getSubstitutions: (matchId: string) =>
    api.get(`/administration/substitutions/match/${matchId}`),

  // Weather Tracking
  recordWeather: (data: any) =>
    api.post(`/administration/weather`, data),

  getWeather: (matchId: string) =>
    api.get(`/administration/weather/match/${matchId}`),

  getCurrentWeather: (matchId: string) =>
    api.get(`/administration/weather/match/${matchId}/current`),

  // Pitch Conditions
  recordPitch: (data: any) =>
    api.post(`/administration/pitch`, data),

  getPitch: (matchId: string) =>
    api.get(`/administration/pitch/match/${matchId}`),

  // DLS Calculations
  calculateDLS: (data: any) =>
    api.post(`/administration/dls/calculate`, data),

  getDLS: (matchId: string) =>
    api.get(`/administration/dls/match/${matchId}`),

  // Referee Reports
  createReport: (data: any) =>
    api.post(`/administration/referee-reports`, data),

  updateReport: (reportId: string, data: any) =>
    api.put(`/administration/referee-reports/${reportId}`, data),

  getReport: (matchId: string) =>
    api.get(`/administration/referee-reports/match/${matchId}`),

  submitReport: (reportId: string) =>
    api.post(`/administration/referee-reports/${reportId}/submit`),

  // Incidents
  recordIncident: (data: any) =>
    api.post(`/administration/incidents`, data),

  updateIncident: (incidentId: string, data: any) =>
    api.put(`/administration/incidents/${incidentId}`, data),

  getIncidents: (matchId: string) =>
    api.get(`/administration/incidents/match/${matchId}`),

  // Violations
  recordViolation: (data: any) =>
    api.post(`/administration/violations`, data),

  updateViolation: (violationId: string, data: any) =>
    api.put(`/administration/violations/${violationId}`, data),

  getViolations: (matchId: string) =>
    api.get(`/administration/violations/match/${matchId}`),

  getPlayerViolations: (playerId: string) =>
    api.get(`/administration/violations/player/${playerId}`),
};

export const contactAPI = {
  submitForm: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => api.post('/contact/submit', data),
};

export default api;
