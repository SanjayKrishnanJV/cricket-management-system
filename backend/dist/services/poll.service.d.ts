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
export declare class PollService {
    createPoll(data: CreatePollInput): Promise<{
        options: any;
        match: {
            homeTeam: {
                name: string;
            };
            awayTeam: {
                name: string;
            };
        };
        creator: {
            name: string;
            email: string;
        };
        id: string;
        status: import(".prisma/client").$Enums.PollStatus;
        createdAt: Date;
        matchId: string;
        type: import(".prisma/client").$Enums.PollType;
        overNumber: number | null;
        question: string;
        correctAnswer: string | null;
        expiresAt: Date | null;
        createdBy: string;
    }>;
    getPollsByMatch(matchId: string, status?: string): Promise<{
        options: any;
        voteCount: number;
        voteSummary: Record<string, {
            count: number;
            percentage: number;
        }>;
        _count: {
            votes: number;
        };
        creator: {
            name: string;
        };
        votes: {
            userId: string;
            answer: string;
        }[];
        id: string;
        status: import(".prisma/client").$Enums.PollStatus;
        createdAt: Date;
        matchId: string;
        type: import(".prisma/client").$Enums.PollType;
        overNumber: number | null;
        question: string;
        correctAnswer: string | null;
        expiresAt: Date | null;
        createdBy: string;
    }[]>;
    getPollById(pollId: string): Promise<{
        options: any;
        voteCount: number;
        voteSummary: Record<string, {
            count: number;
            percentage: number;
        }>;
        match: {
            homeTeam: {
                name: string;
            };
            awayTeam: {
                name: string;
            };
        };
        _count: {
            votes: number;
        };
        creator: {
            name: string;
            email: string;
        };
        votes: ({
            user: {
                name: string;
            };
        } & {
            id: string;
            pollId: string;
            userId: string;
            answer: string;
            points: number;
            votedAt: Date;
        })[];
        id: string;
        status: import(".prisma/client").$Enums.PollStatus;
        createdAt: Date;
        matchId: string;
        type: import(".prisma/client").$Enums.PollType;
        overNumber: number | null;
        question: string;
        correctAnswer: string | null;
        expiresAt: Date | null;
        createdBy: string;
    }>;
    votePoll(data: VotePollInput): Promise<{
        id: string;
        pollId: string;
        userId: string;
        answer: string;
        points: number;
        votedAt: Date;
    }>;
    closePoll(pollId: string): Promise<{
        options: string;
        id: string;
        status: import(".prisma/client").$Enums.PollStatus;
        createdAt: Date;
        matchId: string;
        type: import(".prisma/client").$Enums.PollType;
        overNumber: number | null;
        question: string;
        correctAnswer: string | null;
        expiresAt: Date | null;
        createdBy: string;
    }>;
    resolvePoll(pollId: string, correctAnswer: string): Promise<{
        poll: {
            options: string;
            id: string;
            status: import(".prisma/client").$Enums.PollStatus;
            createdAt: Date;
            matchId: string;
            type: import(".prisma/client").$Enums.PollType;
            overNumber: number | null;
            question: string;
            correctAnswer: string | null;
            expiresAt: Date | null;
            createdBy: string;
        };
        correctVoters: number;
        totalVoters: number;
    }>;
    getUserVotes(userId: string, matchId?: string): Promise<{
        poll: {
            options: any;
            match: {
                homeTeam: {
                    name: string;
                };
                awayTeam: {
                    name: string;
                };
            };
            id: string;
            status: import(".prisma/client").$Enums.PollStatus;
            createdAt: Date;
            matchId: string;
            type: import(".prisma/client").$Enums.PollType;
            overNumber: number | null;
            question: string;
            correctAnswer: string | null;
            expiresAt: Date | null;
            createdBy: string;
        };
        id: string;
        pollId: string;
        userId: string;
        answer: string;
        points: number;
        votedAt: Date;
    }[]>;
    getPollLeaderboard(matchId?: string): Promise<{
        userId: string;
        userName: string;
        totalPoints: number;
        totalVotes: number;
    }[]>;
    private calculateVoteSummary;
    createSuggestedPolls(matchId: string, createdBy: string): Promise<any[]>;
}
export declare const pollService: PollService;
//# sourceMappingURL=poll.service.d.ts.map