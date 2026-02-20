'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface VideoHighlight {
  id: string;
  title: string;
  category: string;
  startTimestamp: number;
  ballTimestamp?: number;
  videoUrl: string;
  thumbnailUrl?: string;
  ballId?: string;
}

interface VideoPlayerProps {
  matchId: string;
  videoUrl: string;
  videoProvider: string;
  highlights?: VideoHighlight[];
  autoPlay?: boolean;
  showTimeline?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  BOUNDARY: 'bg-green-500',
  SIX: 'bg-blue-500',
  WICKET: 'bg-red-500',
  MILESTONE: 'bg-yellow-500',
  FIFTY: 'bg-purple-500',
  HUNDRED: 'bg-orange-500',
  OTHER: 'bg-gray-400',
};

export default function VideoPlayer({
  matchId,
  videoUrl,
  videoProvider,
  highlights = [],
  autoPlay = false,
  showTimeline = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const jumpToTimestamp = (timestamp: number, highlightId: string) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = timestamp;
    setSelectedHighlight(highlightId);
    if (!isPlaying) {
      video.play();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoSrc = () => {
    switch (videoProvider) {
      case 'YOUTUBE':
        // For YouTube, we'd use an iframe, but for simplicity using video tag
        return videoUrl;
      case 'VIMEO':
        return videoUrl;
      case 'S3':
      case 'CLOUDFRONT':
      default:
        return videoUrl;
    }
  };

  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          className="w-full h-full"
          src={getVideoSrc()}
          autoPlay={autoPlay}
          controls
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <Button
          onClick={togglePlayPause}
          variant="outline"
          size="sm"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </Button>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Highlights Timeline */}
      {showTimeline && highlights.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Match Highlights</h3>

          {/* Timeline Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full mb-6">
            {highlights.map((highlight) => {
              const position = duration > 0 ? (highlight.startTimestamp / duration) * 100 : 0;
              return (
                <div
                  key={highlight.id}
                  className={`absolute h-full w-1 ${getCategoryColor(highlight.category)} cursor-pointer hover:w-2 transition-all`}
                  style={{ left: `${position}%` }}
                  title={highlight.title}
                  onClick={() => jumpToTimestamp(highlight.startTimestamp, highlight.id)}
                />
              );
            })}

            {/* Current Time Indicator */}
            <div
              className="absolute h-full w-1 bg-blue-600 transition-all"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Highlight List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {highlights
              .sort((a, b) => a.startTimestamp - b.startTimestamp)
              .map((highlight) => (
                <div
                  key={highlight.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    selectedHighlight === highlight.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => jumpToTimestamp(highlight.startTimestamp, highlight.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(highlight.category)}`} />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{highlight.title}</div>
                      <div className="text-xs text-gray-500">{highlight.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {formatTime(highlight.startTimestamp)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToTimestamp(highlight.startTimestamp, highlight.id);
                      }}
                    >
                      ▶
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Category Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <div key={category} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs text-gray-600">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Highlights Message */}
      {showTimeline && highlights.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-500">No highlights available for this match yet.</p>
        </div>
      )}
    </div>
  );
}
