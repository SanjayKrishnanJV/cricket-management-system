"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("../services/role.service");
const roleService = new role_service_1.RoleService();
class RoleController {
    async getAllRoles(req, res, next) {
        try {
            const roles = await roleService.getAllRoles();
            res.status(200).json({
                status: 'success',
                data: roles,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getRoleById(req, res, next) {
        try {
            const role = await roleService.getRoleById(req.params.id);
            res.status(200).json({
                status: 'success',
                data: role,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createRole(req, res, next) {
        try {
            const role = await roleService.createRole(req.body);
            res.status(201).json({
                status: 'success',
                data: role,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateRole(req, res, next) {
        try {
            const role = await roleService.updateRole(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: role,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteRole(req, res, next) {
        try {
            const result = await roleService.deleteRole(req.params.id);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllPermissions(req, res, next) {
        try {
            const permissions = await roleService.getAllPermissions();
            res.status(200).json({
                status: 'success',
                data: permissions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async assignRoleToUser(req, res, next) {
        try {
            const { userId, roleId } = req.body;
            const result = await roleService.assignRoleToUser(userId, roleId);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async removeRoleFromUser(req, res, next) {
        try {
            const { userId, roleId } = req.body;
            const result = await roleService.removeRoleFromUser(userId, roleId);
            res.status(200).json({
                status: 'success',
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserRoles(req, res, next) {
        try {
            const roles = await roleService.getUserRoles(req.params.userId);
            res.status(200).json({
                status: 'success',
                data: roles,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RoleController = RoleController;
//# sourceMappingURL=role.controller.js.map