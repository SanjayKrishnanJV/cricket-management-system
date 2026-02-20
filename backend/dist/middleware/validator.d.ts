import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
export declare const validate: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const schemas: {
    register: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_OWNER", "SCORER", "VIEWER"]>>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        email?: string;
        password?: string;
        role?: "SUPER_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_OWNER" | "SCORER" | "VIEWER";
    }, {
        name?: string;
        email?: string;
        password?: string;
        role?: "SUPER_ADMIN" | "TOURNAMENT_ADMIN" | "TEAM_OWNER" | "SCORER" | "VIEWER";
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email?: string;
        password?: string;
    }, {
        email?: string;
        password?: string;
    }>;
    createPlayer: z.ZodObject<{
        name: z.ZodString;
        role: z.ZodEnum<["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKETKEEPER"]>;
        age: z.ZodNumber;
        nationality: z.ZodString;
        basePrice: z.ZodNumber;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        role?: "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKETKEEPER";
        age?: number;
        nationality?: string;
        imageUrl?: string;
        basePrice?: number;
    }, {
        name?: string;
        role?: "BATSMAN" | "BOWLER" | "ALL_ROUNDER" | "WICKETKEEPER";
        age?: number;
        nationality?: string;
        imageUrl?: string;
        basePrice?: number;
    }>;
    createTeam: z.ZodObject<{
        name: z.ZodString;
        shortName: z.ZodString;
        logoUrl: z.ZodOptional<z.ZodString>;
        primaryColor: z.ZodOptional<z.ZodString>;
        budget: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        shortName?: string;
        logoUrl?: string;
        primaryColor?: string;
        budget?: number;
    }, {
        name?: string;
        shortName?: string;
        logoUrl?: string;
        primaryColor?: string;
        budget?: number;
    }>;
    createTournament: z.ZodObject<{
        name: z.ZodString;
        format: z.ZodEnum<["T20", "ODI", "TEST"]>;
        type: z.ZodEnum<["LEAGUE", "KNOCKOUT", "LEAGUE_KNOCKOUT"]>;
        startDate: z.ZodString;
        endDate: z.ZodString;
        prizePool: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        format?: "T20" | "ODI" | "TEST";
        type?: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
        startDate?: string;
        endDate?: string;
        prizePool?: number;
        description?: string;
    }, {
        name?: string;
        format?: "T20" | "ODI" | "TEST";
        type?: "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";
        startDate?: string;
        endDate?: string;
        prizePool?: number;
        description?: string;
    }>;
    createMatch: z.ZodObject<{
        tournamentId: z.ZodOptional<z.ZodString>;
        homeTeamId: z.ZodString;
        awayTeamId: z.ZodString;
        venue: z.ZodString;
        matchDate: z.ZodString;
        isQuickMatch: z.ZodOptional<z.ZodBoolean>;
        customOvers: z.ZodOptional<z.ZodNumber>;
        minPlayers: z.ZodOptional<z.ZodNumber>;
        homeSquad: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        awaySquad: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tournamentId?: string;
        homeTeamId?: string;
        awayTeamId?: string;
        venue?: string;
        matchDate?: string;
        isQuickMatch?: boolean;
        customOvers?: number;
        minPlayers?: number;
        homeSquad?: string[];
        awaySquad?: string[];
    }, {
        tournamentId?: string;
        homeTeamId?: string;
        awayTeamId?: string;
        venue?: string;
        matchDate?: string;
        isQuickMatch?: boolean;
        customOvers?: number;
        minPlayers?: number;
        homeSquad?: string[];
        awaySquad?: string[];
    }>;
    recordToss: z.ZodObject<{
        tossWinnerId: z.ZodString;
        tossDecision: z.ZodEnum<["bat", "bowl"]>;
    }, "strip", z.ZodTypeAny, {
        tossWinnerId?: string;
        tossDecision?: "bat" | "bowl";
    }, {
        tossWinnerId?: string;
        tossDecision?: "bat" | "bowl";
    }>;
    recordBall: z.ZodObject<{
        runs: z.ZodNumber;
        isWicket: z.ZodBoolean;
        wicketType: z.ZodOptional<z.ZodEnum<["BOWLED", "CAUGHT", "LBW", "RUN_OUT", "STUMPED", "HIT_WICKET", "CAUGHT_AND_BOWLED", "OBSTRUCTING_FIELD", "HIT_BALL_TWICE", "TIMED_OUT", "RETIRED_HURT"]>>;
        isExtra: z.ZodBoolean;
        extraType: z.ZodOptional<z.ZodEnum<["WIDE", "NO_BALL", "BYE", "LEG_BYE", "PENALTY"]>>;
        extraRuns: z.ZodOptional<z.ZodNumber>;
        commentary: z.ZodOptional<z.ZodString>;
        dismissedPlayerId: z.ZodOptional<z.ZodString>;
        wicketTakerId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        commentary?: string;
        runs?: number;
        isWicket?: boolean;
        wicketType?: "BOWLED" | "CAUGHT" | "LBW" | "RUN_OUT" | "STUMPED" | "HIT_WICKET" | "CAUGHT_AND_BOWLED" | "OBSTRUCTING_FIELD" | "HIT_BALL_TWICE" | "TIMED_OUT" | "RETIRED_HURT";
        isExtra?: boolean;
        extraType?: "WIDE" | "NO_BALL" | "BYE" | "LEG_BYE" | "PENALTY";
        extraRuns?: number;
        dismissedPlayerId?: string;
        wicketTakerId?: string;
    }, {
        commentary?: string;
        runs?: number;
        isWicket?: boolean;
        wicketType?: "BOWLED" | "CAUGHT" | "LBW" | "RUN_OUT" | "STUMPED" | "HIT_WICKET" | "CAUGHT_AND_BOWLED" | "OBSTRUCTING_FIELD" | "HIT_BALL_TWICE" | "TIMED_OUT" | "RETIRED_HURT";
        isExtra?: boolean;
        extraType?: "WIDE" | "NO_BALL" | "BYE" | "LEG_BYE" | "PENALTY";
        extraRuns?: number;
        dismissedPlayerId?: string;
        wicketTakerId?: string;
    }>;
    placeBid: z.ZodObject<{
        playerId: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        playerId?: string;
        amount?: number;
    }, {
        playerId?: string;
        amount?: number;
    }>;
};
//# sourceMappingURL=validator.d.ts.map