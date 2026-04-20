export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL — kicks off the server-side Google OAuth flow.
// The server redirects the browser to Google's consent screen,
// then back to /api/oauth/callback to set the session cookie.
export const getLoginUrl = () => "/api/oauth/google";
