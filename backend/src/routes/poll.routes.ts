import { Router } from 'express';
import * as pollController from '../controllers/poll.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All poll routes require authentication
router.use(authenticate);

// Create a new poll
router.post('/', pollController.createPoll);

// Get all polls for a match
router.get('/match/:matchId', pollController.getPollsByMatch);

// Create suggested polls for a match
router.post('/match/:matchId/suggested', pollController.createSuggestedPolls);

// Get a specific poll
router.get('/:pollId', pollController.getPollById);

// Vote on a poll
router.post('/:pollId/vote', pollController.votePoll);

// Close a poll (admin/creator only)
router.put('/:pollId/close', pollController.closePoll);

// Resolve a poll with correct answer (admin/creator only)
router.put('/:pollId/resolve', pollController.resolvePoll);

// Get user's votes
router.get('/user/votes', pollController.getUserVotes);

// Get poll leaderboard
router.get('/leaderboard/top', pollController.getPollLeaderboard);

export default router;
