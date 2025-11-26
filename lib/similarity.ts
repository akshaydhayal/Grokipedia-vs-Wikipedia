// Similarity comparison engine

import { Article, Sentence, SentenceComparison, ComparisonResult, ComparisonSummary } from '@/types';
import { getEmbeddingsBatch } from './embeddings';
import { cosineSimilarity } from './utils';

const SIMILARITY_THRESHOLDS = {
  MATCH: 0.85,        // Green - exact or near-exact match
  PARAPHRASE: 0.60,   // Yellow - similar meaning
  UNIQUE: 0.60,       // Red - potential hallucination (below this)
};

/**
 * Compares two articles and identifies discrepancies
 */
export async function compareArticles(
  wikipedia: Article,
  grokipedia: Article
): Promise<ComparisonResult> {
  // Get embeddings for all sentences
  const wikiTexts = wikipedia.sentences.map(s => s.text);
  const grokTexts = grokipedia.sentences.map(s => s.text);
  
  console.log(`Computing embeddings for ${wikiTexts.length} Wikipedia sentences and ${grokTexts.length} Grokipedia sentences...`);
  
  const [wikiEmbeddings, grokEmbeddings] = await Promise.all([
    getEmbeddingsBatch(wikiTexts),
    getEmbeddingsBatch(grokTexts),
  ]);
  
  // Attach embeddings to sentences
  wikipedia.sentences.forEach((sentence, i) => {
    sentence.embedding = wikiEmbeddings[i];
  });
  
  grokipedia.sentences.forEach((sentence, i) => {
    sentence.embedding = grokEmbeddings[i];
  });
  
  // Compare each Grokipedia sentence with Wikipedia sentences
  const comparisons: SentenceComparison[] = grokipedia.sentences.map((grokSentence) => {
    if (!grokSentence.embedding || grokSentence.embedding.length === 0) {
      return {
        grokSentence,
        status: 'unique',
        similarity: 0,
      };
    }
    
    // Find best matching Wikipedia sentence
    let bestMatch: { wikiSentence: Sentence; similarity: number } | undefined;
    let maxSimilarity = -1;
    
    for (const wikiSentence of wikipedia.sentences) {
      if (!wikiSentence.embedding || wikiSentence.embedding.length === 0) {
        continue;
      }
      
      try {
        const similarity = cosineSimilarity(
          grokSentence.embedding,
          wikiSentence.embedding
        );
        
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestMatch = {
            wikiSentence,
            similarity,
          };
        }
      } catch (error) {
        // Skip this comparison if there's an error
        console.warn('Error calculating similarity:', error);
        continue;
      }
    }
    
    // Determine status based on similarity
    let status: SentenceComparison['status'];
    if (maxSimilarity >= SIMILARITY_THRESHOLDS.MATCH) {
      status = 'match';
    } else if (maxSimilarity >= SIMILARITY_THRESHOLDS.PARAPHRASE) {
      status = 'paraphrase';
    } else {
      status = 'unique';
    }
    
    return {
      grokSentence,
      bestMatch,
      status,
      similarity: maxSimilarity,
    };
  });
  
  // Generate summary
  const summary = generateSummary(comparisons);
  
  return {
    topic: grokipedia.title,
    wikipedia,
    grokipedia,
    comparisons,
    summary,
  };
}

/**
 * Generates a summary of the comparison
 */
function generateSummary(comparisons: SentenceComparison[]): ComparisonSummary {
  const matches = comparisons.filter(c => c.status === 'match').length;
  const paraphrases = comparisons.filter(c => c.status === 'paraphrase').length;
  const unique = comparisons.filter(c => c.status === 'unique').length;
  
  const potentialHallucinations = comparisons.filter(
    c => c.status === 'unique' && c.similarity < 0.3
  );
  
  return {
    totalGrokSentences: comparisons.length,
    matches,
    paraphrases,
    unique,
    missing: 0, // Could be calculated if we compare the other way
    potentialHallucinations,
  };
}

/**
 * Gets the color class for a comparison status
 */
export function getStatusColor(status: SentenceComparison['status']): string {
  switch (status) {
    case 'match':
      return 'bg-emerald-500/30 text-emerald-100 border-emerald-500/60';
    case 'paraphrase':
      return 'bg-amber-500/30 text-amber-100 border-amber-500/60';
    case 'unique':
      return 'bg-rose-500/30 text-rose-100 border-rose-500/60';
    case 'missing':
      return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    default:
      return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
  }
}

/**
 * Gets the similarity threshold label
 */
export function getSimilarityLabel(similarity: number): string {
  if (similarity >= SIMILARITY_THRESHOLDS.MATCH) {
    return 'Match';
  } else if (similarity >= SIMILARITY_THRESHOLDS.PARAPHRASE) {
    return 'Paraphrase';
  } else {
    return 'Unique/Hallucination';
  }
}

