import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export interface BallLocationData {
    shotAngle?: number;
    shotDistance?: number;
    shotZone?: string;
    pitchLine?: string;
    pitchLength?: string;
    pitchX?: number;
    pitchY?: number;
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
    strikerId?: string;
    nonStrikerId?: string;
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
    position: string;
    x: number;
    y: number;
}
//# sourceMappingURL=index.d.ts.map