"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollService = exports.PollService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
class PollService {
    async createPoll(data) {
        const match = await database_1.default.match.findUnique({
            where: { id: data.matchId },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        const poll = await database_1.default.poll.create({
            data: {
                matchId: data.matchId,
                question: data.question,
                options: JSON.stringify(data.options),
                type: data.type,
                overNumber: data.overNumber,
                expiresAt: data.expiresAt,
                createdBy: data.createdBy,
                status: 'ACTIVE',
            },
            include: {
                match: {
                    select: {
                        homeTeam: { select: { name: true } },
                        awayTeam: { select: { name: true } },
                    },
                },
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...poll,
            options: JSON.parse(poll.options),
        };
    }
    async getPollsByMatch(matchId, status) {
        const where = { matchId };
        if (status) {
            where.status = status;
        }
        const polls = await database_1.default.poll.findMany({
            where,
            include: {
                creator: {
                    select: {
                        name: true,
                    },
                },
                votes: {
                    select: {
                        answer: true,
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        votes: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return polls.map((poll) => ({
            ...poll,
            options: JSON.parse(poll.options),
            voteCount: poll._count.votes,
            voteSummary: this.calculateVoteSummary(poll.votes, JSON.parse(poll.options)),
        }));
    }
    async getPollById(pollId) {
        const poll = await database_1.default.poll.findUnique({
            where: { id: pollId },
            include: {
                match: {
                    select: {
                        homeTeam: { select: { name: true } },
                        awayTeam: { select: { name: true } },
                    },
                },
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                votes: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        votes: true,
                    },
                },
            },
        });
        if (!poll) {
            throw new errorHandler_1.AppError('Poll not found', 404);
        }
        return {
            ...poll,
            options: JSON.parse(poll.options),
            voteCount: poll._count.votes,
            voteSummary: this.calculateVoteSummary(poll.votes, JSON.parse(poll.options)),
        };
    }
    async votePoll(data) {
        const poll = await database_1.default.poll.findUnique({
            where: { id: data.pollId },
        });
        if (!poll) {
            throw new errorHandler_1.AppError('Poll not found', 404);
        }
        if (poll.status !== 'ACTIVE') {
            throw new errorHandler_1.AppError('This poll is no longer active', 400);
        }
        if (poll.expiresAt && poll.expiresAt < new Date()) {
            throw new errorHandler_1.AppError('This poll has expired', 400);
        }
        const options = JSON.parse(poll.options);
        if (!options.includes(data.answer)) {
            throw new errorHandler_1.AppError('Invalid answer option', 400);
        }
        const existingVote = await database_1.default.pollVote.findUnique({
            where: {
                pollId_userId: {
                    pollId: data.pollId,
                    userId: data.userId,
                },
            },
        });
        if (existingVote) {
            const vote = await database_1.default.pollVote.update({
                where: { id: existingVote.id },
                data: {
                    answer: data.answer,
                    votedAt: new Date(),
                },
            });
            return vote;
        }
        else {
            const vote = await database_1.default.pollVote.create({
                data: {
                    pollId: data.pollId,
                    userId: data.userId,
                    answer: data.answer,
                },
            });
            return vote;
        }
    }
    async closePoll(pollId) {
        const poll = await database_1.default.poll.update({
            where: { id: pollId },
            data: {
                status: 'CLOSED',
            },
        });
        return poll;
    }
    async resolvePoll(pollId, correctAnswer) {
        const poll = await database_1.default.poll.findUnique({
            where: { id: pollId },
            include: {
                votes: true,
            },
        });
        if (!poll) {
            throw new errorHandler_1.AppError('Poll not found', 404);
        }
        const options = JSON.parse(poll.options);
        if (!options.includes(correctAnswer)) {
            throw new errorHandler_1.AppError('Invalid correct answer', 400);
        }
        const correctVotes = poll.votes.filter((vote) => vote.answer === correctAnswer);
        for (const vote of correctVotes) {
            await database_1.default.pollVote.update({
                where: { id: vote.id },
                data: { points: 10 },
            });
        }
        const updatedPoll = await database_1.default.poll.update({
            where: { id: pollId },
            data: {
                status: 'RESOLVED',
                correctAnswer,
            },
        });
        return {
            poll: updatedPoll,
            correctVoters: correctVotes.length,
            totalVoters: poll.votes.length,
        };
    }
    async getUserVotes(userId, matchId) {
        const where = { userId };
        if (matchId) {
            where.poll = { matchId };
        }
        const votes = await database_1.default.pollVote.findMany({
            where,
            include: {
                poll: {
                    include: {
                        match: {
                            select: {
                                homeTeam: { select: { name: true } },
                                awayTeam: { select: { name: true } },
                            },
                        },
                    },
                },
            },
            orderBy: {
                votedAt: 'desc',
            },
        });
        return votes.map((vote) => ({
            ...vote,
            poll: {
                ...vote.poll,
                options: JSON.parse(vote.poll.options),
            },
        }));
    }
    async getPollLeaderboard(matchId) {
        const where = {};
        if (matchId) {
            where.poll = { matchId };
        }
        const userPoints = await database_1.default.pollVote.groupBy({
            by: ['userId'],
            _sum: {
                points: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    points: 'desc',
                },
            },
            take: 10,
        });
        const leaderboard = await Promise.all(userPoints.map(async (entry) => {
            const user = await database_1.default.user.findUnique({
                where: { id: entry.userId },
                select: { name: true, email: true },
            });
            return {
                userId: entry.userId,
                userName: user?.name || 'Unknown',
                totalPoints: entry._sum.points || 0,
                totalVotes: entry._count.id,
            };
        }));
        return leaderboard;
    }
    calculateVoteSummary(votes, options) {
        const summary = {};
        options.forEach((option) => {
            summary[option] = { count: 0, percentage: 0 };
        });
        votes.forEach((vote) => {
            if (summary[vote.answer]) {
                summary[vote.answer].count++;
            }
        });
        const totalVotes = votes.length;
        if (totalVotes > 0) {
            Object.keys(summary).forEach((option) => {
                summary[option].percentage = Math.round((summary[option].count / totalVotes) * 100);
            });
        }
        return summary;
    }
    async createSuggestedPolls(matchId, createdBy) {
        const match = await database_1.default.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
            },
        });
        if (!match) {
            throw new errorHandler_1.AppError('Match not found', 404);
        }
        const suggestedPolls = [
            {
                question: `Who will win this match?`,
                options: [match.homeTeam.name, match.awayTeam.name],
                type: 'MATCH_WINNER',
            },
            {
                question: `Will there be a six in the next over?`,
                options: ['Yes', 'No'],
                type: 'NEXT_BALL',
            },
            {
                question: `Total runs in the next over?`,
                options: ['0-5', '6-10', '11-15', '16+'],
                type: 'RUNS_IN_OVER',
            },
        ];
        const createdPolls = [];
        for (const pollData of suggestedPolls) {
            const poll = await this.createPoll({
                matchId,
                question: pollData.question,
                options: pollData.options,
                type: pollData.type,
                createdBy,
            });
            createdPolls.push(poll);
        }
        return createdPolls;
    }
}
exports.PollService = PollService;
exports.pollService = new PollService();
//# sourceMappingURL=poll.service.js.map