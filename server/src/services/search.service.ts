import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

interface CacheEntry {
  results: SearchResultItem[];
  timestamp: number;
}

export class SearchService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

  /**
   * Search Google Custom Search, SerpAPI, or live web fallback
   */
  async search(query: string, num = 6): Promise<SearchResultItem[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const cacheKey = cleanQuery.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      logger.info(`Returning cached search results for: "${cleanQuery}"`);
      return cached.results;
    }

    let results: SearchResultItem[] = [];

    // 1. Try Google Custom Search JSON API if configured
    if (env.GOOGLE_API_KEY && env.GOOGLE_SEARCH_ENGINE_ID) {
      try {
        results = await this.searchGoogleCustom(cleanQuery, num);
      } catch (err) {
        logger.warn('Google Custom Search API error, falling back:', (err as Error).message);
      }
    }

    // 2. Try SerpAPI if Google CS API was not configured or failed
    if (results.length === 0 && env.SERPAPI_API_KEY) {
      try {
        results = await this.searchSerpApi(cleanQuery, num);
      } catch (err) {
        logger.warn('SerpAPI search error, falling back:', (err as Error).message);
      }
    }

    // 3. Fallback: Live Web & Knowledge Search (DuckDuckGo + Wikipedia Extracts)
    if (results.length === 0) {
      try {
        results = await this.searchLiveWebFallback(cleanQuery, num);
      } catch (err) {
        logger.error('Live web search fallback error:', (err as Error).message);
      }
    }

    if (results.length > 0) {
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now(),
      });
    }

    return results;
  }

  /**
   * Google Custom Search JSON API
   */
  private async searchGoogleCustom(query: string, num: number): Promise<SearchResultItem[]> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(
      env.GOOGLE_API_KEY
    )}&cx=${encodeURIComponent(env.GOOGLE_SEARCH_ENGINE_ID)}&q=${encodeURIComponent(
      query
    )}&num=${Math.min(num, 10)}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.link || '',
      snippet: item.snippet || '',
    }));
  }

  /**
   * SerpAPI fallback
   */
  private async searchSerpApi(query: string, num: number): Promise<SearchResultItem[]> {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&api_key=${encodeURIComponent(env.SERPAPI_API_KEY)}&num=${num}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI status ${response.status}`);
    }

    const data = await response.json();
    if (!data.organic_results || !Array.isArray(data.organic_results)) {
      return [];
    }

    return data.organic_results.slice(0, num).map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.link || '',
      snippet: item.snippet || '',
    }));
  }

  /**
   * Live Web Search Fallback with Wikipedia knowledge extracts
   */
  private async searchLiveWebFallback(query: string, num: number): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];
    const userAgent = 'NovaAIAssistant/1.0 (https://nova.ai; contact@nova.ai)';

    // Step 1: Clean search keywords for knowledge retrieval
    const cleanQuery = query.replace(/[?.,!]/g, '').trim();
    const searchKeywords =
      cleanQuery
        .replace(/^(what|who|where|when|why|how)\s+(is|are|was|were|do|does|did|can|could)\s+(the\s+)?/i, '')
        .trim() || cleanQuery;

    // Step 2: Query Wikipedia OpenSearch & Summaries
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        searchKeywords
      )}&limit=${num}&namespace=0&format=json`;

      const wikiRes = await fetch(wikiUrl, {
        headers: { 'User-Agent': userAgent },
      });

      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const titles: string[] = wikiData[1] || [];
        const descriptions: string[] = wikiData[2] || [];
        const urls: string[] = wikiData[3] || [];

        for (let i = 0; i < titles.length && results.length < num; i++) {
          let snippet = descriptions[i] || '';

          // Fetch full summary extract for rich answer grounding
          if (titles[i]) {
            try {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[i])}`,
                { headers: { 'User-Agent': userAgent } }
              );
              if (summaryRes.ok) {
                const summaryData: any = await summaryRes.json();
                if (summaryData.extract) {
                  snippet = summaryData.extract;
                }
              }
            } catch {
              // Ignore summary fetch failures
            }
          }

          if (titles[i] && urls[i]) {
            results.push({
              title: titles[i],
              url: urls[i],
              snippet: snippet || `Encyclopedic information regarding ${titles[i]}`,
            });
          }
        }
      }
    } catch (err) {
      logger.warn('Wikipedia fallback error:', (err as Error).message);
    }

    // Step 3: Also try DuckDuckGo HTML for web links
    if (results.length < num) {
      try {
        const ddgRes = await fetch(
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          }
        );

        if (ddgRes.ok) {
          const html = await ddgRes.text();
          const resultBlocks = html.split('<div class="result results_links results_links_deep');

          for (let i = 1; i < resultBlocks.length && results.length < num; i++) {
            const block = resultBlocks[i];
            const linkMatch = block.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
            const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

            if (linkMatch) {
              let cleanUrl = linkMatch[1];
              const uddgMatch = cleanUrl.match(/uddg=([^&]+)/);
              if (uddgMatch) {
                cleanUrl = decodeURIComponent(uddgMatch[1]);
              }

              const rawTitle = linkMatch[2].replace(/<[^>]+>/g, '').trim();
              const rawSnippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

              if (cleanUrl.startsWith('http') && rawTitle && !results.some((r) => r.url === cleanUrl)) {
                results.push({
                  title: rawTitle,
                  url: cleanUrl,
                  snippet: rawSnippet,
                });
              }
            }
          }
        }
      } catch {
        // Ignore DDG failures
      }
    }

    return results;
  }
}

export const searchService = new SearchService();
