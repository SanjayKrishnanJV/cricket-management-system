import { Request, Response, NextFunction } from 'express';
import { pollService } from '../services/poll.service';
import { AppError } from '../middleware/errorHandler';
import { io } from '../server';

export const createPoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId, question, options, type, overNumber, expiresAt } = req.body;
    const userId = (req as any).user.id;

    if (!matchId || !question || !options || !Array.isArray(options) || options.length < 2) {
      throw new AppError('Invalid poll data. Question and at least 2 options required', 400);
    }

    const poll = await pollService.createPoll({
      matchId,
      question,
      options,
      type: type || 'GENERAL',
      overNumber,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: userId,
    });

    // Emit socket event so all clients get updated in real-time
    io.to(`match-${matchId}`).emit('new-poll', poll);

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

export const getPollsByMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;
    const { status } = req.query;

    const polls = await pollService.getPollsByMatch(matchId, status as string);

    res.json({
      success: true,
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};

export const getPollById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pollId } = req.params;

    const poll = await pollService.getPollById(pollId);

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

export const votePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pollId } = req.params;
    const { answer } = req.body;
    const userId = (req as any).user.id;

    if (!answer) {
      throw new AppError('Answer is required', 400);
    }

    const vote = await pollService.votePoll({
      pollId,
      userId,
      answer,
    });

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

export const closePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pollId } = req.params;

    const poll = await pollService.closePoll(pollId);

    res.json({
      success: true,
      message: 'Poll closed successfully',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

export const resolvePoll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pollId } = req.params;
    const { correctAnswer } = req.body;

    if (!correctAnswer) {
      throw new AppError('Correct answer is required', 400);
    }

    const result = await pollService.resolvePoll(pollId, correctAnswer);

    res.json({
      success: true,
      message: 'Poll resolved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserVotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { matchId } = req.query;

    const votes = await pollService.getUserVotes(userId, matchId as string);

    res.json({
      success: true,
      data: votes,
    });
  } catch (error) {
    next(error);
  }
};

export const getPollLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.query;

    const leaderboard = await pollService.getPollLeaderboard(matchId as string);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

export const createSuggestedPolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;
    const userId = (req as any).user.id;

    const polls = await pollService.createSuggestedPolls(matchId, userId);

    // Emit socket events for each created poll so all clients get updated in real-time
    polls.forEach((poll) => {
      io.to(`match-${matchId}`).emit('new-poll', poll);
    });

    res.json({
      success: true,
      message: 'Suggested polls created successfully',
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};
