
const loginUrl = "https://accounts.spotify.com/authorize?..."; // Replace with your login URL

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
        return storedToken; // Return valid token
      } else {
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiration");
      }
    }

    window.location.href = loginUrl; // Redirect if no valid token
    return null;
  }

  const urlParams = new URLSearchParams(hash.substring(1));
  const token = urlParams.get("access_token");
  const expiresIn = urlParams.get("expires_in");

  if (token && expiresIn) {
    const expirationTime = Date.now() + parseInt(expiresIn, 10) * 1000;

    localStorage.setItem("spotify_access_token", token);
    localStorage.setItem("spotify_token_expiration", expirationTime.toString());

    window.location.hash = ""; // Clear URL fragment
    return token;
  }

  return null;
};

export const handleLogout = () => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiration");
  sessionStorage.removeItem("spotify_access_token"); // Optional if using sessionStorage
  window.location.href = loginUrl; // Redirect to Spotify login page or custom logout page
};