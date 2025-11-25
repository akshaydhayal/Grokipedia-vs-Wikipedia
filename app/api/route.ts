// Health check endpoint

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Grokipedia vs Wikipedia API is running',
    endpoints: {
      fetch: '/api/fetch',
      compare: '/api/compare',
      publish: '/api/publish',
    },
  });
}

