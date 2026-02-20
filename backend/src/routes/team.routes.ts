import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new TeamController();

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'TEAM_OWNER'),
  validate(schemas.createTeam),
  controller.createTeam
);

router.get('/', controller.getAllTeams);
router.get('/:id', controller.getTeamById);
router.get('/:id/squad', controller.getTeamSquad);

router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'TEAM_OWNER'),
  controller.updateTeam
);

router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  controller.deleteTeam
);

router.post(
  '/:id/players',
  authenticate,
  authorize('SUPER_ADMIN', 'TEAM_OWNER'),
  controller.addPlayerToTeam
);

router.delete(
  '/:id/players/:contractId',
  authenticate,
  authorize('SUPER_ADMIN', 'TEAM_OWNER'),
  controller.removePlayerFromTeam
);

router.post(
  '/:id/captain',
  authenticate,
  authorize('SUPER_ADMIN', 'TEAM_OWNER'),
  controller.setCaptain
);

router.post(
  '/:id/vice-captain',
  authenticate,
  authorize('SUPER_ADMIN', 'TEAM_OWNER'),
  controller.setViceCaptain
);

export default router;
