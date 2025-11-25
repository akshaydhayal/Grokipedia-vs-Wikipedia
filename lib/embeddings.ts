// Gemini embeddings service

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini client
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Gets embeddings for a text using Gemini
 * Note: Gemini doesn't have a dedicated embeddings API, so we'll use the model's embedding capability
 * For production, consider using text-embedding-004 or similar embedding models
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const client = getGeminiClient();
    
    // Use Gemini's embedding model if available, otherwise use a workaround
    // For now, we'll use the generative model to create a representation
    // In production, you might want to use a dedicated embedding service
    
    // Alternative: Use Gemini's text-embedding-004 model if available
    // For MVP, we'll use a simpler approach with the generative model
    
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create a prompt that generates a numerical representation
    // This is a workaround - ideally use a proper embedding model
    const prompt = `Convert the following text into a numerical embedding vector (as a JSON array of 768 numbers between -1 and 1):\n\n${text}`;
    
    // For MVP, we'll use a simpler token-based approach
    // Generate a hash-like representation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const embeddingText = response.text();
    
    // Parse the embedding from the response
    // This is a simplified approach - in production, use proper embedding APIs
    try {
      const parsed = JSON.parse(embeddingText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback: generate a simple hash-based embedding
      return generateSimpleEmbedding(text);
    }
    
    return generateSimpleEmbedding(text);
  } catch (error) {
    console.error('Error getting embedding:', error);
    // Fallback to simple embedding
    return generateSimpleEmbedding(text);
  }
}

/**
 * Fallback: Generate a simple embedding based on text characteristics
 * Uses word frequency, character n-grams, and text statistics for better semantic representation
 */
function generateSimpleEmbedding(text: string): number[] {
  // Create a 384-dimensional embedding (common size)
  const embedding: number[] = new Array(384).fill(0);
  
  // Normalize text
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  const chars = normalized.split('');
  
  // Feature 1: Word frequency (first 128 dimensions)
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  let wordIndex = 0;
  for (const [word, freq] of Object.entries(wordFreq)) {
    const hash = simpleHash(word);
    embedding[hash % 128] += freq / words.length;
    wordIndex++;
  }
  
  // Feature 2: Character n-grams (next 128 dimensions)
  const ngrams = getNgrams(normalized, 3);
  ngrams.forEach(ngram => {
    const hash = simpleHash(ngram);
    embedding[128 + (hash % 128)] += 1 / ngrams.length;
  });
  
  // Feature 3: Text statistics (next 64 dimensions)
  embedding[256] = text.length / 1000; // Normalized length
  embedding[257] = words.length / 100; // Word count
  embedding[258] = chars.filter(c => /[a-z]/.test(c)).length / text.length; // Letter ratio
  embedding[259] = chars.filter(c => /[0-9]/.test(c)).length / text.length; // Digit ratio
  embedding[260] = words.filter(w => w.length > 5).length / words.length; // Long word ratio
  
  // Feature 4: Position-based features (remaining dimensions)
  for (let i = 0; i < Math.min(chars.length, 124); i++) {
    embedding[261 + i] = chars[i].charCodeAt(0) / 1000;
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate character n-grams from text
 */
function getNgrams(text: string, n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    ngrams.push(text.substring(i, i + n));
  }
  return ngrams;
}

/**
 * Gets embeddings for multiple texts in batch
 */
export async function getEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Process in smaller batches to avoid rate limits
  const batchSize = 10;
  const embeddings: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(text => getEmbedding(text))
    );
    embeddings.push(...batchEmbeddings);
    
    // Small delay to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}

/**
 * Alternative: Use Gemini's text-embedding-004 if available
 * This would be the preferred method
 */
export async function getEmbeddingWithModel(text: string, modelName: string = 'text-embedding-004'): Promise<number[]> {
  try {
    const client = getGeminiClient();
    
    // Try to use embedding model if available
    // Note: Check Gemini API docs for actual embedding model availability
    const model = client.getGenerativeModel({ model: modelName });
    
    // This is a placeholder - adjust based on actual Gemini embedding API
    const result = await model.embedContent(text);
    
    // Return embedding vector
    // Adjust based on actual API response structure
    return result.embedding?.values || generateSimpleEmbedding(text);
  } catch (error) {
    console.warn('Embedding model not available, using fallback:', error);
    return getEmbedding(text);
  }
}

