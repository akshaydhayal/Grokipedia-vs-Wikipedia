// Wikipedia API client

import { Article, Sentence } from '@/types';
import { normalizeText, splitIntoSentences, extractMainContent } from './utils';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1';

export interface WikipediaPage {
  title: string;
  extract: string;
  content_urls: {
    desktop: {
      page: string;
    };
  };
}

/**
 * Fetches a Wikipedia article by title
 */
export async function fetchWikipediaArticle(topic: string): Promise<Article> {
  try {
    // Use the REST API for cleaner content
    const response = await fetch(
      `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(topic)}`
    );
    
    if (!response.ok) {
      // Try to get the full page content if summary fails
      return await fetchWikipediaFullPage(topic);
    }
    
    const data: WikipediaPage = await response.json();
    
    // Get full page content for better comparison
    const fullContent = await fetchWikipediaFullPageContent(topic);
    const content = fullContent || data.extract;
    
    const sentences = splitIntoSentences(normalizeText(content));
    
    return {
      title: data.title,
      content: normalizeText(content),
      url: data.content_urls.desktop.page,
      sentences: sentences.map((text, index) => ({
        text,
        index,
      })),
    };
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    throw new Error(`Failed to fetch Wikipedia article: ${error}`);
  }
}

/**
 * Fetches full Wikipedia page content
 */
async function fetchWikipediaFullPage(topic: string): Promise<Article> {
  const response = await fetch(
    `${WIKIPEDIA_API_URL}/page/html/${encodeURIComponent(topic)}`
  );
  
  if (!response.ok) {
    throw new Error(`Wikipedia page not found: ${topic}`);
  }
  
  const html = await response.text();
  const content = extractMainContent(html);
  const sentences = splitIntoSentences(content);
  
  return {
    title: topic,
    content,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`,
    sentences: sentences.map((text, index) => ({
      text,
      index,
    })),
  };
}

/**
 * Fetches full page content as plain text
 */
async function fetchWikipediaFullPageContent(topic: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(topic)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.extract || null;
  } catch {
    return null;
  }
}

/**
 * Searches Wikipedia for a topic (useful for finding exact article title)
 */
export async function searchWikipedia(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    
    const data = await response.json();
    return data.query?.search?.map((item: any) => item.title) || [];
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return [];
  }
}

