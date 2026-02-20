import { Router } from 'express';
import { socialController } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Social Media Integration Routes
 */
// Generate share image
router.post('/share/matches/:matchId/generate', authenticate, socialController.generateShareImage);
// Mark as shared
router.post('/share/:shareImageId/shared', socialController.markAsShared);
// Get share history
router.get('/share/users/:userId/history', socialController.getShareHistory);
// Get match share stats
router.get('/share/matches/:matchId/stats', socialController.getMatchShareStats);

/**
 * Fan Club Routes
 */
// Create fan club
router.post('/fan-clubs', socialController.createFanClub);
// Get all fan clubs
router.get('/fan-clubs', socialController.getAllFanClubs);
// Get fan club by player
router.get('/fan-clubs/players/:playerId', socialController.getFanClubByPlayer);
// Join fan club
router.post('/fan-clubs/:fanClubId/join', authenticate, socialController.joinFanClub);
// Leave fan club
router.post('/fan-clubs/:fanClubId/leave', authenticate, socialController.leaveFanClub);
// Get user memberships
router.get('/fan-clubs/users/:userId/memberships', socialController.getUserMemberships);
// Get leaderboard
router.get('/fan-clubs/:fanClubId/leaderboard', socialController.getFanClubLeaderboard);

/**
 * Match Discussion Routes
 */
// Post comment
router.post('/matches/:matchId/comments', authenticate, socialController.postComment);
// Get comments
router.get('/matches/:matchId/comments', socialController.getMatchComments);
// Get top comments
router.get('/matches/:matchId/comments/top', socialController.getTopComments);
// Add reaction
router.post('/comments/:commentId/reactions', authenticate, socialController.addReaction);
// Update karma
router.post('/comments/:commentId/karma', socialController.updateKarma);
// Pin/unpin comment
router.post('/comments/:commentId/pin', socialController.togglePin);
// Delete comment
router.delete('/comments/:commentId', authenticate, socialController.deleteComment);

/**
 * Highlight Routes
 */
// Create highlight
router.post('/matches/:matchId/highlights', authenticate, socialController.createHighlight);
// Get match highlights
router.get('/matches/:matchId/highlights', socialController.getMatchHighlights);
// Get match highlight stats
router.get('/matches/:matchId/highlights/stats', socialController.getHighlightStats);
// Get single highlight
router.get('/highlights/:highlightId', socialController.getHighlight);
// Get user highlights
router.get('/highlights/users/:userId', socialController.getUserHighlights);
// Get trending highlights
router.get('/highlights/trending', socialController.getTrendingHighlights);
// Search by tag
router.get('/highlights/search', socialController.searchByTag);
// Share highlight
router.post('/highlights/:highlightId/share', socialController.shareHighlight);
// Toggle visibility
router.post('/highlights/:highlightId/visibility', authenticate, socialController.toggleVisibility);
// Delete highlight
router.delete('/highlights/:highlightId', authenticate, socialController.deleteHighlight);

export default router;
