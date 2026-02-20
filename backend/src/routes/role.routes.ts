import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new RoleController();

// All role routes require authentication and SUPER_ADMIN access
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// Permissions (must come before /:id route)
router.get('/permissions/all', controller.getAllPermissions);

// User-Role assignments (must come before /:id route)
router.post('/assign', controller.assignRoleToUser);
router.post('/remove', controller.removeRoleFromUser);
router.get('/user/:userId', controller.getUserRoles);

// Role CRUD (parameterized routes come last)
router.get('/', controller.getAllRoles);
router.get('/:id', controller.getRoleById);
router.post('/', controller.createRole);
router.put('/:id', controller.updateRole);
router.delete('/:id', controller.deleteRole);

export default router;
