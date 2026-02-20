"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
router.post('/register', (0, validator_1.validate)(validator_1.schemas.register), controller.register);
router.post('/login', (0, validator_1.validate)(validator_1.schemas.login), controller.login);
router.get('/profile', auth_1.authenticate, controller.getProfile);
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.getAllUsers);
router.get('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.getUserById);
router.put('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.updateUser);
router.delete('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.deleteUser);
router.post('/change-password', auth_1.authenticate, controller.changePassword);
router.post('/reset-password', auth_1.authenticate, (0, auth_1.authorize)('SUPER_ADMIN'), controller.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map