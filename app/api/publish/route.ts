// API route for publishing Community Notes to DKG

import { NextRequest, NextResponse } from 'next/server';
import { validateCommunityNote } from '@/lib/dkg';
import { CommunityNote } from '@/types';
import { spawn } from 'child_process';
import path from 'path';
import connectDB from '@/lib/mongodb';
import KnowledgeAsset from '@/models/KnowledgeAsset';

// Type for the child process result
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
    
    // Use child process to run DKG publish script
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    
    const input = JSON.stringify({
      note,
      nodeEndpoint,
      nodePort,
      blockchainName,
      privateKey,
    });
    
    // Try to use direct import first (works better on Vercel)
    // Fallback to child process if direct import fails
    let result: DKGPublishResult;
    
    try {
      // Direct import approach (better for Vercel)
      const { pathToFileURL } = await import('url');
      const dkgPath = path.join(process.cwd(), 'dkg-publish', 'index.js');
      const fileUrl = pathToFileURL(dkgPath).href;
      
      const DKGModule = await import(fileUrl);
      const DKG = DKGModule.default;
      
      if (!DKG) {
        throw new Error('DKG module does not have a default export');
      }
      
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
      
      // Extract UAL and datasetRoot
      const ual = createResult.UAL || createResult.ual;
      const datasetRoot = createResult.publicAssertionId || createResult.datasetRoot || null;
      
      result = {
        success: true,
        ual: ual,
        datasetRoot: datasetRoot,
        operation: createResult.operation || null,
      };
    } catch (directImportError) {
      // Fallback to child process if direct import fails
      console.log('Direct import failed, trying child process:', directImportError);
      
      const scriptPath = path.join(process.cwd(), 'dkg-publish', 'publish-script.js');
      console.log('Running DKG publish script at:', scriptPath);
      
      result = await new Promise<DKGPublishResult>((resolve, reject) => {
        const child = spawn('node', [scriptPath], {
          cwd: path.join(process.cwd(), 'dkg-publish'),
          env: { ...process.env },
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
          console.log('DKG Script:', data.toString());
        });
        
        child.on('error', (error) => {
          console.error('Failed to start DKG script:', error);
          reject(new Error(`Failed to start DKG script: ${error.message}`));
        });
        
        child.on('close', (code) => {
          console.log('DKG script exited with code:', code);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          
          if (code !== 0) {
            reject(new Error(`DKG script exited with code ${code}. stderr: ${stderr}`));
            return;
          }
          
          try {
            // Parse the last line of stdout as JSON result
            const lines = stdout.trim().split('\n').filter(line => line.trim());
            if (lines.length === 0) {
              reject(new Error(`No output from DKG script. stderr: ${stderr}`));
              return;
            }
            const lastLine = lines[lines.length - 1];
            const parsedResult: DKGPublishResult = JSON.parse(lastLine);
            resolve(parsedResult);
          } catch (parseError) {
            reject(new Error(`Failed to parse DKG result. stdout: ${stdout}, stderr: ${stderr}, parseError: ${parseError instanceof Error ? parseError.message : 'Unknown'}`));
          }
        });
        
        // Send input to the script
        child.stdin.write(input);
        child.stdin.end();
      });
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

