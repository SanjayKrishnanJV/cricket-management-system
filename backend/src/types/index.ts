import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface BallLocationData {
  // Wagon Wheel
  shotAngle?: number;
  shotDistance?: number;
  shotZone?: string;

  // Pitch Map
  pitchLine?: string;
  pitchLength?: string;
  pitchX?: number;
  pitchY?: number;

  // 3D Replay
  ballSpeed?: number;
  ballTrajectory?: string;
  shotType?: string;
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
  locationData?: BallLocationData;
  strikerId?: string;  // Current striker (on-strike batsman)
  nonStrikerId?: string;  // Current non-striker
}

export interface OverSummary {
  overNumber: number;
  bowlerId: string;
  runsScored: number;
  wickets: number;
  balls: BallEvent[];
}

export interface ScoreUpdate {
  matchId: string;
  inningsId: string;
  currentScore: number;
  currentWickets: number;
  currentOvers: number;
  striker: string;
  nonStriker: string;
  bowler: string;
  lastBall?: BallEvent;
}

export interface AuctionUpdate {
  playerId: string;
  currentBid: number;
  bidderId: string;
  bidderName: string;
}

export interface FieldPosition {
  playerId: string;
  playerName: string;
  position: string; // 'slip', 'cover', 'mid-on', etc.
  x: number; // -1 to 1 (leg to off)
  y: number; // -1 to 1 (boundary to boundary)
}
