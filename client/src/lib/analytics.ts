/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * Behavior:
 * - No-op when VITE_GA_MEASUREMENT_ID is not set (clean local dev).
 * - Loads gtag.js script lazily on first init.
 * - Tracks SPA route changes via trackPageView() — we disable
 *   gtag's automatic page_view in config and fire it ourselves
 *   so single-page-app navigations get counted correctly.
 * - Skips /admin/** routes — we don't want our own admin browsing
 *   polluting the analytics data.
 *
 * Env var: VITE_GA_MEASUREMENT_ID = "G-XXXXXXXXXX"
 *   - Vite exposes any env var prefixed with VITE_ to client code.
 *   - Set in Render dashboard for production.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Inject gtag.js script + boot dataLayer. Call once at app boot. */
export function initAnalytics(): void {
  if (initialized) return;
  if (!GA_ID) return;
  if (typeof window === "undefined") return;

  // 1. Inject the gtag.js loader script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // 2. Boot the dataLayer + gtag stub before the script loads
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());

  // 3. Initial config — disable automatic page_view; we fire it
  //    manually on every route change so SPA navigations are counted.
  window.gtag("config", GA_ID, { send_page_view: false });

  initialized = true;
}

/** Fire a page_view event for the given SPA path. */
export function trackPageView(path: string): void {
  if (!GA_ID) return;
  if (typeof window === "undefined" || !window.gtag) return;
  // Don't track our own admin browsing
  if (path.startsWith("/admin")) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
