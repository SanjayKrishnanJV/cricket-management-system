'use client';

import { useEffect, useState } from 'react';
import { pollAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface LivePollsProps {
  matchId: string;
}

export function LivePolls({ matchId }: LivePollsProps) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [votingInProgress, setVotingInProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPolls();

    // Real-time poll updates
    socketService.connect();

    const handlePollCreated = (data: any) => {
      if (data.matchId === matchId) {
        fetchPolls();
      }
    };

    const handlePollVoted = (data: any) => {
      if (data.matchId === matchId) {
        fetchPolls();
      }
    };

    socketService.getSocket().on('pollCreated', handlePollCreated);
    socketService.getSocket().on('pollVoted', handlePollVoted);

    return () => {
      socketService.getSocket().off('pollCreated', handlePollCreated);
      socketService.getSocket().off('pollVoted', handlePollVoted);
    };
  }, [matchId]);

  const fetchPolls = async () => {
    try {
      const response = await pollAPI.getByMatch(matchId);
      if (response.data.success) {
        setPolls(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string) => {
    const answer = selectedAnswers[pollId];
    if (!answer) {
      alert('Please select an option');
      return;
    }

    setVotingInProgress((prev) => ({ ...prev, [pollId]: true }));

    try {
      await pollAPI.vote(pollId, answer);
      await fetchPolls(); // Refresh to get updated results
      setSelectedAnswers((prev) => {
        const { [pollId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error: any) {
      console.error('Error voting on poll:', error);
      alert(error.response?.data?.message || 'Failed to vote on poll');
    } finally {
      setVotingInProgress((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  const getPollTypeIcon = (type: string) => {
    switch (type) {
      case 'MATCH_WINNER':
        return '🏆';
      case 'TOP_SCORER':
        return '🏏';
      case 'TOP_WICKET_TAKER':
        return '🎯';
      case 'RUNS_IN_OVER':
        return '📊';
      case 'NEXT_BALL':
        return '⚡';
      default:
        return '❓';
    }
  };

  const calculatePercentage = (poll: any, option: string) => {
    const totalVotes = poll.votes?.length || 0;
    if (totalVotes === 0) return 0;

    const votesForOption = poll.votes.filter((v: any) => v.answer === option).length;
    return Math.round((votesForOption / totalVotes) * 100);
  };

  const hasUserVoted = (poll: any) => {
    // Check if current user has voted (you'd need to pass userId as a prop or get from context)
    // For now, we'll check if any answer is selected for this poll
    return poll.votes && poll.votes.some((v: any) => v.userId === localStorage.getItem('userId'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500">No active polls for this match</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {polls.filter(p => p.status === 'ACTIVE').map((poll) => {
        const userVoted = hasUserVoted(poll);
        // Handle options - might be string or already parsed
        const options = typeof poll.options === 'string'
          ? JSON.parse(poll.options)
          : poll.options;
        const totalVotes = poll.votes?.length || 0;

        return (
          <div key={poll.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {/* Poll Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getPollTypeIcon(poll.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{poll.question}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </p>
                </div>
              </div>
              {poll.type === 'PREDICTION' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Points Contest
                </span>
              )}
            </div>

            {/* Poll Options */}
            <div className="space-y-3">
              {options.map((option: string, index: number) => {
                const percentage = calculatePercentage(poll, option);
                const isSelected = selectedAnswers[poll.id] === option;

                return (
                  <div key={index}>
                    {!userVoted ? (
                      // Voting Interface
                      <button
                        onClick={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [poll.id]: option }))
                        }
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M10 3L4.5 8.5 2 6" stroke="white" strokeWidth="2" fill="none" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{option}</span>
                        </div>
                      </button>
                    ) : (
                      // Results Display
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{option}</span>
                          <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Vote Button */}
            {!userVoted && (
              <button
                onClick={() => handleVote(poll.id)}
                disabled={!selectedAnswers[poll.id] || votingInProgress[poll.id]}
                className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {votingInProgress[poll.id] ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Vote'
                )}
              </button>
            )}

            {/* Poll Metadata */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
              <span>Created {new Date(poll.createdAt).toLocaleString()}</span>
              {poll.expiresAt && (
                <span>Expires {new Date(poll.expiresAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
