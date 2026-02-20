export declare class MatchDiscussionService {
    postComment(matchId: string, userId: string, message: string, replyToId?: string): Promise<{
        success: boolean;
        data: {
            user: {
                name: string;
                id: string;
                email: string;
            };
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                commentId: string;
                emoji: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            userId: string;
            message: string;
            isPinned: boolean;
            replyToId: string | null;
            karma: number;
        };
    }>;
    getMatchComments(matchId: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            comments: ({
                user: {
                    name: string;
                    id: string;
                    email: string;
                };
                replies: ({
                    user: {
                        name: string;
                        id: string;
                        email: string;
                    };
                    reactions: {
                        id: string;
                        createdAt: Date;
                        userId: string;
                        commentId: string;
                        emoji: string;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    matchId: string;
                    userId: string;
                    message: string;
                    isPinned: boolean;
                    replyToId: string | null;
                    karma: number;
                })[];
                reactions: ({
                    user: {
                        name: string;
                        id: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    userId: string;
                    commentId: string;
                    emoji: string;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                matchId: string;
                userId: string;
                message: string;
                isPinned: boolean;
                replyToId: string | null;
                karma: number;
            })[];
            total: number;
            hasMore: boolean;
        };
    }>;
    addReaction(commentId: string, userId: string, emoji: string): Promise<{
        success: boolean;
        action: string;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        action: string;
        data: {
            user: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            commentId: string;
            emoji: string;
        };
        message?: undefined;
    }>;
    updateKarma(commentId: string, action: 'upvote' | 'downvote'): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            userId: string;
            message: string;
            isPinned: boolean;
            replyToId: string | null;
            karma: number;
        };
    }>;
    togglePin(commentId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            userId: string;
            message: string;
            isPinned: boolean;
            replyToId: string | null;
            karma: number;
        };
        message: string;
    }>;
    deleteComment(commentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getTopComments(matchId: string, limit?: number): Promise<{
        success: boolean;
        data: ({
            user: {
                name: string;
                id: string;
            };
            reactions: {
                id: string;
                createdAt: Date;
                userId: string;
                commentId: string;
                emoji: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            userId: string;
            message: string;
            isPinned: boolean;
            replyToId: string | null;
            karma: number;
        })[];
    }>;
}
export declare const matchDiscussionService: MatchDiscussionService;
//# sourceMappingURL=matchDiscussion.service.d.ts.map