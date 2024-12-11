import React from 'react';
import { PieChart } from 'lucide-react';
import type { SpotifyArtist } from '../types/spotify';

interface Props {
  artists: SpotifyArtist[];
  fullView?: boolean;
}

export default function GenreDistribution({ artists, fullView }: Props) {
  const genreCounts = artists.reduce((acc, artist) => {
    artist.genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, fullView ? 20 : 10);

  const maxCount = Math.max(...sortedGenres.map(([, count]) => count));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <PieChart className="w-6 h-6" />
        Top Genres
      </h2>
      <div className="space-y-4">
        {sortedGenres.map(([genre, count]) => (
          <div key={genre} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-white">{genre}</span>
              <span className="text-gray-400">{count} artists</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}