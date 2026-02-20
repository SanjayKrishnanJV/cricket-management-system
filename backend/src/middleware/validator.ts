import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(['SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'TEAM_OWNER', 'SCORER', 'VIEWER']).optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string(),
  }),

  createPlayer: z.object({
    name: z.string().min(2),
    role: z.enum(['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKETKEEPER']),
    age: z.number().min(15).max(50),
    nationality: z.string(),
    basePrice: z.number().min(0),
    imageUrl: z.string().url().optional(),
  }),

  createTeam: z.object({
    name: z.string().min(2),
    shortName: z.string().min(2).max(5),
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().optional(),
    budget: z.number().min(0).optional(),
  }),

  createTournament: z.object({
    name: z.string().min(2),
    format: z.enum(['T20', 'ODI', 'TEST']),
    type: z.enum(['LEAGUE', 'KNOCKOUT', 'LEAGUE_KNOCKOUT']),
    startDate: z.string(),
    endDate: z.string(),
    prizePool: z.number().optional(),
    description: z.string().optional(),
  }),

  createMatch: z.object({
    tournamentId: z.string().uuid().optional(),
    homeTeamId: z.string().uuid(),
    awayTeamId: z.string().uuid(),
    venue: z.string(),
    matchDate: z.string(),
    isQuickMatch: z.boolean().optional(),
    customOvers: z.number().min(1).max(50).optional(),
    minPlayers: z.number().min(1).max(15).optional(),
    homeSquad: z.array(z.string().uuid()).optional(),
    awaySquad: z.array(z.string().uuid()).optional(),
  }),

  recordToss: z.object({
    tossWinnerId: z.string().uuid(),
    tossDecision: z.enum(['bat', 'bowl']),
  }),

  recordBall: z.object({
    runs: z.number().min(0).max(7),
    isWicket: z.boolean(),
    wicketType: z.enum([
      'BOWLED',
      'CAUGHT',
      'LBW',
      'RUN_OUT',
      'STUMPED',
      'HIT_WICKET',
      'CAUGHT_AND_BOWLED',
      'OBSTRUCTING_FIELD',
      'HIT_BALL_TWICE',
      'TIMED_OUT',
      'RETIRED_HURT',
    ]).optional(),
    isExtra: z.boolean(),
    extraType: z.enum(['WIDE', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY']).optional(),
    extraRuns: z.number().min(0).optional(),
    commentary: z.string().optional(),
    dismissedPlayerId: z.string().uuid().optional(),
    wicketTakerId: z.string().uuid().optional(),
  }),

  placeBid: z.object({
    playerId: z.string().uuid(),
    amount: z.number().min(0),
  }),
};
