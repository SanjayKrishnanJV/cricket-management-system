"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMatchSocket = void 0;
const match_service_1 = require("../services/match.service");
const auction_service_1 = require("../services/auction.service");
const poll_service_1 = require("../services/poll.service");
const winPredictor_service_1 = require("../services/winPredictor.service");
const matchDiscussion_service_1 = require("../services/matchDiscussion.service");
const database_1 = __importDefault(require("../config/database"));
const matchService = new match_service_1.MatchService();
const auctionService = new auction_service_1.AuctionService();
const setupMatchSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);
        socket.on('join-match', (matchId) => {
            socket.join(`match-${matchId}`);
            console.log(`Client ${socket.id} joined match-${matchId}`);
        });
        socket.on('leave-match', (matchId) => {
            socket.leave(`match-${matchId}`);
            console.log(`Client ${socket.id} left match-${matchId}`);
        });
        socket.on('record-ball', async (data) => {
            try {
                const ball = await matchService.recordBall(data.inningsId, data.bowlerId, data.batsmanId, data.ballData);
                const liveScore = await matchService.getLiveScore(data.matchId);
                const innings = await database_1.default.innings.findUnique({
                    where: { id: data.inningsId },
                });
                if (innings) {
                    const overNumber = Math.floor(innings.totalOvers);
                    const ballNumber = Math.round((innings.totalOvers % 1) * 10);
                    const winProbResult = await winPredictor_service_1.winPredictorService.calculateWinProbability(data.matchId, data.inningsId, overNumber, ballNumber);
                    if (winProbResult.success) {
                        io.to(`match-${data.matchId}`).emit('winProbabilityUpdate', {
                            probability: winProbResult.data,
                        });
                    }
                }
                io.to(`match-${data.matchId}`).emit('score-update', {
                    ball,
                    liveScore,
                });
                io.to(`match-${data.matchId}`).emit('ballRecorded', {
                    matchId: data.matchId,
                    ball,
                });
                console.log(`Ball recorded for match ${data.matchId}`);
            }
            catch (error) {
                socket.emit('error', {
                    message: 'Failed to record ball',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('get-live-score', async (matchId) => {
            try {
                const liveScore = await matchService.getLiveScore(matchId);
                socket.emit('live-score', liveScore);
            }
            catch (error) {
                socket.emit('error', {
                    message: 'Failed to get live score',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('join-auction', (auctionId) => {
            socket.join(`auction-${auctionId}`);
            console.log(`Client ${socket.id} joined auction-${auctionId}`);
        });
        socket.on('leave-auction', (auctionId) => {
            socket.leave(`auction-${auctionId}`);
            console.log(`Client ${socket.id} left auction-${auctionId}`);
        });
        socket.on('place-bid', async (data) => {
            try {
                const bid = await auctionService.placeBid(data.playerId, data.bidderId, data.amount);
                io.to(`auction-${data.auctionId}`).emit('new-bid', {
                    playerId: data.playerId,
                    bid,
                });
                console.log(`New bid placed for player ${data.playerId}`);
            }
            catch (error) {
                socket.emit('bid-error', {
                    message: 'Failed to place bid',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('sell-player', async (data) => {
            try {
                const result = await auctionService.sellPlayer(data.playerId);
                io.to(`auction-${data.auctionId}`).emit('player-sold', {
                    playerId: data.playerId,
                    result,
                });
                console.log(`Player ${data.playerId} sold to ${result.soldTo}`);
            }
            catch (error) {
                socket.emit('error', {
                    message: 'Failed to sell player',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('create-poll', async (data) => {
            try {
                const poll = await poll_service_1.pollService.createPoll({
                    matchId: data.matchId,
                    question: data.question,
                    options: data.options,
                    type: data.type,
                    createdBy: data.userId,
                });
                io.to(`match-${data.matchId}`).emit('new-poll', poll);
                console.log(`Poll created for match ${data.matchId}`);
            }
            catch (error) {
                socket.emit('poll-error', {
                    message: 'Failed to create poll',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('vote-poll', async (data) => {
            try {
                await poll_service_1.pollService.votePoll({
                    pollId: data.pollId,
                    userId: data.userId,
                    answer: data.answer,
                });
                const updatedPoll = await poll_service_1.pollService.getPollById(data.pollId);
                io.to(`match-${data.matchId}`).emit('poll-update', updatedPoll);
                console.log(`Vote recorded for poll ${data.pollId}`);
            }
            catch (error) {
                socket.emit('poll-error', {
                    message: 'Failed to vote on poll',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('close-poll', async (data) => {
            try {
                await poll_service_1.pollService.closePoll(data.pollId);
                const updatedPoll = await poll_service_1.pollService.getPollById(data.pollId);
                io.to(`match-${data.matchId}`).emit('poll-closed', updatedPoll);
                console.log(`Poll ${data.pollId} closed`);
            }
            catch (error) {
                socket.emit('poll-error', {
                    message: 'Failed to close poll',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('post-comment', async (data) => {
            try {
                const comment = await matchDiscussion_service_1.matchDiscussionService.postComment(data.matchId, data.userId, data.message, data.replyToId);
                io.to(`match-${data.matchId}`).emit('new-comment', comment.data);
                console.log(`Comment posted in match ${data.matchId}`);
            }
            catch (error) {
                socket.emit('comment-error', {
                    message: 'Failed to post comment',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('add-reaction', async (data) => {
            try {
                const reaction = await matchDiscussion_service_1.matchDiscussionService.addReaction(data.commentId, data.userId, data.emoji);
                io.to(`match-${data.matchId}`).emit('reaction-update', {
                    commentId: data.commentId,
                    reaction: reaction.data,
                    action: reaction.action,
                });
                console.log(`Reaction ${data.emoji} added to comment ${data.commentId}`);
            }
            catch (error) {
                socket.emit('reaction-error', {
                    message: 'Failed to add reaction',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('update-karma', async (data) => {
            try {
                const comment = await matchDiscussion_service_1.matchDiscussionService.updateKarma(data.commentId, data.action);
                io.to(`match-${data.matchId}`).emit('karma-update', {
                    commentId: data.commentId,
                    karma: comment.data.karma,
                });
                console.log(`Karma updated for comment ${data.commentId}`);
            }
            catch (error) {
                socket.emit('karma-error', {
                    message: 'Failed to update karma',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('delete-comment', async (data) => {
            try {
                await matchDiscussion_service_1.matchDiscussionService.deleteComment(data.commentId, data.userId);
                io.to(`match-${data.matchId}`).emit('comment-deleted', {
                    commentId: data.commentId,
                });
                console.log(`Comment ${data.commentId} deleted`);
            }
            catch (error) {
                socket.emit('comment-error', {
                    message: 'Failed to delete comment',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};
exports.setupMatchSocket = setupMatchSocket;
//# sourceMappingURL=match.socket.js.map