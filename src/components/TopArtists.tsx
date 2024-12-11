import React from 'react';
import { Music2 } from 'lucide-react';
import type { SpotifyArtist } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface Props {
  artists: SpotifyArtist[];
  isLoading: boolean;
  error?: unknown;
  fullView?: boolean;
}

export default function TopArtists({ artists, isLoading, error, fullView }: Props) {
  if (error) {
    return <ErrorMessage message="Failed to load top artists" />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <Music2 className="w-6 h-6 text-green-500" />
        Top Artists
      </h2>
      <div className={`grid grid-cols-1 ${fullView ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-700/50 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="relative">
              <img
                src={artist.images[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4'}
                alt={artist.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-green-400 transition-colors">{artist.name}</h3>
              <div className="flex flex-wrap gap-2">
                {artist.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300 group-hover:bg-green-400"
                    style={{ width: `${artist.popularity}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{artist.popularity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}