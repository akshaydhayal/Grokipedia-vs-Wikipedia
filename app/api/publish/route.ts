// API route for publishing Community Notes to DKG

import { NextRequest, NextResponse } from 'next/server';
import { validateCommunityNote } from '@/lib/dkg';
import { CommunityNote } from '@/types';
import { spawn } from 'child_process';
import path from 'path';

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
    
    const scriptPath = path.join(process.cwd(), 'dkg-publish', 'publish-script.js');
    console.log('Running DKG publish script at:', scriptPath);
    
    const result = await new Promise<DKGPublishResult>((resolve, reject) => {
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
        
        try {
          // Parse the last line of stdout as JSON result
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result: DKGPublishResult = JSON.parse(lastLine);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse DKG result: ${stdout || stderr}`));
        }
      });
      
      // Send input to the script
      child.stdin.write(input);
      child.stdin.end();
    });
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'DKG publish failed',
        jsonld: note,
      }, { status: 500 });
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

