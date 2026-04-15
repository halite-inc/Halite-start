/**
 * app/api/favicon/route.ts
 *
 * Server-side favicon resolver. Fetches the target page HTML (bypassing browser
 * CORS entirely) and extracts the canonical favicon URLs from <link> tags.
 *
 * GET /api/favicon?domain=github.com
 * Response: { icons: string[] }  — ordered list of favicon URLs, highest priority first
 *
 * The returned URLs are absolute links to the actual icon files, ready to be
 * loaded directly as <img src=...> on the client.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Request validation ───────────────────────────────────────────────────────

/** Allow only safe-looking hostnames — guard against SSRF */
const HOSTNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)+$/;
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

function isValidHostname(hostname: string): boolean {
  if (!hostname || hostname.length > 253) return false;
  if (BLOCKED_HOSTS.has(hostname)) return false;
  // Block private IP ranges
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
  return HOSTNAME_RE.test(hostname);
}

// ─── HTML favicon extraction ──────────────────────────────────────────────────

/**
 * Extracts all favicon-related URLs from raw HTML.
 * Handles: rel="icon", rel="shortcut icon", rel="apple-touch-icon",
 *          rel="apple-touch-icon-precomposed", rel="mask-icon"
 * Returns absolute URLs resolved against `baseUrl`.
 */
function extractFaviconUrls(html: string, baseUrl: string): string[] {
  const seen = new Set<string>();
  const icons: string[] = [];

  const addIfNew = (href: string) => {
    try {
      const abs = new URL(href.trim(), baseUrl).toString();
      // Skip data: URIs — they don't work as img.src in all browsers
      if (abs.startsWith('data:')) return;
      if (!seen.has(abs)) {
        seen.add(abs);
        icons.push(abs);
      }
    } catch { /* skip unparseable hrefs */ }
  };

  // Find all <link> tags (e.g. the first 20KB covers the <head> in all real pages)
  const linkTagRe = /<link\b([^>]+)>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkTagRe.exec(html)) !== null) {
    const attrs = match[1];

    // Check rel attribute (handles both attr orders)
    const relMatch = attrs.match(/\brel=["']([^"']+)["']/i);
    if (!relMatch) continue;

    const rel = relMatch[1].toLowerCase().trim();
    const isIconRel =
      rel === 'icon' ||
      rel === 'shortcut icon' ||
      rel === 'apple-touch-icon' ||
      rel === 'apple-touch-icon-precomposed' ||
      rel === 'mask-icon';

    if (!isIconRel) continue;

    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (hrefMatch?.[1]) addIfNew(hrefMatch[1]);
  }

  // Also try to find manifest.json links and extract icons from there
  // (Many PWAs declare icons only in manifest)
  const manifestRe = /<link\b[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["']/i;
  const manifestMatch = html.match(manifestRe);
  if (manifestMatch?.[1]) {
    // Return the manifest URL as a hint — caller can fetch it separately
    // For now we just note it exists; icon extraction happens at a deeper level
  }

  return icons;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/** Reads at most `maxBytes` from a Response body, then cancels the stream. */
async function readPartial(res: Response, maxBytes = 32_000): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).substring(0, maxBytes);

  const decoder = new TextDecoder();
  let result = '';
  try {
    while (result.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  return result;
}

// ─── Additional CDN sources (probed server-side) ─────────────────────────────

/**
 * Candidate URLs to probe server-side. These sources return 404 for unknown
 * domains, so we can't use them as browser-side image probes (they'd show in
 * the browser console). Instead we HEAD-check them here — 404s are invisible.
 */
function cdnCandidates(domain: string): string[] {
  return [
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    `https://${domain}/favicon.svg`,
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
  ];
}

/** Returns true if a URL likely points to a real image (HEAD check). */
async function isValidImageUrl(url: string, timeoutMs = 3000): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
      redirect: 'follow',
      headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] },
    } as RequestInit);
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') ?? '';
    return ct.startsWith('image/') || ct.includes('icon');
  } catch {
    return false;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')?.trim().toLowerCase();

  if (!domain || !isValidHostname(domain)) {
    return NextResponse.json({ icons: [] }, { status: 400 });
  }

  const baseUrl = `https://${domain}`;

  // Run HTML fetch + CDN HEAD checks in parallel
  const htmlFetchPromise = (async (): Promise<string[]> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      let html = '';
      try {
        const res = await fetch(baseUrl, {
          signal: controller.signal,
          headers: FETCH_HEADERS,
          redirect: 'follow',
        });
        const ct = res.headers.get('content-type') ?? '';
        if (ct.includes('text/html') || ct.includes('xhtml')) {
          html = await readPartial(res, 32_000);
        }
      } finally {
        clearTimeout(timeout);
      }
      return html ? extractFaviconUrls(html, baseUrl) : [];
    } catch {
      return [];
    }
  })();

  const cdnProbePromise = (async (): Promise<string[]> => {
    const candidates = cdnCandidates(domain);
    // Race all HEAD checks in parallel; collect those that succeed
    const results = await Promise.allSettled(
      candidates.map(async (url) => ({ url, valid: await isValidImageUrl(url) }))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<{ url: string; valid: boolean }> =>
        r.status === 'fulfilled' && r.value.valid
      )
      .map((r) => r.value.url);
  })();

  try {
    const [htmlIcons, cdnIcons] = await Promise.all([htmlFetchPromise, cdnProbePromise]);

    // Merge: HTML-declared icons first (highest fidelity), then CDN sources
    const seen = new Set<string>();
    const icons: string[] = [];
    for (const url of [...htmlIcons, ...cdnIcons]) {
      if (!seen.has(url)) { seen.add(url); icons.push(url); }
    }

    return NextResponse.json(
      { icons },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { icons: [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
