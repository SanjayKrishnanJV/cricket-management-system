"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
exports.validate = validate;
exports.schemas = {
    register: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        name: zod_1.z.string().min(2),
        role: zod_1.z.enum(['SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'TEAM_OWNER', 'SCORER', 'VIEWER']).optional(),
    }),
    login: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string(),
    }),
    createPlayer: zod_1.z.object({
        name: zod_1.z.string().min(2),
        role: zod_1.z.enum(['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKETKEEPER']),
        age: zod_1.z.number().min(15).max(50),
        nationality: zod_1.z.string(),
        basePrice: zod_1.z.number().min(0),
        imageUrl: zod_1.z.string().url().optional(),
    }),
    createTeam: zod_1.z.object({
        name: zod_1.z.string().min(2),
        shortName: zod_1.z.string().min(2).max(5),
        logoUrl: zod_1.z.string().url().optional(),
        primaryColor: zod_1.z.string().optional(),
        budget: zod_1.z.number().min(0).optional(),
    }),
    createTournament: zod_1.z.object({
        name: zod_1.z.string().min(2),
        format: zod_1.z.enum(['T20', 'ODI', 'TEST']),
        type: zod_1.z.enum(['LEAGUE', 'KNOCKOUT', 'LEAGUE_KNOCKOUT']),
        startDate: zod_1.z.string(),
        endDate: zod_1.z.string(),
        prizePool: zod_1.z.number().optional(),
        description: zod_1.z.string().optional(),
    }),
    createMatch: zod_1.z.object({
        tournamentId: zod_1.z.string().uuid().optional(),
        homeTeamId: zod_1.z.string().uuid(),
        awayTeamId: zod_1.z.string().uuid(),
        venue: zod_1.z.string(),
        matchDate: zod_1.z.string(),
        isQuickMatch: zod_1.z.boolean().optional(),
        customOvers: zod_1.z.number().min(1).max(50).optional(),
        minPlayers: zod_1.z.number().min(1).max(15).optional(),
        homeSquad: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        awaySquad: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    }),
    recordToss: zod_1.z.object({
        tossWinnerId: zod_1.z.string().uuid(),
        tossDecision: zod_1.z.enum(['bat', 'bowl']),
    }),
    recordBall: zod_1.z.object({
        runs: zod_1.z.number().min(0).max(7),
        isWicket: zod_1.z.boolean(),
        wicketType: zod_1.z.enum([
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
        isExtra: zod_1.z.boolean(),
        extraType: zod_1.z.enum(['WIDE', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY']).optional(),
        extraRuns: zod_1.z.number().min(0).optional(),
        commentary: zod_1.z.string().optional(),
        dismissedPlayerId: zod_1.z.string().uuid().optional(),
        wicketTakerId: zod_1.z.string().uuid().optional(),
    }),
    placeBid: zod_1.z.object({
        playerId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().min(0),
    }),
};
//# sourceMappingURL=validator.js.map