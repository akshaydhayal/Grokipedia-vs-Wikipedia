// Text normalization and utility functions

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
  // This is a simplified version - in production, use proper HTML parsing
  // Remove common Wikipedia elements
  let content = html
    .replace(/<div class="navbox[^"]*">[\s\S]*?<\/div>/gi, '')
    .replace(/<div class="reference[^"]*">[\s\S]*?<\/div>/gi, '')
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<span class="mw-editsection[^"]*">[\s\S]*?<\/span>/gi, '');
  
  return normalizeText(content);
}

/**
 * Calculates cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
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

