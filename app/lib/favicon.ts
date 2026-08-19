/**
 * favicon.ts
 * Robust, parallel, cached favicon fetching for app cards.
 *
 * Resolution strategy:
 *  A) Static probe  — Only Google S2, which ALWAYS returns HTTP 200 (globe for unknowns).
 *     No other CDN source is used here because Clearbit, faviconV2, DuckDuckGo, and
 *     direct /favicon.ico all return 404 for unknown domains, flooding the browser console.
 *  B) Server-side proxy  (/api/favicon?domain=…)
 *     Fetches the page HTML + probes additional sources (Clearbit, DuckDuckGo, direct
 *     paths) server-side where 404 errors are invisible to the browser console.
 *     Returns validated icon URLs that are added to the race pool as they arrive.
 *
 * The fastest valid image wins. Results are session-cached per hostname.
 */

// ─── Session cache ────────────────────────────────────────────────────────────

const MISS = '__MISS__';
/** hostname → winning favicon URL  (MISS sentinel = confirmed not found) */
const cache = new Map<string, string>();

export function clearFaviconCache(): void {
  cache.clear();
}

// ─── URL utilities ────────────────────────────────────────────────────────────

export function extractHostname(urlOrDomain: string): string | null {
  try {
    const raw = urlOrDomain.trim();
    if (!raw) return null;
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const { hostname } = new URL(normalized);
    return hostname || null;
  } catch {
    return null;
  }
}

// ─── Static source list ───────────────────────────────────────────────────────

/**
 * Returns browser-side favicon sources to probe for a hostname.
 *
 * IMPORTANT: Only include sources that ALWAYS return HTTP 200.
 * Sources that return 404 for unknown domains (Clearbit, faviconV2, DuckDuckGo,
 * direct /favicon.ico) must NOT be listed here — they produce visible browser
 * console errors that can't be suppressed. Those are handled server-side by the
 * proxy route (/api/favicon) where 404s are invisible.
 */
