import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { rewardsService } from './rewards.service';

export interface CreatePollInput {
  matchId: string;
  question: string;
  options: string[];
  type: string;
  overNumber?: number;
  expiresAt?: Date;
  createdBy: string;
}

export interface VotePollInput {
  pollId: string;
  userId: string;
  answer: string;
}

export class PollService {
  /**
   * Create a new poll for a match
   */
  async createPoll(data: CreatePollInput) {
    const match = await prisma.match.findUnique({
      where: { id: data.matchId },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const poll = await prisma.poll.create({
      data: {
        matchId: data.matchId,
        question: data.question,
        options: JSON.stringify(data.options),
        type: data.type as any,
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

  /**
   * Get all polls for a match
   */
  async getPollsByMatch(matchId: string, status?: string) {
    const where: any = { matchId };

    if (status) {
      where.status = status;
    }

    const polls = await prisma.poll.findMany({
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

  /**
   * Get a single poll by ID
   */
  async getPollById(pollId: string) {
    const poll = await prisma.poll.findUnique({
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
      throw new AppError('Poll not found', 404);
    }

    return {
      ...poll,
      options: JSON.parse(poll.options),
      voteCount: poll._count.votes,
      voteSummary: this.calculateVoteSummary(poll.votes, JSON.parse(poll.options)),
    };
  }

  /**
   * Vote on a poll
   */
  async votePoll(data: VotePollInput) {
    const poll = await prisma.poll.findUnique({
      where: { id: data.pollId },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    if (poll.status !== 'ACTIVE') {
      throw new AppError('This poll is no longer active', 400);
    }

    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new AppError('This poll has expired', 400);
    }

    const options = JSON.parse(poll.options);
    if (!options.includes(data.answer)) {
      throw new AppError('Invalid answer option', 400);
    }

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_userId: {
          pollId: data.pollId,
          userId: data.userId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      const vote = await prisma.pollVote.update({
        where: { id: existingVote.id },
        data: {
          answer: data.answer,
          votedAt: new Date(),
        },
      });

      return vote;
    } else {
      // Create new vote
      const vote = await prisma.pollVote.create({
        data: {
          pollId: data.pollId,
          userId: data.userId,
          answer: data.answer,
        },
      });

      return vote;
    }
  }

  /**
   * Close a poll
   */
  async closePoll(pollId: string) {
    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        status: 'CLOSED',
      },
    });

    return poll;
  }

  /**
   * Resolve a poll with correct answer (for predictions)
   */
  async resolvePoll(pollId: string, correctAnswer: string) {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        votes: true,
      },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    const options = JSON.parse(poll.options);
    if (!options.includes(correctAnswer)) {
      throw new AppError('Invalid correct answer', 400);
    }

    // Award points to correct voters
    const correctVotes = poll.votes.filter((vote) => vote.answer === correctAnswer);

    for (const vote of correctVotes) {
      await prisma.pollVote.update({
        where: { id: vote.id },
        data: { points: 10 }, // Award 10 points for correct prediction
      });

      // Award XP to user for correct prediction
      await rewardsService.awardXP(
        vote.userId,
        10,
        'Correct prediction',
        { matchId: poll.matchId, pollId: poll.id }
      );
    }

    // Update poll status
    const updatedPoll = await prisma.poll.update({
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

  /**
   * Get user's poll votes
   */
  async getUserVotes(userId: string, matchId?: string) {
    const where: any = { userId };

    if (matchId) {
      where.poll = { matchId };
    }

    const votes = await prisma.pollVote.findMany({
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

  /**
   * Get poll leaderboard (top predictors)
   */
  async getPollLeaderboard(matchId?: string) {
    const where: any = {};

    if (matchId) {
      where.poll = { matchId };
    }

    const userPoints = await prisma.pollVote.groupBy({
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

    const leaderboard = await Promise.all(
      userPoints.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { name: true, email: true },
        });

        return {
          userId: entry.userId,
          userName: user?.name || 'Unknown',
          totalPoints: entry._sum.points || 0,
          totalVotes: entry._count.id,
        };
      })
    );

    return leaderboard;
  }

  /**
   * Calculate vote summary (percentage for each option)
   */
  private calculateVoteSummary(votes: any[], options: string[]) {
    const summary: Record<string, { count: number; percentage: number }> = {};

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

  /**
   * Auto-create polls for a match (suggested polls)
   */
  async createSuggestedPolls(matchId: string, createdBy: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
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

export const pollService = new PollService();
