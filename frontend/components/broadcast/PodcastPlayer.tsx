'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface PodcastChapter {
  title: string;
  startTime: number;
  description?: string;
}

interface MatchPodcast {
  id: string;
  matchId: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number;
  chapters?: PodcastChapter[];
  status: 'PENDING' | 'GENERATING' | 'READY' | 'PUBLISHED' | 'FAILED';
  isTTS: boolean;
  voice?: string;
  language?: string;
  publishedAt?: string;
  createdAt: string;
}

interface PodcastPlayerProps {
  podcast: MatchPodcast;
  showChapters?: boolean;
  showDownload?: boolean;
  autoPlay?: boolean;
}

export default function PodcastPlayer({
  podcast,
  showChapters = true,
  showDownload = true,
  autoPlay = false,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const chapters = podcast.chapters || [];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Update current chapter based on time
      if (chapters.length > 0) {
        const chapterIndex = chapters.findIndex((chapter, index) => {
          const nextChapter = chapters[index + 1];
          return (
            audio.currentTime >= chapter.startTime &&
            (!nextChapter || audio.currentTime < nextChapter.startTime)
          );
        });
        if (chapterIndex !== -1) setCurrentChapter(chapterIndex);
      }
    };

    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [chapters]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const jumpToChapter = (chapterIndex: number) => {
    if (!chapters[chapterIndex]) return;
    handleSeek(chapters[chapterIndex].startTime);
  };

  const changePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    audio.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const downloadPodcast = () => {
    const link = document.createElement('a');
    link.href = podcast.audioUrl;
    link.download = `${podcast.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  const getStatusBadge = () => {
    const statusColors = {
      PENDING: 'bg-gray-400',
      GENERATING: 'bg-blue-500 animate-pulse',
      READY: 'bg-green-500',
      PUBLISHED: 'bg-purple-500',
      FAILED: 'bg-red-500',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${statusColors[podcast.status]}`}>
        {podcast.status}
      </span>
    );
  };

  if (podcast.status === 'PENDING' || podcast.status === 'GENERATING') {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{podcast.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {podcast.status === 'PENDING' && 'Podcast generation pending...'}
              {podcast.status === 'GENERATING' && 'Generating podcast with AI...'}
            </p>
            {getStatusBadge()}
          </div>
        </div>
      </div>
    );
  }

  if (podcast.status === 'FAILED') {
    return (
      <div className="bg-red-50 rounded-lg p-8 shadow-sm border border-red-200">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-red-900">{podcast.title}</h3>
          <p className="text-sm text-red-600">Failed to generate podcast</p>
          {getStatusBadge()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Podcast Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>
            {podcast.description && (
              <p className="text-purple-100 text-sm">{podcast.description}</p>
            )}
            <div className="flex items-center space-x-3 mt-3">
              {getStatusBadge()}
              {podcast.isTTS && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  🤖 AI Generated
                </span>
              )}
              <span className="text-xs text-purple-100">
                {formatTime(duration)} duration
              </span>
            </div>
          </div>

          {showDownload && (
            <Button
              onClick={downloadPodcast}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              ⬇ Download
            </Button>
          )}
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-6">
        <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              handleSeek(duration * percentage);
            }}
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="rounded-full w-12 h-12"
            >
              {isPlaying ? '⏸' : '▶'}
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
              >
                {isMuted ? '🔇' : '🔊'}
              </Button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <Button
            onClick={changePlaybackRate}
            variant="outline"
            size="sm"
          >
            {playbackRate}x
          </Button>
        </div>

        {/* Current Chapter */}
        {showChapters && chapters.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Now Playing</div>
            <div className="font-medium text-gray-900">
              {chapters[currentChapter]?.title || 'Introduction'}
            </div>
            {chapters[currentChapter]?.description && (
              <div className="text-sm text-gray-600 mt-1">
                {chapters[currentChapter].description}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapters List */}
      {showChapters && chapters.length > 0 && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Chapters</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  currentChapter === index
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => jumpToChapter(index)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{chapter.title}</div>
                  {chapter.description && (
                    <div className="text-xs text-gray-600 mt-1">{chapter.description}</div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-gray-600">
                    {formatTime(chapter.startTime)}
                  </span>
                  {currentChapter === index && isPlaying && (
                    <span className="text-blue-600">▶</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            {podcast.publishedAt && (
              <span>Published: {new Date(podcast.publishedAt).toLocaleDateString()}</span>
            )}
          </div>
          {podcast.voice && podcast.language && (
            <div>Voice: {podcast.voice} • Language: {podcast.language}</div>
          )}
        </div>
      </div>
    </div>
  );
}
