'use client';

import { useEffect, useState, useRef } from 'react';
import { matchDiscussionAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface MatchDiscussionProps {
  matchId: string;
  userId?: string;
}

interface Comment {
  id: string;
  message: string;
  karma: number;
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  reactions: Array<{
    emoji: string;
    user: { name: string };
  }>;
  replies?: Comment[];
}

export function MatchDiscussion({ matchId, userId = 'guest' }: MatchDiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();

    // Real-time updates via Socket.IO
    socketService.connect();
    socketService.joinMatch(matchId);

    const handleNewComment = (comment: Comment) => {
      setComments((prev) => [comment, ...prev]);
      scrollToBottom();
    };

    const handleReactionUpdate = (data: any) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === data.commentId
            ? {
                ...comment,
                reactions:
                  data.action === 'added'
                    ? [...comment.reactions, data.reaction]
                    : comment.reactions.filter(
                        (r) => !(r.emoji === data.reaction.emoji && r.user.name === data.reaction.user.name)
                      ),
              }
            : comment
        )
      );
    };

    const handleKarmaUpdate = (data: any) => {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === data.commentId ? { ...comment, karma: data.karma } : comment
        )
      );
    };

    const handleCommentDeleted = (data: any) => {
      setComments((prev) => prev.filter((comment) => comment.id !== data.commentId));
    };

    socketService.getSocket().on('new-comment', handleNewComment);
    socketService.getSocket().on('reaction-update', handleReactionUpdate);
    socketService.getSocket().on('karma-update', handleKarmaUpdate);
    socketService.getSocket().on('comment-deleted', handleCommentDeleted);

    return () => {
      socketService.getSocket().off('new-comment', handleNewComment);
      socketService.getSocket().off('reaction-update', handleReactionUpdate);
      socketService.getSocket().off('karma-update', handleKarmaUpdate);
      socketService.getSocket().off('comment-deleted', handleCommentDeleted);
      socketService.leaveMatch(matchId);
    };
  }, [matchId]);

  const fetchComments = async () => {
    try {
      const response = await matchDiscussionAPI.getComments(matchId, 100);
      if (response.data.success) {
        setComments(response.data.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await matchDiscussionAPI.postComment(
        matchId,
        newMessage,
        userId,
        replyTo || undefined
      );

      if (response.data.success) {
        setNewMessage('');
        setReplyTo(null);
        // Socket will handle adding the comment to the list
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      await matchDiscussionAPI.addReaction(commentId, emoji, userId);
      // Socket will handle updating the reaction
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleKarma = async (commentId: string, action: 'upvote' | 'downvote') => {
    try {
      await matchDiscussionAPI.updateKarma(commentId, action);
      // Socket will handle updating the karma
    } catch (error) {
      console.error('Error updating karma:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await matchDiscussionAPI.deleteComment(commentId, userId);
      // Socket will handle removing the comment
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const commonEmojis = ['👍', '❤️', '😂', '🔥', '🏏', '👏'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">💬 Live Discussion</h2>
        <p className="text-sm text-gray-500 mt-1">{comments.length} comments</p>
      </div>

      {/* Comments List */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">💬</p>
            <p>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`${
                comment.isPinned ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'
              } p-4 rounded-lg`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900">{comment.user.name}</span>
                  {comment.isPinned && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      📌 Pinned
                    </span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {comment.user.id === userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Comment Message */}
              <p className="text-gray-800 mb-3">{comment.message}</p>

              {/* Reactions & Karma */}
              <div className="flex items-center gap-4 text-sm">
                {/* Karma (Upvote/Downvote) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleKarma(comment.id, 'upvote')}
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    ⬆️
                  </button>
                  <span className="font-semibold">{comment.karma}</span>
                  <button
                    onClick={() => handleKarma(comment.id, 'downvote')}
                    className="hover:bg-gray-200 p-1 rounded"
                  >
                    ⬇️
                  </button>
                </div>

                {/* Quick Emoji Reactions */}
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className="hover:bg-gray-200 px-2 py-1 rounded"
                  >
                    {emoji}
                    {comment.reactions?.filter((r) => r.emoji === emoji).length > 0 && (
                      <span className="ml-1 text-xs">
                        {comment.reactions.filter((r) => r.emoji === emoji).length}
                      </span>
                    )}
                  </button>
                ))}

                {/* Reply Button */}
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-6 space-y-2 border-l-2 border-gray-300 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-white p-2 rounded">
                      <p className="text-sm">
                        <span className="font-semibold">{reply.user.name}</span>: {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Comment Input */}
      <form onSubmit={handlePostComment} className="p-4 border-t border-gray-200">
        {replyTo && (
          <div className="mb-2 text-sm bg-blue-50 p-2 rounded flex justify-between items-center">
            <span className="text-blue-800">Replying to comment</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Join the discussion..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
