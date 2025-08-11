import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders() });
    }

    const googleUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`;
    const res = await fetch(googleUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] }, { headers: corsHeaders(), status: 200 });
    }
    const data = await res.json();
    const suggestions: string[] = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    return NextResponse.json({ suggestions: suggestions.slice(0, 8) }, { headers: corsHeaders() });
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




