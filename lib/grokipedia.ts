// Grokipedia scraper

import { Article, Sentence } from '@/types';
import { normalizeText, splitIntoSentences } from './utils';
import * as cheerio from 'cheerio';

const GROKIPEDIA_BASE_URL = 'https://grokipedia.com';

/**
 * Converts a topic to title case (first letter uppercase, rest lowercase)
 */
function toTitleCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Extracts content from a successful Grokipedia response
 */
async function extractContentFromResponse(
  response: Response,
  url: string,
  topic: string
): Promise<Article> {
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Remove unwanted elements first
  $('script, style, nav, header, footer, .sidebar, .menu, .search, button, .toggle').remove();
  
  // Extract main content - try multiple selectors based on Grokipedia structure
  const contentSelectors = [
    'main article',
    'main',
    'article',
    '[role="main"]',
    '.prose',
    '.content',
    '.article-content',
    '#content',
    '.main-content',
    'div[class*="content"]',
  ];
  
  let content = '';
  let contentElement = null;
  
  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length > 0 && element.text().trim().length > 100) {
      contentElement = element;
      content = element.text();
      break;
    }
  }
  
  // If no specific content found, try to find the main text container
  if (!content || content.length < 100) {
    // Look for the largest text block (likely the main content)
    let maxLength = 0;
    $('div, section, article').each((_, elem) => {
      const text = $(elem).text().trim();
      // Skip if it's too short or contains mostly navigation
      if (text.length > maxLength && text.length > 200 && !$(elem).hasClass('nav')) {
        maxLength = text.length;
        contentElement = $(elem);
        content = text;
      }
    });
  }
  
  // Fallback: extract from body, removing navigation and UI elements
  if (!content || content.length < 100) {
    // Remove common UI elements
    $('nav, header, footer, .sidebar, .menu, .search, button, .toggle, .edit, .history').remove();
    // Get text from body but exclude very short paragraphs (likely UI elements)
    const paragraphs: string[] = [];
    $('body p, body div, body section').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 50) { // Only include substantial paragraphs
        paragraphs.push(text);
      }
    });
    content = paragraphs.join(' ');
  }
  
  // Clean up the content
  content = content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\[edit\]/gi, '') // Remove edit links
    .replace(/\[source\]/gi, '') // Remove source links
    .trim();
  
  if (!content || content.length < 50) {
    throw new Error(`Could not extract meaningful content from Grokipedia page for: ${topic}`);
  }
  
  const normalizedContent = normalizeText(content);
  const sentences = splitIntoSentences(normalizedContent);
  
  if (sentences.length === 0) {
    throw new Error(`No sentences extracted from Grokipedia content for: ${topic}`);
  }
  
  // Try to extract title - look for h1 or main heading
  let title = topic;
  const titleSelectors = ['h1', '.title', '.article-title', '[class*="title"]', 'main h1'];
  for (const selector of titleSelectors) {
    const titleElement = $(selector).first();
    if (titleElement.length > 0) {
      const titleText = titleElement.text().trim();
      if (titleText && titleText.length > 0) {
        title = titleText;
        break;
      }
    }
  }
  
  return {
    title,
    content: normalizedContent,
    url,
    sentences: sentences.map((text, index) => ({
      text,
      index,
    })),
  };
}

/**
 * Fetches a Grokipedia article by topic
 * URL format: https://grokipedia.com/page/{topic}
 * Note: Grokipedia URLs are case-sensitive (e.g., "Akbar" not "akbar")
 */
export async function fetchGrokipediaArticle(topic: string): Promise<Article> {
  // Try multiple URL formats - Grokipedia is case-sensitive
  // Try: original, Title Case, and just capitalize first letter
  const urlVariants = [
    topic, // Original case
    toTitleCase(topic), // Title case (first letter uppercase, rest lowercase)
    topic.charAt(0).toUpperCase() + topic.slice(1), // Capitalize first letter only, preserve rest
  ];
  
  // Remove duplicates
  const uniqueVariants = [...new Set(urlVariants)];
  
  let lastError: Error | null = null;
  
  for (const variant of uniqueVariants) {
    try {
      const url = `${GROKIPEDIA_BASE_URL}/page/${encodeURIComponent(variant)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (response.ok) {
        // Success! Use this URL and continue
        console.log(`✓ Grokipedia found with variant: "${variant}" at ${url}`);
        return await extractContentFromResponse(response, url, variant);
      } else if (response.status === 404) {
        // Try next variant
        console.log(`✗ Grokipedia 404 for variant: "${variant}"`);
        lastError = new Error(`Grokipedia page not found: ${variant} (Status: 404)`);
        continue;
      } else {
        // Other error, throw immediately
        throw new Error(`Grokipedia fetch failed: ${variant} (Status: ${response.status})`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Status: 404')) {
        lastError = error;
        continue; // Try next variant
      }
      // Network or other errors, rethrow
      throw error;
    }
  }
  
  // All variants failed
  throw lastError || new Error(`Grokipedia page not found for any variant of: ${topic}`);
}

/**
 * Alternative: Fetch from DKG if Knowledge Assets are available
 * This would be used if Umanitek has published Grokipedia extracts to DKG
 */
export async function fetchGrokipediaFromDKG(ual: string): Promise<Article | null> {
  // TODO: Implement DKG lookup if Knowledge Assets are available
  // This would use dkg.js to query the DKG for the asset
  return null;
}
