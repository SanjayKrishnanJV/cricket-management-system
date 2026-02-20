'use client';

import { useEffect, useState } from 'react';
import { highlightAPI } from '@/lib/api';
import { CreateHighlight } from './CreateHighlight';

interface HighlightGalleryProps {
  matchId: string;
  userId?: string;
  showCreateButton?: boolean;
}

interface Highlight {
  id: string;
  title: string;
  description: string;
  category: string;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  tags: Array<{
    tag: string;
  }>;
  ball?: {
    batsman: { name: string };
    bowler: { name: string };
    runs: number;
    isWicket: boolean;
  };
}

export function HighlightGallery({
  matchId,
  userId = 'guest',
  showCreateButton = true,
}: HighlightGalleryProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  useEffect(() => {
    fetchHighlights();
  }, [matchId, selectedCategory]);

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const response = await highlightAPI.getByMatch(matchId, selectedCategory);
      if (response.data.success) {
        setHighlights(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (highlightId: string) => {
    try {
      await highlightAPI.share(highlightId);
      fetchHighlights();
    } catch (error) {
      console.error('Error sharing highlight:', error);
    }
  };

  const handleDelete = async (highlightId: string) => {
    if (!confirm('Delete this highlight?')) return;

    try {
      await highlightAPI.delete(highlightId, userId);
      fetchHighlights();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete highlight');
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      boundary: '🏏',
      wicket: '🎯',
      catch: '🙌',
      milestone: '⭐',
      other: '📌',
    };
    return emojiMap[category] || '📌';
  };

  const categories = [
    { value: undefined, label: 'All' },
    { value: 'boundary', label: 'Boundaries' },
    { value: 'wicket', label: 'Wickets' },
    { value: 'catch', label: 'Catches' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'other', label: 'Other' },
  ];

  if (showCreate) {
    return (
      <CreateHighlight
        matchId={matchId}
        userId={userId}
        onSuccess={() => {
          setShowCreate(false);
          fetchHighlights();
        }}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>✨</span>
              <span>Highlights</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">{highlights.length} highlights</p>
          </div>
          {showCreateButton && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Create
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-500 mb-4">No highlights yet</p>
            {showCreateButton && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Highlight
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Highlight Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{getCategoryEmoji(highlight.category)}</span>
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {highlight.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mt-2 line-clamp-2">{highlight.title}</h3>
                </div>

                {/* Highlight Content */}
                <div className="p-4">
                  {highlight.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {highlight.description}
                    </p>
                  )}

                  {/* Ball Info */}
                  {highlight.ball && (
                    <div className="bg-white border border-gray-200 rounded p-2 mb-3 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">{highlight.ball.batsman.name}</span>
                        {' vs '}
                        <span className="font-semibold">{highlight.ball.bowler.name}</span>
                      </p>
                      <p className="text-gray-600">
                        {highlight.ball.isWicket
                          ? '🎯 Wicket!'
                          : `${highlight.ball.runs} run${highlight.ball.runs !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {highlight.tags && highlight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {highlight.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          #{tag.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span>👁️</span>
                        <span>{highlight.viewCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📤</span>
                        <span>{highlight.shareCount}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(highlight.id)}
                        className="hover:text-blue-600"
                        title="Share"
                      >
                        📤
                      </button>
                      {highlight.user.id === userId && (
                        <button
                          onClick={() => handleDelete(highlight.id)}
                          className="hover:text-red-600"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Author */}
                  <p className="text-xs text-gray-500 mt-2">
                    By {highlight.user.name} • {new Date(highlight.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
