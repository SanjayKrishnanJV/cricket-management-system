"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    async register(data) {
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('User already exists', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await database_1.default.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role || 'VIEWER',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return { user, token };
    }
    async login(email, password) {
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }
    async getProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                ownedTeams: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        logoUrl: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        return user;
    }
    async getAllUsers() {
        const users = await database_1.default.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                ownedTeams: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async getUserById(id) {
        const user = await database_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                ownedTeams: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        logoUrl: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        return user;
    }
    async updateUser(id, data) {
        if (data.email) {
            const existingUser = await database_1.default.user.findUnique({
                where: { email: data.email },
            });
            if (existingUser && existingUser.id !== id) {
                throw new errorHandler_1.AppError('Email already in use', 400);
            }
        }
        const user = await database_1.default.user.update({
            where: { id },
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        return user;
    }
    async deleteUser(id) {
        const user = await database_1.default.user.findUnique({
            where: { id },
            include: {
                ownedTeams: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        if (user.ownedTeams.length > 0) {
            throw new errorHandler_1.AppError('Cannot delete user who owns teams. Please reassign teams first.', 400);
        }
        await database_1.default.user.delete({
            where: { id },
        });
        return { message: 'User deleted successfully' };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError('Invalid current password', 401);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password changed successfully' };
    }
    async resetPassword(userId, newPassword) {
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password reset successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map