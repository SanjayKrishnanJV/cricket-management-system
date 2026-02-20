"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.status(200).json({
                status: 'success',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await authService.getProfile(userId);
            res.status(200).json({
                status: 'success',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await authService.getAllUsers();
            res.status(200).json({
                status: 'success',
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const user = await authService.getUserById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const user = await authService.updateUser(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const result = await authService.deleteUser(req.params.id);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;
            const result = await authService.changePassword(userId, oldPassword, newPassword);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { userId, newPassword } = req.body;
            const result = await authService.resetPassword(userId, newPassword);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map