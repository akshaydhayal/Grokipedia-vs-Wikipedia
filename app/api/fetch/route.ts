// API route for fetching articles from Wikipedia and Grokipedia

import { NextRequest, NextResponse } from 'next/server';
import { fetchWikipediaArticle } from '@/lib/wikipedia';
import { fetchGrokipediaArticle } from '@/lib/grokipedia';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Fetch from both sources in parallel
    const [wikipedia, grokipedia] = await Promise.allSettled([
      fetchWikipediaArticle(topic),
      fetchGrokipediaArticle(topic),
    ]);
    
    const result: any = {
      topic,
      wikipedia: null,
      grokipedia: null,
      errors: {},
    };
    
    if (wikipedia.status === 'fulfilled') {
      result.wikipedia = wikipedia.value;
      console.log(`✓ Wikipedia fetched: ${result.wikipedia.sentences.length} sentences`);
    } else {
      const errorMsg = wikipedia.reason?.message || 'Failed to fetch Wikipedia article';
      result.errors.wikipedia = errorMsg;
      console.error('✗ Wikipedia fetch failed:', errorMsg);
    }
    
    if (grokipedia.status === 'fulfilled') {
      result.grokipedia = grokipedia.value;
      console.log(`✓ Grokipedia fetched: ${result.grokipedia.sentences.length} sentences`);
      console.log(`  URL: ${result.grokipedia.url}`);
      console.log(`  Content length: ${result.grokipedia.content.length} chars`);
    } else {
      const errorMsg = grokipedia.reason?.message || 'Failed to fetch Grokipedia article';
      result.errors.grokipedia = errorMsg;
      console.error('✗ Grokipedia fetch failed:', errorMsg);
      console.error('  Attempted URL:', `https://grokipedia.com/page/${encodeURIComponent(topic)}`);
    }
    
    // Return error if both failed
    if (!result.wikipedia && !result.grokipedia) {
      return NextResponse.json(
        { error: 'Failed to fetch articles from both sources', details: result.errors },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in fetch API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

