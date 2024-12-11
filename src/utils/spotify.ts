const CLIENT_ID = "7fc6ec5e058a46ecb4780157fce1520d";
const REDIRECT_URI = "https://testrunmad.netlify.app/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
].join(" ");

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;

const TOKEN_EXPIRATION_TIME = 3600 * 1000; // 1 hour

// Validate the token before making any API calls
export const validateToken = () => {
  const token = localStorage.getItem("spotify_access_token");
  const expiration = localStorage.getItem("spotify_token_expiration");

  if (token && expiration && Date.now() < parseInt(expiration, 10)) {
    return token; // Token is valid
  }

  // Token is invalid or expired; clear storage and redirect
  handleLogout();
  return null;
};

// Function to get the access token from the URL or local storage
export const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  if (!hash) {
    const storedToken = validateToken();
    return storedToken; // Return valid token if exists
  }

  try {
    const token = hash
      .substring(1) // Remove the '#' at the start
      .split("&") // Split key-value pairs
      .find((elem) => elem.startsWith("access_token")) // Find the access_token
      ?.split("=")[1]; // Get the token value

    if (token) {
      const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem(
        "spotify_token_expiration",
        expirationTime.toString()
      );
      window.location.hash = ""; // Clear the hash from the URL
      return token;
    } else {
      throw new Error("Access token not found in URL");
    }
  } catch (error) {
    console.error("Error extracting access token:", error);
    return null; // Return null on failure
  }
};

// Handle logout and redirect to Spotify login page
export const handleLogout = () => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiration");
  window.location.href = loginUrl; // Redirect to Spotify login page
};

// Fetch user's top items (artists or tracks)
export const fetchTopItems = async <T>(
  type: "artists" | "tracks",
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<{ items: T[]; total: number; limit: number; offset: number }> => {
  const token = validateToken();
  if (!token) throw new Error("No valid token found");

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top ${type}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching top ${type}:`, error);
    throw error;
  }
};

// Fetch user's recently played tracks
export const fetchRecentlyPlayed = async (
  token: string
): Promise<{ items: PlayHistory[] }> => {
  const validToken = validateToken();
  if (!validToken) throw new Error("No valid token found");

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      {
        headers: {
          Authorization: `Bearer ${validToken}`,
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
