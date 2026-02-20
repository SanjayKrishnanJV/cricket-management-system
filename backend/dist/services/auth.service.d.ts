export declare class AuthService {
    register(data: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<{
        user: {
            name: string;
            id: string;
            createdAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        ownedTeams: {
            name: string;
            id: string;
            shortName: string;
            logoUrl: string;
        }[];
    }>;
    getAllUsers(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        ownedTeams: {
            name: string;
            id: string;
            shortName: string;
        }[];
    }[]>;
    getUserById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        ownedTeams: {
            name: string;
            id: string;
            shortName: string;
            logoUrl: string;
        }[];
    }>;
    updateUser(id: string, data: {
        email?: string;
        name?: string;
        role?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    resetPassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map