'use client';

import { useState } from 'react';
import { highlightAPI } from '@/lib/api';

interface CreateHighlightProps {
  matchId: string;
  ballId?: string;
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateHighlight({
  matchId,
  ballId,
  userId = 'guest',
  onSuccess,
  onCancel,
}: CreateHighlightProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('boundary');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'boundary', label: '🏏 Boundary', icon: '4/6' },
    { value: 'wicket', label: '🎯 Wicket', icon: 'W' },
    { value: 'catch', label: '🙌 Catch', icon: 'C' },
    { value: 'milestone', label: '⭐ Milestone', icon: '50/100' },
    { value: 'other', label: '📌 Other', icon: '...' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await highlightAPI.create(matchId, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        ballId,
        tags: tagArray.length > 0 ? tagArray : undefined,
        userId,
      });

      setTitle('');
      setDescription('');
      setCategory('boundary');
      setTags('');

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating highlight:', error);
      alert(error.response?.data?.message || 'Failed to create highlight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>✨</span>
          <span>Create Highlight</span>
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 'Amazing Six by Rohit!'"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  category === cat.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-sm font-semibold">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about this moment..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., six, rohit, powerplay (comma separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Ball Info */}
        {ballId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📍 This highlight will be linked to a specific ball/delivery
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
          >
            {loading ? 'Creating...' : 'Create Highlight'}
          </button>
        </div>
      </form>
    </div>
  );
}
