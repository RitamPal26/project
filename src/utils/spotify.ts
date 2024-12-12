const CLIENT_ID = "7fc6ec5e058a46ecb4780157fce1520d";
const REDIRECT_URI = "https://testrunmad.netlify.app/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"; // Corrected Auth Endpoint
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
].join(" ");

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
  SCOPES
)}&show_dialog=true`;

export const handleLogin = (): void => {
  // Clear previous session's token
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiration");

  console.log("Redirecting to Spotify login...");
  // Redirect
  window.location.href = loginUrl;
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;

  if (hash) {
    const token = hash
      .substring(1)
      .split("&")
      .find((elem) => elem.startsWith("access_token"))
      ?.split("=")[1];

    if (token) {
      const expiration = hash
        .split("&")
        .find((elem) => elem.startsWith("expires_in"))
        ?.split("=")[1];

      if (expiration) {
        const expirationTime =
          Math.floor(Date.now() / 1000) + parseInt(expiration, 10);
        localStorage.setItem(
          "spotify_token_expiration",
          expirationTime.toString()
        );
      }

      localStorage.setItem("spotify_access_token", token);
      window.location.hash = ""; // Clear the hash from the URL
      return token;
    }
  }

  return localStorage.getItem("spotify_access_token");
};

export const fetchTopItems = async <T>(
  type: "artists" | "tracks",
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  token: string
): Promise<{ items: T[]; total: number; limit: number; offset: number }> => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=50`, // Corrected API endpoint
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("spotify_access_token");
        handleLogin(); // Redirect to login if token is invalid
      }
      throw new Error(`Failed to fetch top ${type}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching top ${type}:`, error);
    throw error;
  }
};

export const fetchRecentlyPlayed = async (
  token: string
): Promise<{ items: PlayHistory[] }> => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played", // Corrected API endpoint
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch recently played: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching recently played:", error);
    throw error;
  }
};

export const logout = (): void => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiration");

    // Redirect to a URL with a logout query parameter
    window.location.href = "/?logout=true";
  }
};

