'use client';

import { useState, useEffect } from 'react';
import { pollAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PollProps {
  matchId: string;
  userId: string;
}

export default function LivePoll({ matchId, userId }: PollProps) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  useEffect(() => {
    // Join the match room to receive real-time poll updates
    socketService.joinMatch(matchId);

    loadPolls();
    setupSocketListeners();

    return () => {
      socketService.offNewPoll();
      socketService.offPollUpdate();
      socketService.offPollClosed();
      socketService.leaveMatch(matchId);
    };
  }, [matchId]);

  const loadPolls = async () => {
    try {
      const response = await pollAPI.getByMatch(matchId, 'ACTIVE');
      setPolls(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load polls:', error);
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // New poll created
    socketService.onNewPoll((newPoll) => {
      setPolls((prev) => [newPoll, ...prev]);
    });

    // Poll updated (new votes)
    socketService.onPollUpdate((updatedPoll) => {
      setPolls((prev) =>
        prev.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll))
      );
    });

    // Poll closed
    socketService.onPollClosed((closedPoll) => {
      setPolls((prev) =>
        prev.map((poll) => (poll.id === closedPoll.id ? closedPoll : poll))
      );
    });
  };

  const handleVote = async (pollId: string, answer: string) => {
    try {
      setVotingPollId(pollId);
      await pollAPI.vote(pollId, answer);

      // Emit socket event for real-time update
      socketService.votePoll(matchId, pollId, userId, answer);

      // Refresh polls to get updated vote counts
      await loadPolls();
      setVotingPollId(null);
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert(error.response?.data?.message || 'Failed to vote on poll');
      setVotingPollId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-gray-500">Loading polls...</p>
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🗳️ Live Polls & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No active polls at the moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        🗳️ Live Polls & Predictions
      </h2>

      {polls.map((poll) => (
        <Card key={poll.id} className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{poll.question}</CardTitle>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {poll.type.replace(/_/g, ' ')}
                  </span>
                  <span>·</span>
                  <span>{poll.voteCount || 0} votes</span>
                  {poll.status === 'CLOSED' && (
                    <>
                      <span>·</span>
                      <span className="text-red-600 font-medium">CLOSED</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poll.options.map((option: string) => {
                const voteSummary = poll.voteSummary?.[option] || { count: 0, percentage: 0 };
                const hasVoted = poll.votes?.some(
                  (vote: any) => vote.userId === userId && vote.answer === option
                );

                return (
                  <div key={option} className="space-y-1">
                    <Button
                      variant={hasVoted ? 'primary' : 'outline'}
                      className={`w-full justify-between ${
                        poll.status === 'CLOSED' ? 'cursor-not-allowed opacity-60' : ''
                      }`}
                      onClick={() => poll.status === 'ACTIVE' && handleVote(poll.id, option)}
                      disabled={poll.status === 'CLOSED' || votingPollId === poll.id}
                    >
                      <span className="flex items-center gap-2">
                        {hasVoted && <span className="text-lg">✓</span>}
                        {option}
                      </span>
                      <span className="font-bold">{voteSummary.percentage}%</span>
                    </Button>

                    {/* Progress bar */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                          hasVoted ? 'bg-blue-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${voteSummary.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{voteSummary.count} votes</p>
                  </div>
                );
              })}
            </div>

            {/* Correct answer for resolved polls */}
            {poll.status === 'RESOLVED' && poll.correctAnswer && (
              <div className="mt-4 rounded-lg bg-green-100 p-3">
                <p className="text-sm font-medium text-green-800">
                  ✓ Correct Answer: <span className="font-bold">{poll.correctAnswer}</span>
                </p>
              </div>
            )}

            {/* Voting indicator */}
            {votingPollId === poll.id && (
              <div className="mt-3 text-center text-sm text-blue-600">
                Recording your vote...
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
