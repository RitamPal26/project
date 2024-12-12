// Helper functions to generate code verifier and code challenge
const generateCodeVerifier = () => {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(36)).join("");
};

const generateCodeChallenge = (codeVerifier: string) => {
  return new Promise<string>((resolve, reject) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    window.crypto.subtle
      .digest("SHA-256", data)
      .then((hash) => {
        const base64Url = btoa(
          String.fromCharCode.apply(null, new Uint8Array(hash))
        )
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        resolve(base64Url);
      })
      .catch(reject);
  });
};

// Constants
const CLIENT_ID = "7fc6ec5e058a46ecb4780157fce1520d";
const REDIRECT_URI = "https://testrunmad.netlify.app/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code"; // Changed to 'code' for PKCE flow
const SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
].join(" ");

// Generate code verifier and code challenge, then construct login URL
export const handleLogin = (): void => {
  const codeVerifier = generateCodeVerifier();
  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    // Store the code verifier for the token exchange later
    localStorage.setItem("code_verifier", codeVerifier);

    const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
      SCOPES
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256&show_dialog=true`;

    console.log("Redirecting to Spotify login...");
    // Redirect user to Spotify login
    window.location.href = loginUrl;
  });
};

// Fetch access token from the URL after redirect
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

// Exchange the authorization code for an access token
export const exchangeCodeForToken = (authorizationCode: string) => {
  const codeVerifier = localStorage.getItem("code_verifier");
  if (!codeVerifier) {
    console.error("Code verifier is missing");
    return;
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("spotify_access_token", data.access_token);
    })
    .catch((error) => console.error("Error exchanging code for token:", error));
};

// Fetch top items (artists or tracks) from Spotify API
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

// Fetch recently played tracks from Spotify API
export const fetchRecentlyPlayed = async (
  token: string
): Promise<{ items: PlayHistory[] }> => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played",
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

// Logout function
export const logout = (): void => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiration");

    // Redirect to a URL with a logout query parameter
    window.location.href = "/?logout=true";
  }
};
