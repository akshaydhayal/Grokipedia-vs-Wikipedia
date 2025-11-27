// API route for fetching all published Knowledge Assets

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KnowledgeAsset from '@/models/KnowledgeAsset';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    // Build query
    const query: any = {};
    if (topic) {
      query.topic = { $regex: topic, $options: 'i' }; // Case-insensitive search
    }
    
    // Fetch assets
    const assets = await KnowledgeAsset.find(query)
      .sort({ publishedAt: -1 }) // Most recent first
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const total = await KnowledgeAsset.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      assets,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