function staticSources(hostname: string): string[] {
  return [
    // Google S2: always returns HTTP 200 — real icon or a generic globe. Never 404.
    `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
  ];
}

// ─── Server-side proxy ────────────────────────────────────────────────────────

/**
 * Calls our /api/favicon route, which fetches the page HTML server-side
 * (no CORS) and extracts real <link rel="icon"> hrefs.
 * Returns [] on any error so callers can fall back gracefully.
 */
async function fetchViaProxy(hostname: string, timeoutMs: number): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  try {
    const signal = AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined;
    const res = await fetch(`/api/favicon?domain=${encodeURIComponent(hostname)}`, {
      signal,
    } as RequestInit);
    if (!res.ok) return [];
    const data = await res.json() as { icons?: string[] };
    return Array.isArray(data.icons) ? data.icons : [];
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Synchronous fallback: returns the Google S2 URL immediately.
 * Use as an instant placeholder before `fetchBestFavicon` resolves.
 */
export function getFaviconUrl(urlOrDomain: string, size = 64): string {
  const hostname = extractHostname(urlOrDomain);
  if (!hostname) return '';
  
  // Custom favicon handling for faceprep.online
  if (hostname.includes('faceprep.online')) {
    return '/faceprep.png';
  }
  
  // Custom favicon handling for gmail.com
  if (hostname.includes('gmail.com')) {
    return 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png';
  }
  
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`;
}

/**
 * Resolves the best available favicon for a URL or domain.
 *
 * - Fires all static sources + the server-side HTML proxy **in parallel**
 * - Returns the first URL whose image actually loads and passes validation
 * - Caches per-hostname for the browser session
 * - Falls back to Google S2 URL if everything fails (never returns empty on
 *   a valid domain — the Google globe is better than no icon)
 *
 * @param urlOrDomain  e.g. "github.com" or "https://github.com/org/repo"
 * @param timeoutMs    Per-source image load timeout (default 6 s)
 */
export async function fetchBestFavicon(
  urlOrDomain: string,
  timeoutMs = 6000
): Promise<string> {
  if (typeof window === 'undefined') return getFaviconUrl(urlOrDomain);

  const hostname = extractHostname(urlOrDomain);
  if (!hostname) return '';
  
  // Custom favicon handling for faceprep.online
  if (hostname.includes('faceprep.online')) {
    return '/faceprep.png';
  }

  // Custom favicon handling for gmail.com
  if (hostname.includes('gmail.com')) {
    return 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_32dp.png';
  }

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const hit = cache.get(hostname);
  if (hit !== undefined) return hit === MISS ? getFaviconUrl(urlOrDomain) : hit;

  // ── Mark in-flight to prevent duplicate parallel fetches ──────────────────
  // (A second caller during the first probe will see the sentinel, but that's
  //  fine — they'll get the google fallback instantly instead of waiting)
  cache.set(hostname, MISS);

  // ── Gather all sources ────────────────────────────────────────────────────
  // Kick off the server-side proxy request in parallel with static probes.
  const proxyPromise = fetchViaProxy(hostname, Math.min(timeoutMs, 7000));
  const statics = staticSources(hostname);

  // ── Race: first valid image wins ──────────────────────────────────────────
  const winner = await raceAll(statics, proxyPromise, timeoutMs);

  // Cache the real winner (or keep MISS so next call gets google fallback)
  if (winner) cache.set(hostname, winner);

  return winner || getFaviconUrl(urlOrDomain); // always return something usable
}

/**
 * Warms the cache for a URL without blocking the caller.
 * Call on input blur/paste so the result is ready by the time the user clicks Add.
 */
export function prefetchFavicon(urlOrDomain: string, timeoutMs = 6000): void {
  const hostname = extractHostname(urlOrDomain);
  if (!hostname || cache.has(hostname)) return;
  fetchBestFavicon(urlOrDomain, timeoutMs).catch(() => {});
}

// ─── Racing internals ─────────────────────────────────────────────────────────

/**
 * Races static sources immediately, AND incorporates URLs returned by the
 * server proxy as soon as they arrive — without waiting for the proxy first.
 */
async function raceAll(
  staticUrls: string[],
  proxyPromise: Promise<string[]>,
  timeoutMs: number
): Promise<string | null> {
  return new Promise((resolve) => {
    let won = false;
    let pendingCount = staticUrls.length; // proxy URLs added dynamically

    const accept = (src: string) => {
      if (won) return;
      won = true;
      resolve(src);
    };

    const oneFailed = () => {
      pendingCount--;
      if (!won && pendingCount === 0) resolve(null);
    };

    const addSource = (src: string) => {
      if (won) return;
      pendingCount++;
      probeImage(src, timeoutMs).then((ok) => (ok ? accept(src) : oneFailed()));
    };

    // Global safety-net timeout — ensures promise never hangs forever
    setTimeout(() => {
      if (!won) {
        won = true;
        resolve(null);
      }
    }, timeoutMs + 6000);

    // Launch static probes immediately
    for (const src of staticUrls) {
      probeImage(src, timeoutMs).then((ok) => (ok ? accept(src) : oneFailed()));
    }

    // When proxy resolves, add its URLs to the race pool
    proxyPromise
      .then((proxyUrls) => {
        if (won) return;
        if (proxyUrls.length === 0) return; // no extra candidates
        for (const src of proxyUrls) {
          if (!staticUrls.includes(src)) addSource(src);
        }
      })
      .catch(() => {
        // Proxy failed — rely on static probes (or global timeout)
      });
  });
}

// ─── Image probe ─────────────────────────────────────────────────────────────

/**
 * Tries to load `src` as an image and validates the result.
 *
 * Accepted:
 *   • naturalWidth >= 4 && naturalHeight >= 4  (real raster icon)
 *   • naturalWidth === 0 && naturalHeight === 0  (SVG — no intrinsic dimensions)
 *
 * Rejected:
 *   • 1×1 pixel placeholder
 *   • Load timeout
 *   • onerror (404, CORS hard-block, non-image content)
 */
function probeImage(src: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w === 1 || h === 1) return finish(false);    // 1×1 placeholder
      if (w === 0 && h === 0) return finish(true);      // SVG
      finish(w >= 4 && h >= 4);                         // valid raster
    };

    img.onerror = () => finish(false);
    img.src = src;
  });
}
