// DKG publishing client

import { CommunityNote, PublishResult, Discrepancy } from '@/types';
import { formatDate, generateDiscrepancyId } from './utils';

// Note: dkg.js might have different API - adjust based on actual SDK
// This is a placeholder implementation

/**
 * Publishes a Community Note to the DKG
 */
export async function publishToDKG(note: CommunityNote): Promise<PublishResult> {
  try {
    // Check if DKG is configured
    const nodeEndpoint = process.env.DKG_NODE_ENDPOINT;
    const privateKey = process.env.DKG_PRIVATE_KEY;
    
    if (!nodeEndpoint || !privateKey) {
      // Return JSON-LD for manual publishing
      console.warn('DKG not configured, returning JSON-LD only');
      return {
        success: true,
        jsonld: note,
        error: 'DKG not configured - JSON-LD generated but not published',
      };
    }
    
    // TODO: Implement actual DKG publishing using dkg.js
    // Example structure (adjust based on actual SDK):
    /*
    const { DKGClient } = require('dkg.js');
    const client = new DKGClient({
      endpoint: nodeEndpoint,
      blockchain: {
        name: 'otp::neuroweb',
        // ... other config
      },
    });
    
    const result = await client.assets.create({
      asset: note,
      ownerDid: note.author || 'did:example:default',
      // ... other options
    });
    
    return {
      success: true,
      ual: result.ual,
      jsonld: note,
    };
    */
    
    // For MVP, return mock UAL
    const mockUAL = `did:dkg:otp:neuroweb:${Date.now()}`;
    
    return {
      success: true,
      ual: mockUAL,
      jsonld: note,
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
  const discrepancies: Discrepancy[] = comparisons
    .filter(c => c.status === 'unique' || c.similarity < 0.6)
    .map((comp, index) => {
      const discrepancy: Discrepancy = {
        id: generateDiscrepancyId(index),
        grok_sentence: comp.grokSentence.text,
        wiki_sentence: comp.bestMatch?.wikiSentence.text,
        similarity_score: comp.similarity,
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
    '@context': 'https://schema.org',
    '@type': 'CommunityNote',
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
    note.name &&
    note.about &&
    note.published &&
    note.summary &&
    Array.isArray(note.discrepancies)
  );
}

