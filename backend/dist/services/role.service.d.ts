export declare class RoleService {
    getAllRoles(): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        userCount: number;
        _count: {
            userRoles: number;
        };
        rolePermissions: ({
            permission: {
                name: string;
                category: string;
                id: string;
                createdAt: Date;
                description: string | null;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        displayName: string;
        isCustom: boolean;
    }[]>;
    getRoleById(id: string): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        users: {
            name: string;
            id: string;
            email: string;
        }[];
        userRoles: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
        rolePermissions: ({
            permission: {
                name: string;
                category: string;
                id: string;
                createdAt: Date;
                description: string | null;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        displayName: string;
        isCustom: boolean;
    }>;
    createRole(data: {
        name: string;
        displayName: string;
        description?: string;
        permissionIds: string[];
    }): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        users: {
            name: string;
            id: string;
            email: string;
        }[];
        userRoles: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
        rolePermissions: ({
            permission: {
                name: string;
                category: string;
                id: string;
                createdAt: Date;
                description: string | null;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        displayName: string;
        isCustom: boolean;
    }>;
    updateRole(id: string, data: {
        displayName?: string;
        description?: string;
        permissionIds?: string[];
        isActive?: boolean;
    }): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        users: {
            name: string;
            id: string;
            email: string;
        }[];
        userRoles: ({
            user: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
        rolePermissions: ({
            permission: {
                name: string;
                category: string;
                id: string;
                createdAt: Date;
                description: string | null;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        displayName: string;
        isCustom: boolean;
    }>;
    deleteRole(id: string): Promise<{
        message: string;
    }>;
    getAllPermissions(): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        groupedByCategory: any;
    }>;
    assignRoleToUser(userId: string, roleId: string): Promise<{
        message: string;
    }>;
    removeRoleFromUser(userId: string, roleId: string): Promise<{
        message: string;
    }>;
    getUserRoles(userId: string): Promise<{
        permissions: {
            name: string;
            category: string;
            id: string;
            createdAt: Date;
            description: string | null;
            displayName: string;
        }[];
        rolePermissions: ({
            permission: {
                name: string;
                category: string;
                id: string;
                createdAt: Date;
                description: string | null;
                displayName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            roleId: string;
            permissionId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
        displayName: string;
        isCustom: boolean;
    }[]>;
}
//# sourceMappingURL=role.service.d.ts.map