'use client';

import { useState } from 'react';
import { pollAPI } from '@/lib/api';

interface CreatePollProps {
  matchId: string;
  onPollCreated?: () => void;
}

export function CreatePoll({ matchId, onPollCreated }: CreatePollProps) {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [pollType, setPollType] = useState('GENERAL');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      alert('All options must be filled');
      return;
    }

    setCreating(true);

    try {
      await pollAPI.create({
        matchId,
        question: question.trim(),
        type: pollType,
        options: JSON.stringify(options.filter((opt) => opt.trim())),
      });

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setPollType('GENERAL');
      setShowForm(false);

      if (onPollCreated) {
        onPollCreated();
      }

      alert('Poll created successfully!');
    } catch (error: any) {
      console.error('Error creating poll:', error);
      alert(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSuggested = async () => {
    setCreating(true);
    try {
      await pollAPI.createSuggested(matchId);
      if (onPollCreated) {
        onPollCreated();
      }
      alert('Suggested polls created successfully!');
    } catch (error: any) {
      console.error('Error creating suggested polls:', error);
      alert(error.response?.data?.message || 'Failed to create suggested polls');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {!showForm ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ➕ Create Custom Poll
          </button>
          <button
            onClick={handleCreateSuggested}
            disabled={creating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
          >
            ✨ Create Suggested Polls
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Poll</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Poll Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Type
              </label>
              <select
                value={pollType}
                onChange={(e) => setPollType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GENERAL">General Question</option>
                <option value="PREDICTION">Prediction (Points)</option>
                <option value="MATCH_WINNER">Match Winner</option>
                <option value="TOP_SCORER">Top Scorer</option>
                <option value="TOP_WICKET_TAKER">Top Wicket Taker</option>
                <option value="RUNS_IN_OVER">Runs in Over</option>
                <option value="NEXT_BALL">Next Ball</option>
              </select>
            </div>

            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Will the batsman score a six?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Option
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Poll'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
