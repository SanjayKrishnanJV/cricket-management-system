"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class RoleService {
    async getAllRoles() {
        const roles = await database_1.default.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
            orderBy: [
                { isCustom: 'asc' },
                { name: 'asc' },
            ],
        });
        return roles.map(role => ({
            ...role,
            permissions: role.rolePermissions.map(rp => rp.permission),
            userCount: role._count.userRoles,
        }));
    }
    async getRoleById(id) {
        const role = await database_1.default.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true,
                    },
                },
                userRoles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!role) {
            throw new errorHandler_1.AppError('Role not found', 404);
        }
        return {
            ...role,
            permissions: role.rolePermissions.map(rp => rp.permission),
            users: role.userRoles.map(ur => ur.user),
        };
    }
    async createRole(data) {
        const existingRole = await database_1.default.role.findUnique({
            where: { name: data.name.toUpperCase().replace(/\s+/g, '_') },
        });
        if (existingRole) {
            throw new errorHandler_1.AppError('Role with this name already exists', 400);
        }
        const role = await database_1.default.role.create({
            data: {
                name: data.name.toUpperCase().replace(/\s+/g, '_'),
                displayName: data.displayName,
                description: data.description,
                isCustom: true,
            },
        });
        if (data.permissionIds && data.permissionIds.length > 0) {
            await database_1.default.rolePermission.createMany({
                data: data.permissionIds.map(permissionId => ({
                    roleId: role.id,
                    permissionId,
                })),
            });
        }
        return await this.getRoleById(role.id);
    }
    async updateRole(id, data) {
        const role = await database_1.default.role.findUnique({ where: { id } });
        if (!role) {
            throw new errorHandler_1.AppError('Role not found', 404);
        }
        if (!role.isCustom) {
            throw new errorHandler_1.AppError('Cannot modify system roles', 400);
        }
        const updatedRole = await database_1.default.role.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description,
                isActive: data.isActive,
            },
        });
        if (data.permissionIds) {
            await database_1.default.rolePermission.deleteMany({
                where: { roleId: id },
            });
            if (data.permissionIds.length > 0) {
                await database_1.default.rolePermission.createMany({
                    data: data.permissionIds.map(permissionId => ({
                        roleId: id,
                        permissionId,
                    })),
                });
            }
        }
        return await this.getRoleById(id);
    }
    async deleteRole(id) {
        const role = await database_1.default.role.findUnique({
            where: { id },
            include: {
                userRoles: true,
            },
        });
        if (!role) {
            throw new errorHandler_1.AppError('Role not found', 404);
        }
        if (!role.isCustom) {
            throw new errorHandler_1.AppError('Cannot delete system roles', 400);
        }
        if (role.userRoles.length > 0) {
            throw new errorHandler_1.AppError('Cannot delete role that is assigned to users. Please remove users from this role first.', 400);
        }
        await database_1.default.role.delete({
            where: { id },
        });
        return { message: 'Role deleted successfully' };
    }
    async getAllPermissions() {
        const permissions = await database_1.default.permission.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });
        const grouped = permissions.reduce((acc, perm) => {
            if (!acc[perm.category]) {
                acc[perm.category] = [];
            }
            acc[perm.category].push(perm);
            return acc;
        }, {});
        return { permissions, groupedByCategory: grouped };
    }
    async assignRoleToUser(userId, roleId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        const role = await database_1.default.role.findUnique({ where: { id: roleId } });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404);
        }
        if (!role) {
            throw new errorHandler_1.AppError('Role not found', 404);
        }
        const existing = await database_1.default.userRole_New.findFirst({
            where: {
                userId,
                roleId,
            },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Role already assigned to user', 400);
        }
        await database_1.default.userRole_New.create({
            data: {
                userId,
                roleId,
            },
        });
        const userRoleCount = await database_1.default.userRole_New.count({
            where: { userId },
        });
        if (userRoleCount === 1) {
            await database_1.default.user.update({
                where: { id: userId },
                data: { role: role.name },
            });
        }
        return { message: 'Role assigned successfully' };
    }
    async removeRoleFromUser(userId, roleId) {
        const userRole = await database_1.default.userRole_New.findFirst({
            where: {
                userId,
                roleId,
            },
        });
        if (!userRole) {
            throw new errorHandler_1.AppError('Role not assigned to user', 404);
        }
        await database_1.default.userRole_New.delete({
            where: { id: userRole.id },
        });
        const remainingRoles = await database_1.default.userRole_New.findMany({
            where: { userId },
            include: { role: true },
        });
        if (remainingRoles.length > 0) {
            await database_1.default.user.update({
                where: { id: userId },
                data: { role: remainingRoles[0].role.name },
            });
        }
        else {
            await database_1.default.user.update({
                where: { id: userId },
                data: { role: 'VIEWER' },
            });
        }
        return { message: 'Role removed successfully' };
    }
    async getUserRoles(userId) {
        const userRoles = await database_1.default.userRole_New.findMany({
            where: { userId },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
        return userRoles.map(ur => ({
            ...ur.role,
            permissions: ur.role.rolePermissions.map(rp => rp.permission),
        }));
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map