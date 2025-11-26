// Separate API route for DKG publishing to handle ES module imports
import { NextRequest, NextResponse } from 'next/server';
import { CommunityNote } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const note: CommunityNote = await request.json();
    
    // Check if DKG is configured
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    const privateKey = process.env.DKG_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'DKG private key not configured',
          jsonld: note 
        },
        { status: 400 }
      );
    }

    // Dynamic import of DKG client
    const path = await import('path');
    const { pathToFileURL } = await import('url');
    
    const dkgPath = path.join(process.cwd(), 'dkg-publish', 'index.js');
    const fileUrl = pathToFileURL(dkgPath).href;
    
    console.log('Importing DKG from:', fileUrl);
    
    const DKGModule = await import(fileUrl);
    const DKG = DKGModule.default;
    
    if (!DKG) {
      throw new Error('DKG module does not have a default export');
    }

    // Create DKG client instance
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

    // Transform CommunityNote to DKG format
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

    console.log('DKG publish result:', createResult);

    // Extract UAL from result
    const ual = createResult.UAL || createResult.ual;

    if (!ual) {
      throw new Error('UAL not returned from DKG');
    }

    return NextResponse.json({
      success: true,
      ual: ual,
      jsonld: note,
      operation: createResult.operation || null,
    });
  } catch (error) {
    console.error('Error in DKG publish API:', error);
    // Try to get the note from request (but it's already been consumed)
    let note: CommunityNote | null = null;
    try {
      const body = await request.json();
      note = body;
    } catch {
      // Request body already consumed
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        jsonld: note,
      },
      { status: 500 }
    );
  }
}

