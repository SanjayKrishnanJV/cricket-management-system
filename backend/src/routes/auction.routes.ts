import { Router } from 'express';
import { AuctionController } from '../controllers/auction.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new AuctionController();

router.get('/available-players', controller.getAvailablePlayers);
router.get('/:playerId/bids', controller.getCurrentBids);
router.get('/:playerId/highest-bid', controller.getHighestBid);

router.post(
  '/bid',
  authenticate,
  authorize('TEAM_OWNER', 'SUPER_ADMIN'),
  validate(schemas.placeBid),
  controller.placeBid
);

router.post(
  '/:playerId/sell',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN'),
  controller.sellPlayer
);

router.delete(
  '/:playerId/reset',
  authenticate,
  authorize('SUPER_ADMIN'),
  controller.resetAuction
);

export default router;
