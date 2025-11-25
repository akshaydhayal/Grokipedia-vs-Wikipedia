// Core types for the application

export interface Article {
  title: string;
  content: string;
  url: string;
  sections?: Section[];
  sentences: Sentence[];
}

export interface Section {
  title: string;
  content: string;
  level: number;
}

export interface Sentence {
  text: string;
  index: number;
  section?: string;
  embedding?: number[];
}

export interface ComparisonResult {
  topic: string;
  wikipedia: Article;
  grokipedia: Article;
  comparisons: SentenceComparison[];
  summary: ComparisonSummary;
}

export interface SentenceComparison {
  grokSentence: Sentence;
  bestMatch?: {
    wikiSentence: Sentence;
    similarity: number;
  };
  status: 'match' | 'paraphrase' | 'unique' | 'missing';
  similarity: number;
}

export interface ComparisonSummary {
  totalGrokSentences: number;
  matches: number;
  paraphrases: number;
  unique: number;
  missing: number;
  potentialHallucinations: SentenceComparison[];
}

export interface CommunityNote {
  '@context': string;
  '@type': string;
  name: string;
  about: string;
  author?: string;
  published: string;
  summary: string;
  discrepancies: Discrepancy[];
  relatedUALs?: string[];
}

export interface Discrepancy {
  id: string;
  grok_sentence: string;
  wiki_sentence?: string;
  similarity_score: number;
  evidence: string[];
  note: string;
  status: 'hallucination' | 'bias' | 'missing_context' | 'factual_inconsistency';
}

export interface PublishResult {
  success: boolean;
  ual?: string;
  error?: string;
  jsonld?: CommunityNote;
}

