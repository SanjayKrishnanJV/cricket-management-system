import { Request, Response, NextFunction } from 'express';
export declare class RoleController {
    getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRoleById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllPermissions(req: Request, res: Response, next: NextFunction): Promise<void>;
    assignRoleToUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    removeRoleFromUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserRoles(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=role.controller.d.ts.map