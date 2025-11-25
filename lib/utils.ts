// Text normalization and utility functions

import * as cheerio from 'cheerio';

/**
 * Normalizes HTML content to plain text
 */
export function normalizeText(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Splits text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting - can be improved with NLP libraries
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short fragments
  
  return sentences;
}

/**
 * Extracts main content from Wikipedia HTML (removes references, navboxes, etc.)
 */
export function extractMainContent(html: string): string {
  // Use Cheerio for better HTML parsing
  try {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, .navbox, .reference, .mw-editsection, .mw-jump-link, .toc, .infobox, .thumb, .gallery, .metadata, .hatnote, .dablink, .vertical-navbox, .sistersitebox, .ambox, .mbox').remove();
    
    // Try to find the main content area
    let content = '';
    
    // Try common Wikipedia content selectors
    const contentSelectors = [
      '#content',
      '#bodyContent',
      '.mw-parser-output',
      'main',
      'article',
      '[role="main"]',
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text();
        if (content.length > 500) { // Good amount of content
          break;
        }
      }
    }
    
    // If no specific content found, get body text
    if (!content || content.length < 500) {
      // Remove more unwanted elements
      $('header, footer, aside, .sidebar, .navigation, .catlinks, .mw-normal-catlinks, .printfooter, .mw-cite-backlink').remove();
      content = $('body').text();
    }
    
    return content;
  } catch (error) {
    // Fallback to regex-based extraction if Cheerio fails
    console.warn('Cheerio not available, using regex extraction');
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<div class="navbox[^"]*">[\s\S]*?<\/div>/gi, '')
      .replace(/<div class="reference[^"]*">[\s\S]*?<\/div>/gi, '')
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<span class="mw-editsection[^"]*">[\s\S]*?<\/span>/gi, '')
      .replace(/<div class="toc[^"]*">[\s\S]*?<\/div>/gi, '')
      .replace(/<div class="infobox[^"]*">[\s\S]*?<\/div>/gi, '');
    
    return normalizeText(content);
  }
}

/**
 * Normalizes vector dimensions by padding or truncating to target length
 */
export function normalizeVectorDimension(vector: number[], targetLength: number): number[] {
  if (vector.length === targetLength) {
    return vector;
  }
  
  if (vector.length < targetLength) {
    // Pad with zeros
    return [...vector, ...new Array(targetLength - vector.length).fill(0)];
  } else {
    // Truncate
    return vector.slice(0, targetLength);
  }
}

/**
 * Calculates cosine similarity between two vectors
 * Handles vectors of different lengths by normalizing to the shorter length
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || vecA.length === 0 || !vecB || vecB.length === 0) {
    return 0;
  }
  
  // Normalize to same length (use the minimum length)
  const targetLength = Math.min(vecA.length, vecB.length);
  const normalizedA = normalizeVectorDimension(vecA, targetLength);
  const normalizedB = normalizeVectorDimension(vecB, targetLength);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < targetLength; i++) {
    dotProduct += normalizedA[i] * normalizedB[i];
    normA += normalizedA[i] * normalizedA[i];
    normB += normalizedB[i] * normalizedB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

/**
 * Formats a date to ISO string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generates a unique ID for discrepancies
 */
export function generateDiscrepancyId(index: number): string {
  return `d${index + 1}`;
}

