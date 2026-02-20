import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class RoleService {
  async getAllRoles() {
    const roles = await prisma.role.findMany({
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

  async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
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
      throw new AppError('Role not found', 404);
    }

    return {
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      users: role.userRoles.map(ur => ur.user),
    };
  }

  async createRole(data: {
    name: string;
    displayName: string;
    description?: string;
    permissionIds: string[];
  }) {
    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name.toUpperCase().replace(/\s+/g, '_') },
    });

    if (existingRole) {
      throw new AppError('Role with this name already exists', 400);
    }

    const role = await prisma.role.create({
      data: {
        name: data.name.toUpperCase().replace(/\s+/g, '_'),
        displayName: data.displayName,
        description: data.description,
        isCustom: true,
      },
    });

    // Assign permissions
    if (data.permissionIds && data.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: data.permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }

    return await this.getRoleById(role.id);
  }

  async updateRole(id: string, data: {
    displayName?: string;
    description?: string;
    permissionIds?: string[];
    isActive?: boolean;
  }) {
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (!role.isCustom) {
      throw new AppError('Cannot modify system roles', 400);
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        isActive: data.isActive,
      },
    });

    // Update permissions if provided
    if (data.permissionIds) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (data.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: data.permissionIds.map(permissionId => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    return await this.getRoleById(id);
  }

  async deleteRole(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (!role.isCustom) {
      throw new AppError('Cannot delete system roles', 400);
    }

    if (role.userRoles.length > 0) {
      throw new AppError(
        'Cannot delete role that is assigned to users. Please remove users from this role first.',
        400
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const grouped = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    return { permissions, groupedByCategory: grouped };
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const role = await prisma.role.findUnique({ where: { id: roleId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Check if already assigned
    const existing = await prisma.userRole_New.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (existing) {
      throw new AppError('Role already assigned to user', 400);
    }

    await prisma.userRole_New.create({
      data: {
        userId,
        roleId,
      },
    });

    // Update legacy role field if it's the first role
    const userRoleCount = await prisma.userRole_New.count({
      where: { userId },
    });

    if (userRoleCount === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: role.name as any },
      });
    }

    return { message: 'Role assigned successfully' };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const userRole = await prisma.userRole_New.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (!userRole) {
      throw new AppError('Role not assigned to user', 404);
    }

    await prisma.userRole_New.delete({
      where: { id: userRole.id },
    });

    // Update legacy role field to remaining role or VIEWER
    const remainingRoles = await prisma.userRole_New.findMany({
      where: { userId },
      include: { role: true },
    });

    if (remainingRoles.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: remainingRoles[0].role.name as any },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'VIEWER' },
      });
    }

    return { message: 'Role removed successfully' };
  }

  async getUserRoles(userId: string) {
    const userRoles = await prisma.userRole_New.findMany({
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
