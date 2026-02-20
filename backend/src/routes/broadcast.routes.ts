import { Router } from 'express';
import { broadcastController } from '../controllers/broadcast.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * Broadcasting & Media Routes
 * All routes require authentication
 * Some routes require specific roles (ADMIN, SCORER, BROADCASTER)
 */

// Apply authentication to all broadcast routes
router.use(authenticate);

// ===== VIDEO HIGHLIGHTS =====

/**
 * @route   POST /api/broadcast/matches/:matchId/highlights
 * @desc    Create a new video highlight for a match
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/matches/:matchId/highlights',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.createVideoHighlight.bind(broadcastController)
);

/**
 * @route   GET /api/broadcast/matches/:matchId/highlights
 * @desc    Get all video highlights for a match (with optional filters)
 * @access  Authenticated users
 */
router.get(
  '/matches/:matchId/highlights',
  broadcastController.getVideoHighlights.bind(broadcastController)
);

/**
 * @route   POST /api/broadcast/balls/:ballId/video
 * @desc    Link a specific ball to a video timestamp
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/balls/:ballId/video',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.linkBallToVideo.bind(broadcastController)
);

/**
 * @route   POST /api/broadcast/matches/:matchId/highlights/auto-generate
 * @desc    Auto-generate highlights for boundaries and wickets
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/matches/:matchId/highlights/auto-generate',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.autoGenerateHighlights.bind(broadcastController)
);

// ===== LIVE STREAMING =====

/**
 * @route   POST /api/broadcast/matches/:matchId/stream
 * @desc    Setup live stream for a match
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/matches/:matchId/stream',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.setupLiveStream.bind(broadcastController)
);

/**
 * @route   PATCH /api/broadcast/matches/:matchId/stream/status
 * @desc    Update live stream status (LIVE, PAUSED, ENDED, etc.)
 * @access  ADMIN, BROADCASTER
 */
router.patch(
  '/matches/:matchId/stream/status',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.updateStreamStatus.bind(broadcastController)
);

/**
 * @route   GET /api/broadcast/matches/:matchId/stream
 * @desc    Get live stream info for a match
 * @access  Authenticated users
 */
router.get(
  '/matches/:matchId/stream',
  broadcastController.getStreamInfo.bind(broadcastController)
);

/**
 * @route   PATCH /api/broadcast/matches/:matchId/stream/analytics
 * @desc    Update stream analytics (viewer count, etc.)
 * @access  ADMIN, BROADCASTER
 */
router.patch(
  '/matches/:matchId/stream/analytics',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.updateStreamAnalytics.bind(broadcastController)
);

// ===== PODCASTS =====

/**
 * @route   POST /api/broadcast/matches/:matchId/podcast/generate
 * @desc    Generate a podcast for a match (TTS)
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/matches/:matchId/podcast/generate',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.generatePodcast.bind(broadcastController)
);

/**
 * @route   GET /api/broadcast/podcasts/:podcastId
 * @desc    Get podcast generation status
 * @access  Authenticated users
 */
router.get(
  '/podcasts/:podcastId',
  broadcastController.getPodcastStatus.bind(broadcastController)
);

/**
 * @route   POST /api/broadcast/podcasts/:podcastId/publish
 * @desc    Publish a podcast (make it publicly available)
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/podcasts/:podcastId/publish',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.publishPodcast.bind(broadcastController)
);

/**
 * @route   GET /api/broadcast/matches/:matchId/podcasts
 * @desc    Get all podcasts for a match
 * @access  Authenticated users
 */
router.get(
  '/matches/:matchId/podcasts',
  broadcastController.getMatchPodcasts.bind(broadcastController)
);

// ===== BROADCASTER DASHBOARD =====

/**
 * @route   GET /api/broadcast/matches/:matchId/broadcaster/settings
 * @desc    Get broadcaster dashboard settings for a match
 * @access  ADMIN, BROADCASTER
 */
router.get(
  '/matches/:matchId/broadcaster/settings',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.getBroadcasterSettings.bind(broadcastController)
);

/**
 * @route   PATCH /api/broadcast/matches/:matchId/broadcaster/settings
 * @desc    Update broadcaster dashboard settings
 * @access  ADMIN, BROADCASTER
 */
router.patch(
  '/matches/:matchId/broadcaster/settings',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.updateBroadcasterSettings.bind(broadcastController)
);

/**
 * @route   GET /api/broadcast/matches/:matchId/broadcaster/talking-points
 * @desc    Get talking points for broadcasters
 * @access  ADMIN, BROADCASTER
 */
router.get(
  '/matches/:matchId/broadcaster/talking-points',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.getTalkingPoints.bind(broadcastController)
);

/**
 * @route   POST /api/broadcast/matches/:matchId/broadcaster/talking-points/generate
 * @desc    Generate AI talking points for a specific over
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/matches/:matchId/broadcaster/talking-points/generate',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.generateTalkingPoints.bind(broadcastController)
);

/**
 * @route   POST /api/broadcast/talking-points/:pointId/mark-used
 * @desc    Mark a talking point as used
 * @access  ADMIN, BROADCASTER
 */
router.post(
  '/talking-points/:pointId/mark-used',
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'BROADCASTER'),
  broadcastController.markTalkingPointUsed.bind(broadcastController)
);

export default router;
