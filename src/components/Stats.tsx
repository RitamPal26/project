import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { SpotifyArtist, SpotifyTrack } from '../types/spotify';

interface Props {
  artists: SpotifyArtist[];
  tracks: SpotifyTrack[];
  fullView?: boolean;
}

export default function Stats({ artists, tracks, fullView }: Props) {
  const avgPopularity = Math.round(
    artists.reduce((sum, artist) => sum + artist.popularity, 0) / artists.length
  );

  const uniqueGenres = new Set(artists.flatMap(artist => artist.genres)).size;
  
  const artistsWithMultipleTracks = tracks.reduce((acc, track) => {
    track.artists.forEach(artist => {
      acc[artist.name] = (acc[artist.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCollaborators = Object.entries(artistsWithMultipleTracks)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, fullView ? 10 : 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <BarChart3 className="w-6 h-6" />
        Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Average Artist Popularity</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-500">{avgPopularity}</span>
            </div>
            <div className="text-gray-400">
              out of 100
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Unique Genres</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-500">{uniqueGenres}</span>
            </div>
            <div className="text-gray-400">
              different genres
            </div>
          </div>
        </div>
      </div>
      {topCollaborators.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Top Collaborators</h3>
          <div className="space-y-3">
            {topCollaborators.map(([artist, count]) => (
              <div key={artist} className="flex justify-between items-center">
                <span className="text-white">{artist}</span>
                <span className="text-gray-400">{count} tracks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}