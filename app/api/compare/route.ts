// API route for comparing articles

import { NextRequest, NextResponse } from 'next/server';
import { compareArticles } from '@/lib/similarity';
import { Article } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { wikipedia, grokipedia } = await request.json();
    
    if (!wikipedia || !grokipedia) {
      return NextResponse.json(
        { error: 'Both Wikipedia and Grokipedia articles are required' },
        { status: 400 }
      );
    }
    
    // Validate article structure
    const wikiArticle: Article = {
      title: wikipedia.title,
      content: wikipedia.content,
      url: wikipedia.url,
      sentences: wikipedia.sentences || [],
    };
    
    const grokArticle: Article = {
      title: grokipedia.title,
      content: grokipedia.content,
      url: grokipedia.url,
      sentences: grokipedia.sentences || [],
    };
    
    // Perform comparison
    const comparison = await compareArticles(wikiArticle, grokArticle);
    
    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error in compare API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

