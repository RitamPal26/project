import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {
  LogIn,
  LayoutDashboard,
  Mic2,
  Music2,
  PieChart,
  BarChart3,
  Clock,
} from "lucide-react";
import TopArtists from "./components/TopArtists";
import TopTracks from "./components/TopTracks";
import GenreDistribution from "./components/GenreDistribution";
import Stats from "./components/Stats";
import ListeningHabits from "./components/ListeningHabits";
import {
  loginUrl,
  getAccessToken,
  fetchTopItems,
  fetchRecentlyPlayed,
  logout,
} from "./utils/spotify";
import type { SpotifyArtist, SpotifyTrack, PlayHistory } from "./types/spotify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
}) {
  const handleLogout = () => {
    logout(); // Call the logout function
  };

  return (
    <div className="w-64 h-screen bg-gray-900 fixed left-0 top-0 p-4 flex flex-col justify-between">
      {/* Top Section: Logo and Navigation */}
      <div>
        <div className="flex items-center gap-3 px-4 mb-8">
          <Music2 className="w-8 h-8 text-green-500" />
          <h1 className="text-xl font-bold text-white">Spotify Analytics</h1>
        </div>
        <nav className="space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "artists", label: "Top Artists", icon: Mic2 },
            { id: "tracks", label: "Top Tracks", icon: Music2 },
            { id: "genres", label: "Genres", icon: PieChart },
            { id: "stats", label: "Statistics", icon: BarChart3 },
            { id: "habits", label: "Listening Habits", icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-3 px-4 py-2 w-full rounded-md text-left text-white hover:bg-gray-800 ${
                activeView === id ? "bg-gray-800" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="px-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition"
        >
          <LogIn className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("medium_term");
  const token = getAccessToken();

  const {
    data: artistsData,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery(
    ["topArtists", timeRange],
    () => fetchTopItems<SpotifyArtist>("artists", timeRange, token!),
    { enabled: !!token }
  );

  const {
    data: tracksData,
    isLoading: tracksLoading,
    error: tracksError,
  } = useQuery(
    ["topTracks", timeRange],
    () => fetchTopItems<SpotifyTrack>("tracks", timeRange, token!),
    { enabled: !!token }
  );

  const { data: recentlyPlayed, isLoading: recentlyPlayedLoading } = useQuery(
    "recentlyPlayed",
    () => fetchRecentlyPlayed(token!),
    { enabled: !!token }
  );

  useEffect(() => {
    if (artistsError || tracksError) {
      localStorage.removeItem("spotify_access_token");
      window.location.href = "/";
    }
  }, [artistsError, tracksError]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Spotify Analytics
          </h1>
          <a
            href={loginUrl}
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Login with Spotify
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2"
          >
            <option value="short_term">Last 4 Weeks</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="long_term">All Time</option>
          </select>
        </div>

        {activeView === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopArtists
              artists={artistsData?.items.slice(0, 6) || []}
              isLoading={artistsLoading}
            />
            <TopTracks
              tracks={tracksData?.items.slice(0, 6) || []}
              isLoading={tracksLoading}
            />
            {artistsData?.items && (
              <GenreDistribution artists={artistsData.items} />
            )}
            {recentlyPlayed?.items && (
              <ListeningHabits recentTracks={recentlyPlayed.items} />
            )}
          </div>
        )}

        {activeView === "artists" && (
          <TopArtists
            artists={artistsData?.items || []}
            isLoading={artistsLoading}
            fullView
          />
        )}

        {activeView === "tracks" && (
          <TopTracks
            tracks={tracksData?.items || []}
            isLoading={tracksLoading}
            fullView
          />
        )}

        {activeView === "genres" && artistsData?.items && (
          <GenreDistribution artists={artistsData.items} fullView />
        )}

        {activeView === "stats" && artistsData?.items && tracksData?.items && (
          <Stats
            artists={artistsData.items}
            tracks={tracksData.items}
            fullView
          />
        )}

        {activeView === "habits" && recentlyPlayed?.items && (
          <ListeningHabits recentTracks={recentlyPlayed.items} fullView />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
