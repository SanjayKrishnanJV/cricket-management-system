'use client';

import { useState, useEffect } from 'react';
import { pollAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UserVoteHistoryProps {
  matchId?: string;
}

export default function UserVoteHistory({ matchId }: UserVoteHistoryProps) {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      loadVotes();
    }
  }, [showHistory, matchId]);

  const loadVotes = async () => {
    try {
      const response = await pollAPI.getUserVotes(matchId);
      setVotes(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load votes:', error);
      setLoading(false);
    }
  };

  if (!showHistory) {
    return (
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="py-4">
          <button
            onClick={() => setShowHistory(true)}
            className="w-full text-center text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            📊 View My Prediction History
          </button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-gray-500">Loading your votes...</p>
        </CardContent>
      </Card>
    );
  }

  if (votes.length === 0) {
    return (
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📊 My Predictions
            </CardTitle>
            <button
              onClick={() => setShowHistory(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">You haven't voted on any polls yet</p>
        </CardContent>
      </Card>
    );
  }

  const totalPoints = votes.reduce((sum, vote) => sum + (vote.points || 0), 0);

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 My Predictions
          </CardTitle>
          <button
            onClick={() => setShowHistory(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕ Close
          </button>
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            Total Votes: <span className="font-bold">{votes.length}</span>
          </span>
          <span className="text-blue-600">
            Points Earned: <span className="font-bold">{totalPoints}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className={`rounded-lg border p-3 ${
                vote.points > 0
                  ? 'border-green-300 bg-green-50'
                  : vote.poll.status === 'RESOLVED'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{vote.poll.question}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Your answer: <span className="font-medium">{vote.answer}</span>
                  </p>
                  {vote.poll.status === 'RESOLVED' && vote.poll.correctAnswer && (
                    <p className="mt-1 text-sm">
                      Correct answer:{' '}
                      <span
                        className={`font-medium ${
                          vote.answer === vote.poll.correctAnswer
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {vote.poll.correctAnswer}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(vote.votedAt).toLocaleString()}
                  </p>
                </div>
                {vote.points > 0 && (
                  <div className="ml-2 flex flex-col items-center">
                    <span className="text-2xl">✓</span>
                    <span className="text-xs font-bold text-green-600">+{vote.points}pts</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
