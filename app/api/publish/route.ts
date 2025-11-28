// API route for publishing Community Notes to DKG

import { NextRequest, NextResponse } from 'next/server';
import { validateCommunityNote } from '@/lib/dkg';
import { CommunityNote } from '@/types';
import connectDB from '@/lib/mongodb';
import KnowledgeAsset from '@/models/KnowledgeAsset';

// Type for the publish result
interface DKGPublishResult {
  success: boolean;
  ual?: string;
  datasetRoot?: string;
  error?: string;
  operation?: any;
}

export async function POST(request: NextRequest) {
  try {
    const note: CommunityNote = await request.json();
    
    // Validate note structure
    if (!validateCommunityNote(note)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Community Note structure' },
        { status: 400 }
      );
    }
    
    // Check if DKG is configured
    const privateKey = process.env.DKG_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        success: true,
        jsonld: note,
        error: 'DKG private key not configured - JSON-LD generated but not published',
      });
    }
    
    // Get DKG configuration
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    
    let result: DKGPublishResult;
    
    try {
      // Use the dkg.js npm package directly
      // Dynamic import to avoid bundling issues
      const DKGModule = await import('dkg.js');
      const DKG = DKGModule.default || DKGModule;
      
      console.log('Creating DKG client with endpoint:', nodeEndpoint);
      
      // Create DKG client
      const dkgClient = new DKG({
        endpoint: nodeEndpoint,
        port: nodePort,
        blockchain: {
          name: blockchainName,
          privateKey: privateKey,
        },
        maxNumberOfRetries: 300,
        frequency: 2,
        contentType: 'all',
        nodeApiVersion: '/v1',
      });
      
      // Transform to DKG format
      const dkgContent = {
        public: note,
      };
      
      // Publish to DKG
      console.log('Publishing to DKG...');
      const createResult = await dkgClient.asset.create(dkgContent, {
        epochsNum: 2,
        minimumNumberOfFinalizationConfirmations: 3,
        minimumNumberOfNodeReplications: 1,
      });
      
      console.log('DKG publish completed');
      console.log('Create result:', JSON.stringify(createResult, null, 2));
      
      // Extract UAL and datasetRoot
      const ual = createResult.UAL || createResult.ual;
      const datasetRoot = createResult.publicAssertionId || createResult.datasetRoot || null;
      
      result = {
        success: true,
        ual: ual,
        datasetRoot: datasetRoot || undefined,
        operation: createResult.operation || undefined,
      };
    } catch (dkgError) {
      console.error('DKG publish error:', dkgError);
      return NextResponse.json({
        success: false,
        error: dkgError instanceof Error ? dkgError.message : 'DKG publish failed',
        jsonld: note,
      }, { status: 500 });
    }
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'DKG publish failed',
        jsonld: note,
      }, { status: 500 });
    }

    // Save to MongoDB on successful publish
    try {
      await connectDB();
      
      const topic = note.about || 'Unknown';
      const discrepancyCount = note.discrepancies?.length || 0;
      const hallucinationCount = note.discrepancies?.filter(d => d.status === 'hallucination').length || 0;
      
      await KnowledgeAsset.create({
        topic,
        ual: result.ual!,
        datasetRoot: result.datasetRoot || undefined,
        publishedAt: new Date(note.published || new Date()),
        author: note.author,
        summary: note.summary,
        discrepancyCount,
        hallucinationCount,
        wikipediaUrl: note.discrepancies?.[0]?.evidence?.[0] || '',
        grokipediaUrl: note.discrepancies?.[0]?.evidence?.[1] || '',
        jsonld: note,
      });
      
      console.log('Knowledge Asset saved to MongoDB:', result.ual);
    } catch (dbError) {
      // Log error but don't fail the request if DB save fails
      console.error('Failed to save to MongoDB:', dbError);
    }

    return NextResponse.json({
      success: true,
      ual: result.ual,
      datasetRoot: result.datasetRoot || null,
      jsonld: note,
      operation: result.operation || null,
    });
  } catch (error) {
    console.error('Error in publish API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
