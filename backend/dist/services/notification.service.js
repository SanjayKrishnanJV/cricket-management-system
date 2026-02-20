"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const email_service_1 = require("./email.service");
const database_1 = __importDefault(require("../config/database"));
class NotificationService {
    async notifyMatchStart(matchId) {
        try {
            const match = await database_1.default.match.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    tournament: true,
                },
            });
            if (!match)
                return;
            const users = await database_1.default.user.findMany({
                where: {
                    email: {
                        not: null,
                    },
                },
            });
            const notifications = users.map(async (user) => {
                if (user.email) {
                    await email_service_1.emailService.sendMatchStartNotification(user.email, match);
                }
            });
            await Promise.all(notifications);
        }
        catch (error) {
            console.error('Match start notification error:', error);
        }
    }
    async notifyMatchEnd(matchId) {
        try {
            const match = await database_1.default.match.findUnique({
                where: { id: matchId },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            });
            if (!match)
                return;
            const users = await database_1.default.user.findMany({
                where: {
                    email: {
                        not: null,
                    },
                },
            });
            const notifications = users.map(async (user) => {
                if (user.email) {
                    await email_service_1.emailService.sendMatchResultNotification(user.email, match);
                }
            });
            await Promise.all(notifications);
        }
        catch (error) {
            console.error('Match end notification error:', error);
        }
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map