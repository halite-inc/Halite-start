import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, getFromCache, setInCache } from '../../lib/rateLimit';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`suggest:${ip}`, 120, 60 * 1000); // 120 requests/minute (2/sec average for debounced search)
  if (!rateLimit.success) {
    return NextResponse.json(
      { suggestions: [] },
      {
        status: 429,
        headers: {
          ...corsHeaders(),
          'Retry-After': '30',
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders() });
    }

    const cacheKey = `suggest:${q.toLowerCase()}`;
    const cached = getFromCache<string[]>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { suggestions: cached },
        {
          headers: {
            ...corsHeaders(),
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    const googleUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`;
    const res = await fetch(googleUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders(), status: 200 });
    }
    const data = await res.json();
    const suggestions: string[] = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    const sliced = suggestions.slice(0, 8);

    setInCache(cacheKey, sliced, 3600); // 1 hour TTL

    return NextResponse.json(
      { suggestions: sliced },
      {
        headers: {
          ...corsHeaders(),
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json({ suggestions: [] }, { headers: corsHeaders(), status: 200 });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
