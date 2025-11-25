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
 * Uses Wikipedia REST API HTML endpoint to get full article content
 */
export async function fetchWikipediaArticle(topic: string): Promise<Article> {
  try {
    // Use the REST API HTML endpoint which gives us the full article
    const htmlResponse = await fetch(
      `${WIKIPEDIA_API_URL}/page/html/${encodeURIComponent(topic)}`
    );
    
    if (!htmlResponse.ok) {
      // If HTML endpoint fails, try the summary as fallback
      console.warn(`Wikipedia HTML endpoint failed for ${topic}, trying summary...`);
      return await fetchWikipediaSummary(topic);
    }
    
    const html = await htmlResponse.text();
    
    // Get the title from the HTML or use the topic
    let title = topic;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\s*-\s*Wikipedia.*$/i, '').trim();
    }
    
    // Extract main content from HTML
    const content = extractMainContent(html);
    
    if (!content || content.length < 100) {
      // Fallback to summary if content extraction fails
      console.warn(`Wikipedia content extraction too short for ${topic}, trying summary...`);
      return await fetchWikipediaSummary(topic);
    }
    
    // Clean up the content
    const cleanedContent = content
      .replace(/\[\d+\]/g, '') // Remove reference markers like [1], [2]
      .replace(/\[citation needed\]/gi, '') // Remove citation needed markers
      .replace(/\[edit\]/gi, '') // Remove edit links
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();
    
    if (!cleanedContent || cleanedContent.length < 50) {
      throw new Error(`No meaningful content extracted from Wikipedia article: ${topic}`);
    }
    
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const sentences = splitIntoSentences(normalizeText(cleanedContent));
    
    if (sentences.length === 0) {
      throw new Error(`No sentences extracted from Wikipedia article: ${topic}`);
    }
    
    console.log(`✓ Wikipedia fetched: ${sentences.length} sentences, ${cleanedContent.length} chars`);
    
    return {
      title,
      content: normalizeText(cleanedContent),
      url,
      sentences: sentences.map((text, index) => ({
        text,
        index,
      })),
    };
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    // Fallback to summary method
    try {
      console.log('Trying Wikipedia summary fallback...');
      return await fetchWikipediaSummary(topic);
    } catch (fallbackError) {
      throw new Error(`Failed to fetch Wikipedia article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Fallback: Fetch Wikipedia summary (short extract)
 */
async function fetchWikipediaSummary(topic: string): Promise<Article> {
  const response = await fetch(
    `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(topic)}`
  );
  
  if (!response.ok) {
    throw new Error(`Wikipedia page not found: ${topic}`);
  }
  
  const data: WikipediaPage = await response.json();
  const content = data.extract;
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

