"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuggestedPolls = exports.getPollLeaderboard = exports.getUserVotes = exports.resolvePoll = exports.closePoll = exports.votePoll = exports.getPollById = exports.getPollsByMatch = exports.createPoll = void 0;
const poll_service_1 = require("../services/poll.service");
const errorHandler_1 = require("../middleware/errorHandler");
const server_1 = require("../server");
const createPoll = async (req, res, next) => {
    try {
        const { matchId, question, options, type, overNumber, expiresAt } = req.body;
        const userId = req.user.id;
        if (!matchId || !question || !options || !Array.isArray(options) || options.length < 2) {
            throw new errorHandler_1.AppError('Invalid poll data. Question and at least 2 options required', 400);
        }
        const poll = await poll_service_1.pollService.createPoll({
            matchId,
            question,
            options,
            type: type || 'GENERAL',
            overNumber,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdBy: userId,
        });
        server_1.io.to(`match-${matchId}`).emit('new-poll', poll);
        res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPoll = createPoll;
const getPollsByMatch = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const { status } = req.query;
        const polls = await poll_service_1.pollService.getPollsByMatch(matchId, status);
        res.json({
            success: true,
            data: polls,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPollsByMatch = getPollsByMatch;
const getPollById = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const poll = await poll_service_1.pollService.getPollById(pollId);
        res.json({
            success: true,
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPollById = getPollById;
const votePoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const { answer } = req.body;
        const userId = req.user.id;
        if (!answer) {
            throw new errorHandler_1.AppError('Answer is required', 400);
        }
        const vote = await poll_service_1.pollService.votePoll({
            pollId,
            userId,
            answer,
        });
        res.json({
            success: true,
            message: 'Vote recorded successfully',
            data: vote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.votePoll = votePoll;
const closePoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const poll = await poll_service_1.pollService.closePoll(pollId);
        res.json({
            success: true,
            message: 'Poll closed successfully',
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.closePoll = closePoll;
const resolvePoll = async (req, res, next) => {
    try {
        const { pollId } = req.params;
        const { correctAnswer } = req.body;
        if (!correctAnswer) {
            throw new errorHandler_1.AppError('Correct answer is required', 400);
        }
        const result = await poll_service_1.pollService.resolvePoll(pollId, correctAnswer);
        res.json({
            success: true,
            message: 'Poll resolved successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resolvePoll = resolvePoll;
const getUserVotes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { matchId } = req.query;
        const votes = await poll_service_1.pollService.getUserVotes(userId, matchId);
        res.json({
            success: true,
            data: votes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserVotes = getUserVotes;
const getPollLeaderboard = async (req, res, next) => {
    try {
        const { matchId } = req.query;
        const leaderboard = await poll_service_1.pollService.getPollLeaderboard(matchId);
        res.json({
            success: true,
            data: leaderboard,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPollLeaderboard = getPollLeaderboard;
const createSuggestedPolls = async (req, res, next) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;
        const polls = await poll_service_1.pollService.createSuggestedPolls(matchId, userId);
        polls.forEach((poll) => {
            server_1.io.to(`match-${matchId}`).emit('new-poll', poll);
        });
        res.json({
            success: true,
            message: 'Suggested polls created successfully',
            data: polls,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSuggestedPolls = createSuggestedPolls;
//# sourceMappingURL=poll.controller.js.map