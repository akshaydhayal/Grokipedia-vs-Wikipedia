// DKG publishing client

import { CommunityNote, PublishResult, Discrepancy } from '@/types';
import { formatDate } from './utils';

// Dynamic import for DKG client (ES modules)
let DKGClient: any = null;

/**
 * Gets the DKG client instance
 * Note: This function only works in server-side (API routes) context
 */
async function getDKGClient() {
  if (DKGClient) {
    return DKGClient;
  }

  const path = await import('path');
  const { pathToFileURL } = await import('url');
  const expectedPath = path.join(process.cwd(), 'dkg-publish', 'index.js');
  
  try {
    const dkgPath = path.join(process.cwd(), 'dkg-publish', 'index.js');
    
    // Strategy 1: Use pathToFileURL for proper file:// URL conversion (handles Windows paths)
    try {
      const fileUrl = pathToFileURL(dkgPath).href;
      console.log('Attempting to import DKG from:', fileUrl);
      const DKGModule = await import(fileUrl);
      
      if (DKGModule.default) {
        DKGClient = DKGModule.default;
        return DKGClient;
      }
    } catch (urlError: any) {
      console.log('File URL import failed:', urlError.message);
      
      // Strategy 2: Try relative path from project root
      try {
        const relativePath = './dkg-publish/index.js';
        console.log('Attempting relative import from:', relativePath);
        const DKGModule = await import(relativePath);
        
        if (DKGModule.default) {
          DKGClient = DKGModule.default;
          return DKGClient;
        }
      } catch (relativeError: any) {
        console.log('Relative path import failed:', relativeError.message);
        throw urlError; // Throw original error
      }
    }
    
    throw new Error('DKG module does not have a default export');
  } catch (error) {
    console.error('Error importing DKG client:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    throw new Error(`Failed to load DKG client from ${expectedPath}. Error: ${errorMessage}. Make sure the dkg-publish folder exists and contains index.js`);
  }
}

/**
 * Publishes a Community Note to the DKG
 */
export async function publishToDKG(note: CommunityNote): Promise<PublishResult> {
  try {
    // Check if DKG is configured
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT || 'https://v6-pegasus-node-03.origin-trail.network';
    const nodePort = process.env.DKG_NODE_PORT || '8900';
    const blockchainName = process.env.DKG_BLOCKCHAIN_NAME || 'otp:20430';
    const privateKey = process.env.DKG_PRIVATE_KEY;
    
    if (!privateKey) {
      // Return JSON-LD for manual publishing
      console.warn('DKG private key not configured, returning JSON-LD only');
      return {
        success: true,
        jsonld: note,
        error: 'DKG private key not configured - JSON-LD generated but not published',
      };
    }

    // Get DKG client class
    const DKG = await getDKGClient();

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
    // DKG expects content with a 'public' property containing the JSON-LD
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

    return {
      success: true,
      ual: ual,
      jsonld: note,
      operation: createResult.operation || null,
    };
  } catch (error) {
    console.error('Error publishing to DKG:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      jsonld: note,
    };
  }
}

/**
 * Generates a Community Note from comparison results
 */
export function generateCommunityNote(
  topic: string,
  comparisons: any[],
  summary: any,
  wikipediaUrl: string,
  grokipediaUrl: string,
  authorDid?: string
): CommunityNote {
  // Generate base URN for this comparison session
  const sessionId = Date.now();
  const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
  const noteId = `urn:groki-vs-wiki:note:${topicSlug}:${sessionId}`;
  
  const discrepancies: Discrepancy[] = comparisons
    .filter(c => c.status === 'unique' || c.similarity < 0.6)
    .slice(0, 10) // Limit to 10 discrepancies to avoid payload size issues
    .map((comp, index) => {
      // Truncate long sentences to avoid validation issues
      const truncate = (text: string, maxLen: number = 500) => 
        text && text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
      
      const discrepancy: Discrepancy = {
        '@id': `${noteId}:discrepancy:${index + 1}`,
        '@type': 'Comment',
        grok_sentence: truncate(comp.grokSentence.text),
        wiki_sentence: truncate(comp.bestMatch?.wikiSentence.text || ''),
        similarity_score: Math.round(comp.similarity * 1000) / 1000, // Round to 3 decimals
        evidence: [
          wikipediaUrl,
          grokipediaUrl,
        ],
        note: comp.similarity < 0.3
          ? 'Potential hallucination: claim not found in Wikipedia or reliable sources.'
          : 'Content differs significantly from Wikipedia. Verify with additional sources.',
        status: comp.similarity < 0.3 ? 'hallucination' : 'factual_inconsistency',
      };
      
      return discrepancy;
    });
    
  const note: CommunityNote = {
    '@context': 'https://www.schema.org',
    '@type': 'CreativeWork',
    '@id': noteId,
    name: `Groki vs Wiki: ${topic} discrepancy summary`,
    about: topic,
    author: authorDid || 'did:example:anonymous',
    published: formatDate(),
    summary: `Auto-detected ${discrepancies.length} discrepancies between Grokipedia and Wikipedia. Found ${summary.potentialHallucinations.length} potential hallucinations.`,
    discrepancies,
    relatedUALs: [],
  };
  
  return note;
}

/**
 * Validates a Community Note structure
 */
export function validateCommunityNote(note: CommunityNote): boolean {
  return !!(
    note['@context'] &&
    note['@type'] &&
    note['@id'] &&
    note.name &&
    note.about &&
    note.published &&
    note.summary &&
    Array.isArray(note.discrepancies) &&
    note.discrepancies.every(d => d['@id'] && d['@type'])
  );
}

