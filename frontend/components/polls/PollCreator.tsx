'use client';

import { useState } from 'react';
import { pollAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PollCreatorProps {
  matchId: string;
  userId: string;
  onPollCreated?: () => void;
}

export default function PollCreator({ matchId, userId, onPollCreated }: PollCreatorProps) {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState('GENERAL');
  const [creating, setCreating] = useState(false);

  const pollTypes = [
    { value: 'GENERAL', label: 'General Question' },
    { value: 'PREDICTION', label: 'Prediction (with points)' },
    { value: 'MATCH_WINNER', label: 'Match Winner' },
    { value: 'TOP_SCORER', label: 'Top Scorer' },
    { value: 'TOP_WICKET_TAKER', label: 'Top Wicket Taker' },
    { value: 'RUNS_IN_OVER', label: 'Runs in Over' },
    { value: 'NEXT_BALL', label: 'Next Ball Prediction' },
  ];

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    // Validate
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    try {
      setCreating(true);
      const response = await pollAPI.create({
        matchId,
        question: question.trim(),
        options: validOptions,
        type: pollType,
      });

      // Emit socket event for real-time update
      socketService.createPoll(matchId, {
        question: question.trim(),
        options: validOptions,
        type: pollType,
        userId,
      });

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setPollType('GENERAL');
      setShowForm(false);
      setCreating(false);

      if (onPollCreated) {
        onPollCreated();
      }

      alert('Poll created successfully!');
    } catch (error: any) {
      console.error('Failed to create poll:', error);
      alert(error.response?.data?.message || 'Failed to create poll');
      setCreating(false);
    }
  };

  const handleCreateSuggested = async () => {
    try {
      setCreating(true);
      await pollAPI.createSuggested(matchId);
      setCreating(false);

      if (onPollCreated) {
        onPollCreated();
      }

      alert('Suggested polls created successfully!');
    } catch (error: any) {
      console.error('Failed to create suggested polls:', error);
      alert(error.response?.data?.message || 'Failed to create suggested polls');
      setCreating(false);
    }
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">✨ Create Poll</span>
          {!showForm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
              disabled={creating}
            >
              + New Poll
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <div className="space-y-4">
            {/* Question */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Poll Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Who will win this match?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Poll Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Poll Type
              </label>
              <select
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {pollTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Options (2-4)
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 4 && (
                  <Button variant="outline" size="sm" onClick={handleAddOption}>
                    + Add Option
                  </Button>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleCreatePoll}
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Creating...' : 'Create Poll'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setQuestion('');
                  setOptions(['', '']);
                  setPollType('GENERAL');
                }}
                disabled={creating}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Create interactive polls and predictions for viewers during the match
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCreateSuggested}
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Creating...' : '🎲 Auto-Create Suggested Polls'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
