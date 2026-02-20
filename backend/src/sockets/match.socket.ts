import { Server, Socket } from 'socket.io';
import { MatchService } from '../services/match.service';
import { AuctionService } from '../services/auction.service';
import { pollService } from '../services/poll.service';
import { winPredictorService } from '../services/winPredictor.service';
import { matchDiscussionService } from '../services/matchDiscussion.service';
import prisma from '../config/database';

const matchService = new MatchService();
const auctionService = new AuctionService();

export const setupMatchSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join match room
    socket.on('join-match', (matchId: string) => {
      socket.join(`match-${matchId}`);
      console.log(`Client ${socket.id} joined match-${matchId}`);
    });

    // Leave match room
    socket.on('leave-match', (matchId: string) => {
      socket.leave(`match-${matchId}`);
      console.log(`Client ${socket.id} left match-${matchId}`);
    });

    // Record ball event (from scorer)
    socket.on('record-ball', async (data: {
      matchId: string;
      inningsId: string;
      bowlerId: string;
      batsmanId: string;
      ballData: any;
    }) => {
      try {
        const ball = await matchService.recordBall(
          data.inningsId,
          data.bowlerId,
          data.batsmanId,
          data.ballData
        );

        // Get updated live score
        const liveScore = await matchService.getLiveScore(data.matchId);

        // Calculate win probability
        const innings = await prisma.innings.findUnique({
          where: { id: data.inningsId },
        });

        if (innings) {
          const overNumber = Math.floor(innings.totalOvers);
          const ballNumber = Math.round((innings.totalOvers % 1) * 10);

          const winProbResult = await winPredictorService.calculateWinProbability(
            data.matchId,
            data.inningsId,
            overNumber,
            ballNumber
          );

          // Broadcast win probability update
          if (winProbResult.success) {
            io.to(`match-${data.matchId}`).emit('winProbabilityUpdate', {
              probability: winProbResult.data,
            });
          }
        }

        // Broadcast to all clients watching this match
        io.to(`match-${data.matchId}`).emit('score-update', {
          ball,
          liveScore,
        });

        // Also emit ballRecorded event for other components
        io.to(`match-${data.matchId}`).emit('ballRecorded', {
          matchId: data.matchId,
          ball,
        });

        console.log(`Ball recorded for match ${data.matchId}`);
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to record ball',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Get live score
    socket.on('get-live-score', async (matchId: string) => {
      try {
        const liveScore = await matchService.getLiveScore(matchId);
        socket.emit('live-score', liveScore);
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to get live score',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Join auction room
    socket.on('join-auction', (auctionId: string) => {
      socket.join(`auction-${auctionId}`);
      console.log(`Client ${socket.id} joined auction-${auctionId}`);
    });

    // Leave auction room
    socket.on('leave-auction', (auctionId: string) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`Client ${socket.id} left auction-${auctionId}`);
    });

    // Place bid in auction
    socket.on('place-bid', async (data: {
      auctionId: string;
      playerId: string;
      bidderId: string;
      amount: number;
    }) => {
      try {
        const bid = await auctionService.placeBid(
          data.playerId,
          data.bidderId,
          data.amount
        );

        // Broadcast new bid to all auction participants
        io.to(`auction-${data.auctionId}`).emit('new-bid', {
          playerId: data.playerId,
          bid,
        });

        console.log(`New bid placed for player ${data.playerId}`);
      } catch (error) {
        socket.emit('bid-error', {
          message: 'Failed to place bid',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Sell player (end auction for that player)
    socket.on('sell-player', async (data: {
      auctionId: string;
      playerId: string;
    }) => {
      try {
        const result = await auctionService.sellPlayer(data.playerId);

        // Broadcast player sold event
        io.to(`auction-${data.auctionId}`).emit('player-sold', {
          playerId: data.playerId,
          result,
        });

        console.log(`Player ${data.playerId} sold to ${result.soldTo}`);
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to sell player',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Poll events

    // Create a new poll
    socket.on('create-poll', async (data: {
      matchId: string;
      question: string;
      options: string[];
      type: string;
      userId: string;
    }) => {
      try {
        const poll = await pollService.createPoll({
          matchId: data.matchId,
          question: data.question,
          options: data.options,
          type: data.type,
          createdBy: data.userId,
        });

        // Broadcast new poll to all clients watching this match
        io.to(`match-${data.matchId}`).emit('new-poll', poll);

        console.log(`Poll created for match ${data.matchId}`);
      } catch (error) {
        socket.emit('poll-error', {
          message: 'Failed to create poll',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Vote on a poll
    socket.on('vote-poll', async (data: {
      matchId: string;
      pollId: string;
      userId: string;
      answer: string;
    }) => {
      try {
        await pollService.votePoll({
          pollId: data.pollId,
          userId: data.userId,
          answer: data.answer,
        });

        // Get updated poll with vote counts
        const updatedPoll = await pollService.getPollById(data.pollId);

        // Broadcast updated poll results to all clients watching this match
        io.to(`match-${data.matchId}`).emit('poll-update', updatedPoll);

        console.log(`Vote recorded for poll ${data.pollId}`);
      } catch (error) {
        socket.emit('poll-error', {
          message: 'Failed to vote on poll',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Close a poll
    socket.on('close-poll', async (data: {
      matchId: string;
      pollId: string;
    }) => {
      try {
        await pollService.closePoll(data.pollId);

        // Get updated poll
        const updatedPoll = await pollService.getPollById(data.pollId);

        // Broadcast poll closure
        io.to(`match-${data.matchId}`).emit('poll-closed', updatedPoll);

        console.log(`Poll ${data.pollId} closed`);
      } catch (error) {
        socket.emit('poll-error', {
          message: 'Failed to close poll',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Match Discussion / Comments

    // Post a comment
    socket.on('post-comment', async (data: {
      matchId: string;
      userId: string;
      message: string;
      replyToId?: string;
    }) => {
      try {
        const comment = await matchDiscussionService.postComment(
          data.matchId,
          data.userId,
          data.message,
          data.replyToId
        );

        // Broadcast new comment to all clients watching this match
        io.to(`match-${data.matchId}`).emit('new-comment', comment.data);

        console.log(`Comment posted in match ${data.matchId}`);
      } catch (error) {
        socket.emit('comment-error', {
          message: 'Failed to post comment',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Add reaction to a comment
    socket.on('add-reaction', async (data: {
      matchId: string;
      commentId: string;
      userId: string;
      emoji: string;
    }) => {
      try {
        const reaction = await matchDiscussionService.addReaction(
          data.commentId,
          data.userId,
          data.emoji
        );

        // Broadcast reaction update to all clients watching this match
        io.to(`match-${data.matchId}`).emit('reaction-update', {
          commentId: data.commentId,
          reaction: reaction.data,
          action: reaction.action,
        });

        console.log(`Reaction ${data.emoji} added to comment ${data.commentId}`);
      } catch (error) {
        socket.emit('reaction-error', {
          message: 'Failed to add reaction',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Update comment karma (upvote/downvote)
    socket.on('update-karma', async (data: {
      matchId: string;
      commentId: string;
      action: 'upvote' | 'downvote';
    }) => {
      try {
        const comment = await matchDiscussionService.updateKarma(
          data.commentId,
          data.action
        );

        // Broadcast karma update to all clients watching this match
        io.to(`match-${data.matchId}`).emit('karma-update', {
          commentId: data.commentId,
          karma: comment.data.karma,
        });

        console.log(`Karma updated for comment ${data.commentId}`);
      } catch (error) {
        socket.emit('karma-error', {
          message: 'Failed to update karma',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Delete comment
    socket.on('delete-comment', async (data: {
      matchId: string;
      commentId: string;
      userId: string;
    }) => {
      try {
        await matchDiscussionService.deleteComment(data.commentId, data.userId);

        // Broadcast comment deletion to all clients watching this match
        io.to(`match-${data.matchId}`).emit('comment-deleted', {
          commentId: data.commentId,
        });

        console.log(`Comment ${data.commentId} deleted`);
      } catch (error) {
        socket.emit('comment-error', {
          message: 'Failed to delete comment',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
