// User and Authentication Types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TOURNAMENT_ADMIN = 'TOURNAMENT_ADMIN',
  TEAM_OWNER = 'TEAM_OWNER',
  SCORER = 'SCORER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

// Player Types
export enum PlayerRole {
  BATSMAN = 'BATSMAN',
  BOWLER = 'BOWLER',
  ALL_ROUNDER = 'ALL_ROUNDER',
  WICKETKEEPER = 'WICKETKEEPER',
}

export interface Player {
  id: string;
  name: string;
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
  age: number;
  nationality: string;
  basePrice: number;
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  strikeRate: number;
  bowlingAverage: number;
  economyRate: number;
  highestScore: number;
  imageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  primaryColor?: string;
  budget: number;
  contracts?: Contract[];
}

export interface Contract {
  id: string;
  playerId: string;
  teamId: string;
  amount: number;
  player: Player;
  team: Team;
  isActive: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'T20' | 'ODI' | 'TEST';
  type: 'LEAGUE' | 'KNOCKOUT' | 'LEAGUE_KNOCKOUT';
  startDate: string;
  endDate: string;
  prizePool?: number;
  description?: string;
  teams?: any[];
  matches?: Match[];
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  matchDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ABANDONED';
  tossWinnerId?: string;
  tossDecision?: string;
  winnerId?: string;
  winMargin?: string;
  resultText?: string;
  manOfMatch?: string;
  homeTeam?: Team;
  awayTeam?: Team;
  tournament?: Tournament;
  innings?: Innings[];
}

export interface Innings {
  id: string;
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  inningsNumber: number;
  status: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  extras: number;
  battingPerformances?: BattingPerformance[];
  bowlingPerformances?: BowlingPerformance[];
}

export interface BattingPerformance {
  id: string;
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
  player?: {
    name: string;
  };
}

export interface BowlingPerformance {
  id: string;
  playerId: string;
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  economyRate: number;
  player?: {
    name: string;
  };
}

export interface PointsTableEntry {
  id: string;
  tournamentId: string;
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
  team?: Team;
}

export interface AuctionBid {
  id: string;
  playerId: string;
  bidderId: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
  bidder?: User;
}

export interface BallEvent {
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  isExtra: boolean;
  extraType?: string;
  extraRuns: number;
  commentary?: string;
  dismissedPlayerId?: string;
  wicketTakerId?: string;
}

// Additional Enums
export enum TournamentFormat {
  T20 = 'T20',
  ODI = 'ODI',
  TEST = 'TEST',
}

export enum TournamentType {
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT',
  LEAGUE_KNOCKOUT = 'LEAGUE_KNOCKOUT',
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum TossDecision {
  BAT = 'BAT',
  BOWL = 'BOWL',
}

export enum BallOutcome {
  RUNS = 'RUNS',
  WICKET = 'WICKET',
  WIDE = 'WIDE',
  NO_BALL = 'NO_BALL',
  BYE = 'BYE',
  LEG_BYE = 'LEG_BYE',
}

export enum DismissalType {
  BOWLED = 'BOWLED',
  CAUGHT = 'CAUGHT',
  LBW = 'LBW',
  RUN_OUT = 'RUN_OUT',
  STUMPED = 'STUMPED',
  HIT_WICKET = 'HIT_WICKET',
  RETIRED_HURT = 'RETIRED_HURT',
  OBSTRUCTING_FIELD = 'OBSTRUCTING_FIELD',
}

// Extended Types
export interface TeamStats {
  id: string;
  teamId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  totalRuns: number;
  totalWickets: number;
  highestScore: number;
  lowestScore: number;
}

export interface Over {
  id: string;
  inningsId: string;
  overNumber: number;
  bowlerId: string;
  runs: number;
  wickets: number;
  extras: number;
  balls?: Ball[];
}

export interface Ball {
  id: string;
  overId: string;
  ballNumber: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  isWicket: boolean;
  isFour: boolean;
  isSix: boolean;
  outcome: BallOutcome;
  dismissalType?: DismissalType;
  dismissedPlayerId?: string;
  fielderInvolvedId?: string;
  commentary?: string;
  timestamp: string;
}

// Analytics Types
export interface PlayerAnalytics {
  battingByMatch?: Array<{
    matchDate: string;
    runs: number;
    balls: number;
    strikeRate: number;
  }>;
  bowlingByMatch?: Array<{
    matchDate: string;
    overs: number;
    wickets: number;
    runs: number;
    economyRate: number;
  }>;
}

export interface TeamAnalytics {
  matchHistory?: Array<{
    matchDate: string;
    opponent: string;
    result: string;
    runs: number;
    wickets: number;
  }>;
  playerContributions?: Array<{
    playerId: string;
    playerName: string;
    totalRuns: number;
    totalWickets: number;
  }>;
}

// Live Match State (for Socket.IO)
export interface LiveMatchState {
  matchId: string;
  currentInnings: number;
  battingTeamId: string;
  bowlingTeamId: string;
  currentBatsmanId: string;
  currentBowlerId: string;
  score: {
    runs: number;
    wickets: number;
    overs: number;
  };
  recentBalls: Ball[];
  lastUpdate: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
