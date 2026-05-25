import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let targetUrl = urlParam;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HaliteBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Short timeout so we don't hang the UI forever
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      return NextResponse.json({ title: '' });
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (titleMatch && titleMatch[1]) {
      // Decode basic HTML entities (like &amp;) if needed, but a simple trim works for most cases
      const title = titleMatch[1].trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return NextResponse.json({ title });
    }

    return NextResponse.json({ title: '' });
  } catch (error) {
    console.error('Error fetching title for URL:', targetUrl, error);
    return NextResponse.json({ title: '' }, { status: 500 });
  }
}
