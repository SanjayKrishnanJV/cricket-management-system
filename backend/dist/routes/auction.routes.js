"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auction_controller_1 = require("../controllers/auction.controller");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new auction_controller_1.AuctionController();
router.get('/available-players', controller.getAvailablePlayers);
router.get('/:playerId/bids', controller.getCurrentBids);
router.get('/:playerId/highest-bid', controller.getHighestBid);
router.post('/bid', auth_1.authenticate, (0, auth_1.authorize)('TEAM_OWNER', 'SUPER_ADMIN'), (0, validator_1.validate)(validator_1.schemas.placeBid), controller.placeBid);
router.post('/:playerId/sell', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN', 'TOURNAMENT_ADMIN'), controller.sellPlayer);
router.delete('/:playerId/reset', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.resetAuction);
exports.default = router;
//# sourceMappingURL=auction.routes.js.map