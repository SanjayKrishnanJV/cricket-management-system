'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface LiveStreamData {
  id: string;
  matchId: string;
  streamUrl: string;
  streamProvider: string;
  status: 'OFFLINE' | 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'ENDED' | 'ERROR';
  hlsUrl?: string;
  dashUrl?: string;
  currentViewers: number;
  peakViewers: number;
  startedAt?: string;
}

interface ScoreData {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  currentInnings: number;
  battingTeam: string;
  overs: string;
  target?: number;
  required?: string;
}

interface LiveStreamPlayerProps {
  stream: LiveStreamData;
  scoreData?: ScoreData;
  showScoreOverlay?: boolean;
  showViewerCount?: boolean;
  enablePiP?: boolean;
}

export default function LiveStreamPlayer({
  stream,
  scoreData,
  showScoreOverlay = true,
  showViewerCount = true,
  enablePiP = true,
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video || !enablePiP) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  const getStreamSrc = () => {
    // Prefer HLS for modern browsers
    if (stream.hlsUrl) return stream.hlsUrl;
    if (stream.dashUrl) return stream.dashUrl;
    return stream.streamUrl;
  };

  const getStatusBadge = () => {
    const statusColors = {
      OFFLINE: 'bg-gray-500',
      SCHEDULED: 'bg-blue-500',
      LIVE: 'bg-red-500 animate-pulse',
      PAUSED: 'bg-yellow-500',
      ENDED: 'bg-gray-700',
      ERROR: 'bg-red-700',
    };

    return (
      <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${statusColors[stream.status]}`}>
        {stream.status === 'LIVE' && '🔴 '}
        {stream.status}
      </div>
    );
  };

  const formatViewerCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Stream Player */}
      <div
        className="relative bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: '16/9' }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {stream.status === 'LIVE' || stream.status === 'PAUSED' ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full"
              src={getStreamSrc()}
              autoPlay
              muted={isMuted}
            >
              Your browser does not support the video tag.
            </video>

            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10">
              {getStatusBadge()}
            </div>

            {/* Viewer Count */}
            {showViewerCount && (
              <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-60 px-3 py-1 rounded-full text-white text-xs font-medium">
                👁 {formatViewerCount(stream.currentViewers)} watching
              </div>
            )}

            {/* Score Overlay */}
            {showScoreOverlay && scoreData && (
              <div className="absolute bottom-16 left-4 right-4 z-10 bg-gradient-to-r from-blue-900/90 to-blue-800/90 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{scoreData.team1}</div>
                    <div className="text-2xl font-bold">{scoreData.score1}</div>
                  </div>

                  <div className="px-4 text-center">
                    <div className="text-xs text-gray-300">OVERS</div>
                    <div className="text-lg font-semibold">{scoreData.overs}</div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-sm font-semibold">{scoreData.team2}</div>
                    <div className="text-2xl font-bold">{scoreData.score2}</div>
                  </div>
                </div>

                {scoreData.target && scoreData.required && (
                  <div className="mt-2 text-center text-xs text-gray-200">
                    Need {scoreData.required} to win
                  </div>
                )}
              </div>
            )}

            {/* Controls Overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={togglePlayPause}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </Button>

                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {enablePiP && (
                      <Button
                        onClick={togglePiP}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        title="Picture-in-Picture"
                      >
                        📺
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        const video = videoRef.current;
                        if (video) video.requestFullscreen();
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      title="Fullscreen"
                    >
                      ⛶
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Stream Offline/Ended State
          <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center space-y-4">
              {getStatusBadge()}

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {stream.status === 'OFFLINE' && 'Stream Offline'}
                  {stream.status === 'SCHEDULED' && 'Stream Scheduled'}
                  {stream.status === 'ENDED' && 'Stream Ended'}
                  {stream.status === 'ERROR' && 'Stream Error'}
                </h3>
                <p className="text-sm text-gray-400">
                  {stream.status === 'OFFLINE' && 'The live stream has not started yet.'}
                  {stream.status === 'SCHEDULED' && 'The live stream will begin shortly.'}
                  {stream.status === 'ENDED' && 'This live stream has ended. Check highlights below.'}
                  {stream.status === 'ERROR' && 'There was an error loading the stream.'}
                </p>

                {stream.peakViewers > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Peak viewers: {formatViewerCount(stream.peakViewers)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Stream Provider</div>
            <div className="font-medium">{stream.streamProvider}</div>
          </div>

          {stream.startedAt && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Started At</div>
              <div className="font-medium">
                {new Date(stream.startedAt).toLocaleTimeString()}
              </div>
            </div>
          )}

          {stream.status === 'LIVE' && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Current Viewers</div>
              <div className="font-medium text-blue-600">
                {formatViewerCount(stream.currentViewers)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
