// API route for publishing Community Notes to DKG

import { NextRequest, NextResponse } from 'next/server';
import { publishToDKG, validateCommunityNote } from '@/lib/dkg';
import { CommunityNote } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const note: CommunityNote = await request.json();
    
    // Validate note structure
    if (!validateCommunityNote(note)) {
      return NextResponse.json(
        { error: 'Invalid Community Note structure' },
        { status: 400 }
      );
    }
    
    // Publish to DKG
    const result = await publishToDKG(note);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to publish to DKG' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

