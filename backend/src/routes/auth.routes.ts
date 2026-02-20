import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validator';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(schemas.register), controller.register);
router.post('/login', validate(schemas.login), controller.login);
router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, controller.updateProfile);

// User management (Super Admin only)
router.get('/users', authenticate, authorize('SUPER_ADMIN'), controller.getAllUsers);
router.get('/users/:id', authenticate, authorize('SUPER_ADMIN'), controller.getUserById);
router.put('/users/:id', authenticate, authorize('SUPER_ADMIN'), controller.updateUser);
router.delete('/users/:id', authenticate, authorize('SUPER_ADMIN'), controller.deleteUser);

// Password management
router.post('/change-password', authenticate, controller.changePassword);
router.post('/reset-password', authenticate, authorize('SUPER_ADMIN'), controller.resetPassword);

export default router;
