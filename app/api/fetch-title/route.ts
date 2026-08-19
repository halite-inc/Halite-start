import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, getFromCache, setInCache } from '../../lib/rateLimit';

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

/** Reads at most `maxBytes` from a Response body, then cancels the stream. */
async function readPartial(res: Response, maxBytes = 16_000): Promise<string> {
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

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`fetch-title:${ip}`, 40, 60 * 1000); // 40 requests/minute
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let targetUrl = urlParam;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // Validate hostname to prevent SSRF
  try {
    const parsed = new URL(targetUrl);
    if (!isValidHostname(parsed.hostname)) {
      return NextResponse.json({ title: '' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ title: '' }, { status: 400 });
  }

  const cacheKey = `title:${targetUrl}`;
  const cachedTitle = getFromCache<string>(cacheKey);
  if (cachedTitle !== null) {
    return NextResponse.json(
      { title: cachedTitle },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    );
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HaliteBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return NextResponse.json({ title: '' });
    }

    // Only read the first 16KB — <title> is always in the <head>
    const html = await readPartial(response, 16_000);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (titleMatch && titleMatch[1]) {
      // Decode basic HTML entities
      const title = titleMatch[1]
        .trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      setInCache(cacheKey, title, 86400); // 24 hours TTL
      return NextResponse.json(
        { title },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
          },
        }
      );
    }

    return NextResponse.json({ title: '' });
  } catch (error) {
    console.error('Error fetching title for URL:', targetUrl, error);
    return NextResponse.json({ title: '' }, { status: 500 });
  }
}
