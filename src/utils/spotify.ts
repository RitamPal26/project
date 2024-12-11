const CLIENT_ID = "7fc6ec5e058a46ecb4780157fce1520d";
const REDIRECT_URI = "http://localhost:5173";
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

const TOKEN_EXPIRATION_TIME = 3600 * 1000; 

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  if (!hash) {
    const storedToken = localStorage.getItem("spotify_access_token");
    const storedExpiration = localStorage.getItem("spotify_token_expiration");

    if (storedToken && storedExpiration) {
      const expirationTime = parseInt(storedExpiration, 10);
      const currentTime = Date.now();
      
      if (currentTime < expirationTime) {
        return storedToken; 
      } else {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiration");
        return null; // Token expired
      }
    }
    return null; 
  }

  try {
    const token = hash
      .substring(1) 
      .split("&") 
      .find((elem) => elem.startsWith("access_token")) 
      ?.split("=")[1]; 

    if (token) {
      // Store the token and its expiration time in localStorage
      const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem("spotify_token_expiration", expirationTime.toString());
      window.location.hash = ""; 
      return token;
    } else {
      throw new Error("Access token not found in URL");
    }
  } catch (error) {
    console.error("Error extracting access token:", error);
    return null; 
  }
};


export const fetchTopItems = async <T>(
  type: "artists" | "tracks",
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  token: string
): Promise<{ items: T[]; total: number; limit: number; offset: number }> => {
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
      if (response.status === 401) {
        console.error("Token expired or invalid. Redirecting to login...");
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/login";
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
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
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
