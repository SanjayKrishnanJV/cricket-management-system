import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

const roleService = new RoleService();

export class RoleController {
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json({
        status: 'success',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await roleService.deleteRole(req.params.id);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await roleService.getAllPermissions();
      res.status(200).json({
        status: 'success',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignRoleToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleId } = req.body;
      const result = await roleService.assignRoleToUser(userId, roleId);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeRoleFromUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleId } = req.body;
      const result = await roleService.removeRoleFromUser(userId, roleId);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getUserRoles(req.params.userId);
      res.status(200).json({
        status: 'success',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }
}
