"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedRolesAndPermissions() {
    console.log('Seeding roles and permissions...');
    const permissions = [
        { name: 'users.view', displayName: 'View Users', description: 'View list of users', category: 'users' },
        { name: 'users.create', displayName: 'Create Users', description: 'Create new users', category: 'users' },
        { name: 'users.edit', displayName: 'Edit Users', description: 'Edit user details', category: 'users' },
        { name: 'users.delete', displayName: 'Delete Users', description: 'Delete users', category: 'users' },
        { name: 'users.manage_roles', displayName: 'Manage User Roles', description: 'Assign roles to users', category: 'users' },
        { name: 'teams.view', displayName: 'View Teams', description: 'View list of teams', category: 'teams' },
        { name: 'teams.create', displayName: 'Create Teams', description: 'Create new teams', category: 'teams' },
        { name: 'teams.edit', displayName: 'Edit Teams', description: 'Edit team details', category: 'teams' },
        { name: 'teams.delete', displayName: 'Delete Teams', description: 'Delete teams', category: 'teams' },
        { name: 'teams.manage_squad', displayName: 'Manage Squad', description: 'Add/remove players from squad', category: 'teams' },
        { name: 'teams.own', displayName: 'Own Teams', description: 'Own and manage teams', category: 'teams' },
        { name: 'players.view', displayName: 'View Players', description: 'View list of players', category: 'players' },
        { name: 'players.create', displayName: 'Create Players', description: 'Create new players', category: 'players' },
        { name: 'players.edit', displayName: 'Edit Players', description: 'Edit player details', category: 'players' },
        { name: 'players.delete', displayName: 'Delete Players', description: 'Delete players', category: 'players' },
        { name: 'tournaments.view', displayName: 'View Tournaments', description: 'View tournaments', category: 'tournaments' },
        { name: 'tournaments.create', displayName: 'Create Tournaments', description: 'Create new tournaments', category: 'tournaments' },
        { name: 'tournaments.edit', displayName: 'Edit Tournaments', description: 'Edit tournament details', category: 'tournaments' },
        { name: 'tournaments.delete', displayName: 'Delete Tournaments', description: 'Delete tournaments', category: 'tournaments' },
        { name: 'tournaments.manage', displayName: 'Manage Tournaments', description: 'Full tournament management', category: 'tournaments' },
        { name: 'matches.view', displayName: 'View Matches', description: 'View matches', category: 'matches' },
        { name: 'matches.create', displayName: 'Create Matches', description: 'Create new matches', category: 'matches' },
        { name: 'matches.edit', displayName: 'Edit Matches', description: 'Edit match details', category: 'matches' },
        { name: 'matches.delete', displayName: 'Delete Matches', description: 'Delete matches', category: 'matches' },
        { name: 'matches.score', displayName: 'Score Matches', description: 'Record match scores', category: 'matches' },
        { name: 'auction.participate', displayName: 'Participate in Auction', description: 'Bid on players', category: 'auction' },
        { name: 'auction.manage', displayName: 'Manage Auction', description: 'Control auction flow', category: 'auction' },
        { name: 'analytics.view', displayName: 'View Analytics', description: 'View system analytics', category: 'analytics' },
        { name: 'roles.view', displayName: 'View Roles', description: 'View roles', category: 'roles' },
        { name: 'roles.create', displayName: 'Create Roles', description: 'Create custom roles', category: 'roles' },
        { name: 'roles.edit', displayName: 'Edit Roles', description: 'Edit role permissions', category: 'roles' },
        { name: 'roles.delete', displayName: 'Delete Roles', description: 'Delete custom roles', category: 'roles' },
    ];
    console.log('Creating permissions...');
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: perm,
            create: perm,
        });
    }
    const roles = [
        {
            name: 'SUPER_ADMIN',
            displayName: 'Super Administrator',
            description: 'Full system access with all permissions',
            isCustom: false,
        },
        {
            name: 'TOURNAMENT_ADMIN',
            displayName: 'Tournament Administrator',
            description: 'Manage tournaments and matches',
            isCustom: false,
        },
        {
            name: 'TEAM_OWNER',
            displayName: 'Team Owner',
            description: 'Own and manage teams, participate in auctions',
            isCustom: false,
        },
        {
            name: 'SCORER',
            displayName: 'Scorer',
            description: 'Record match scores and statistics',
            isCustom: false,
        },
        {
            name: 'VIEWER',
            displayName: 'Viewer',
            description: 'Read-only access to view information',
            isCustom: false,
        },
    ];
    console.log('Creating default roles...');
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: role,
            create: role,
        });
    }
    console.log('Assigning permissions to roles...');
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    const allPermissions = await prisma.permission.findMany();
    if (superAdminRole) {
        for (const permission of allPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: superAdminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: superAdminRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    const tournamentAdminRole = await prisma.role.findUnique({ where: { name: 'TOURNAMENT_ADMIN' } });
    const tournamentAdminPerms = await prisma.permission.findMany({
        where: {
            name: {
                in: [
                    'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage',
                    'matches.view', 'matches.create', 'matches.edit', 'matches.delete',
                    'teams.view', 'players.view', 'analytics.view',
                ],
            },
        },
    });
    if (tournamentAdminRole) {
        for (const permission of tournamentAdminPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: tournamentAdminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: tournamentAdminRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    const teamOwnerRole = await prisma.role.findUnique({ where: { name: 'TEAM_OWNER' } });
    const teamOwnerPerms = await prisma.permission.findMany({
        where: {
            name: {
                in: [
                    'teams.view', 'teams.own', 'teams.manage_squad',
                    'players.view', 'auction.participate',
                    'matches.view', 'tournaments.view',
                ],
            },
        },
    });
    if (teamOwnerRole) {
        for (const permission of teamOwnerPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: teamOwnerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: teamOwnerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    const scorerRole = await prisma.role.findUnique({ where: { name: 'SCORER' } });
    const scorerPerms = await prisma.permission.findMany({
        where: {
            name: {
                in: [
                    'matches.view', 'matches.score',
                    'players.view', 'teams.view', 'tournaments.view',
                ],
            },
        },
    });
    if (scorerRole) {
        for (const permission of scorerPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: scorerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: scorerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    const viewerRole = await prisma.role.findUnique({ where: { name: 'VIEWER' } });
    const viewerPerms = await prisma.permission.findMany({
        where: {
            name: {
                in: [
                    'players.view', 'teams.view', 'matches.view', 'tournaments.view',
                ],
            },
        },
    });
    if (viewerRole) {
        for (const permission of viewerPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: viewerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: viewerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    console.log('Roles and permissions seeded successfully!');
}
seedRolesAndPermissions()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-roles.js.map