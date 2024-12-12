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
)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
  SCOPES
)}&show_dialog=true`;

export const handleLogin = () => {
  // Clear existing tokens for new users
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiration");

  // Redirect to Spotify login
  window.location.href = loginUrl;
};

export const getAccessToken = () => {
  if (typeof window === "undefined") {
    console.error("Window object is undefined. Cannot retrieve token.");
    return null;
  }

  const hash = window.location.hash;

  console.log("URL hash fragment:", hash);

  if (hash) {
    const token = hash
      .substring(1)
      .split("&")
      .find((elem) => elem.startsWith("access_token"))
      ?.split("=")[1];

    const expiresIn = hash
      .substring(1)
      .split("&")
      .find((elem) => elem.startsWith("expires_in"))
      ?.split("=")[1];

    if (token && expiresIn) {
      const expirationTime = Date.now() + parseInt(expiresIn) * 1000;

      console.log("Extracted token:", token);
      console.log("Token expires in (ms):", expiresIn);

      // Store token and expiration time
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem(
        "spotify_token_expiration",
        expirationTime.toString()
      );

      window.location.hash = ""; // Clear the URL fragment
      return token;
    } else {
      console.error("Token or expiration time not found in hash.");
    }
  }

  // Check stored token validity
  const storedToken = localStorage.getItem("spotify_access_token");
  const storedExpiration = localStorage.getItem("spotify_token_expiration");

  console.log("Stored token:", storedToken);
  console.log("Stored expiration:", storedExpiration);

  if (storedToken && storedExpiration) {
    const currentTime = Date.now();
    console.log("Current time (ms):", currentTime);
    if (currentTime < parseInt(storedExpiration)) {
      console.log("Stored token is valid.");
      return storedToken;
    } else {
      console.log(
        "Token expired, clearing localStorage and redirecting to login."
      );
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_token_expiration");
      handleLogin();
    }
  } else {
    console.log("No valid token found, redirecting to login.");
    handleLogin();
  }

  return null;
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
