const loginUrl = "https://accounts.spotify.com/authorize?...&show_dialog=true"; // Replace with your login URL and ensure show_dialog=true for forced login

export const getAccessToken = (): string | null => {
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
        // Token expired
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiration");
      }
    }

    // Redirect to login if no valid token
    window.location.href = loginUrl;
    return null;
  }

  const urlParams = new URLSearchParams(hash.substring(1));
  const token = urlParams.get("access_token");
  const expiresIn = urlParams.get("expires_in");

  if (token && expiresIn) {
    const expirationTime = Date.now() + parseInt(expiresIn, 10) * 1000;

    // Save token and expiration time in localStorage
    localStorage.setItem("spotify_access_token", token);
    localStorage.setItem("spotify_token_expiration", expirationTime.toString());

    // Clear URL fragment to clean up
    window.location.hash = "";
    return token;
  }

  return null;
};

export const handleLogout = (): void => {
  // Clear all stored tokens and expiration data
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiration");
  sessionStorage.removeItem("spotify_access_token"); // Optional cleanup

  // Redirect to Spotify's logout URL or a custom page
  window.location.href = "https://www.spotify.com/logout/";

  // Optional: Redirect back to your app's login flow after logging out of Spotify
  setTimeout(() => {
    window.location.href = "https://testrunmad.netlify.app/"; // Replace with your app's login route
  }, 1000); // Delay to ensure Spotify logout takes effect
};
