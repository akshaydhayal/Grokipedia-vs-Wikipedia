// API route for typeahead suggestions from Grokipedia

import { NextRequest, NextResponse } from 'next/server';

export interface TypeaheadResult {
  slug: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  viewCount: string;
}

export interface TypeaheadResponse {
  results: TypeaheadResult[];
  searchTimeMs: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '5';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const response = await fetch(
      `https://grokipedia.com/api/typeahead?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error('Typeahead API error:', response.status);
      return NextResponse.json({ results: [] });
    }

    const data: TypeaheadResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching typeahead:', error);
    return NextResponse.json({ results: [] });
  }
}

