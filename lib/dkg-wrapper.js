// CommonJS wrapper for DKG client to work with Next.js
// This file acts as a bridge between Next.js and the ES module DKG client

const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

let DKGClient = null;

async function getDKGClient() {
  if (DKGClient) {
    return DKGClient;
  }

  try {
    const cwd = process.cwd();
    console.log('Current working directory:', cwd);
    
    const dkgPath = path.join(cwd, 'dkg-publish', 'index.js');
    console.log('Looking for DKG at path:', dkgPath);
    console.log('Path exists?', fs.existsSync(dkgPath));
    
    // Check if file exists
    if (!fs.existsSync(dkgPath)) {
      throw new Error(`DKG file not found at: ${dkgPath}`);
    }
    
    // Try multiple import strategies
    let DKGModule;
    
    // Strategy 1: Use pathToFileURL
    try {
      const fileUrl = pathToFileURL(dkgPath).href;
      console.log('Attempting import with file URL:', fileUrl);
      DKGModule = await import(fileUrl);
      console.log('Successfully imported with file URL');
    } catch (urlError) {
      console.log('File URL import failed:', urlError.message);
      
      // Strategy 2: Try relative path
      try {
        const relativePath = path.relative(__dirname, dkgPath).replace(/\\/g, '/');
        console.log('Attempting import with relative path:', relativePath);
        DKGModule = await import(relativePath);
        console.log('Successfully imported with relative path');
      } catch (relativeError) {
        console.log('Relative path import failed:', relativeError.message);
        
        // Strategy 3: Try with forward slashes only
        try {
          const forwardSlashPath = dkgPath.replace(/\\/g, '/');
          const manualUrl = `file:///${forwardSlashPath}`;
          console.log('Attempting import with manual URL:', manualUrl);
          DKGModule = await import(manualUrl);
          console.log('Successfully imported with manual URL');
        } catch (manualError) {
          throw new Error(`All import strategies failed. Last error: ${manualError.message}`);
        }
      }
    }
    
    if (DKGModule.default) {
      DKGClient = DKGModule.default;
      return DKGClient;
    }
    
    throw new Error('DKG module does not have a default export');
  } catch (error) {
    console.error('Error loading DKG client:', error);
    throw error;
  }
}

module.exports = { getDKGClient };

