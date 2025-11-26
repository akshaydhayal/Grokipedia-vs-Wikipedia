// Standalone script to publish to DKG
// This script is called from Next.js API route via child process
// Usage: node publish-script.js

import DKG from './index.js';
import 'dotenv/config';

// Read input from stdin
let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  try {
    const input = JSON.parse(inputData);
    
    const {
      note,
      nodeEndpoint = 'https://v6-pegasus-node-03.origin-trail.network',
      nodePort = '8900',
      blockchainName = 'otp:20430',
      privateKey,
    } = input;

    if (!privateKey) {
      console.log(JSON.stringify({
        success: false,
        error: 'Private key is required',
      }));
      process.exit(1);
    }

    if (!note) {
      console.log(JSON.stringify({
        success: false,
        error: 'Note is required',
      }));
      process.exit(1);
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
    console.error('Publishing to DKG...'); // Use stderr for logs
    const createResult = await dkgClient.asset.create(dkgContent, {
      epochsNum: 2,
      minimumNumberOfFinalizationConfirmations: 3,
      minimumNumberOfNodeReplications: 1,
    });

    console.error('DKG publish completed'); // Use stderr for logs
    console.error('Create result:', JSON.stringify(createResult, null, 2)); // Log full result for debugging

    // Extract UAL and datasetRoot
    const ual = createResult.UAL || createResult.ual;
    const datasetRoot = createResult.publicAssertionId || createResult.datasetRoot || null;

    // Output result to stdout as JSON
    console.log(JSON.stringify({
      success: true,
      ual: ual,
      datasetRoot: datasetRoot,
      operation: createResult.operation || null,
    }));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.log(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
    }));
    process.exit(1);
  }
});

