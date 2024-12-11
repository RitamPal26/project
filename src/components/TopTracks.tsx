import React from 'react';
import { Music, Play, Pause } from 'lucide-react';
import type { SpotifyTrack } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface Props {
  tracks: SpotifyTrack[];
  isLoading: boolean;
  error?: unknown;
  fullView?: boolean;
}

export default function TopTracks({ tracks, isLoading, error, fullView }: Props) {
  const [playing, setPlaying] = React.useState<string | null>(null);

  if (error) {
    return <ErrorMessage message="Failed to load top tracks" />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <Music className="w-6 h-6 text-green-500" />
        Top Tracks
      </h2>
      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="relative">
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-16 h-16 rounded-md"
              />
              {track.preview_url && (
                <button
                  onClick={() => {
                    const audio = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
                    if (playing === track.id) {
                      audio.pause();
                      setPlaying(null);
                    } else {
                      if (playing) {
                        const prevAudio = document.getElementById(`audio-${playing}`) as HTMLAudioElement;
                        prevAudio.pause();
                      }
                      audio.play();
                      setPlaying(track.id);
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {playing === track.id ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white" />
                  )}
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                {track.name}
              </h3>
              <p className="text-gray-400 truncate">
                {track.artists.map(a => a.name).join(", ")}
              </p>
            </div>
            {track.preview_url && (
              <audio
                id={`audio-${track.id}`}
                src={track.preview_url}
                onEnded={() => setPlaying(null)}
                className="hidden"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}