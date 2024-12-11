export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; height: number; width: number }[];
  popularity: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    images: { url: string; height: number; width: number }[];
    release_date: string;
  };
  preview_url: string | null;
  duration_ms: number;
}

export interface TopItemsResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlayHistory {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    href: string;
  } | null;
}