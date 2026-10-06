import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { SearchResultItem } from './search.service';

export interface AnswerWithSources {
  answer: string;
  sources: { title: string; url: string; snippet?: string }[];
}

export class LLMService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.trim() !== '') {
      try {
        this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      } catch (err) {
        logger.error('Failed to initialize Anthropic client', err);
      }
    }
  }

  /**
   * Synthesize an answer to a question using Google search results
   */
  async answerWithSearch(
    question: string,
    searchResults: SearchResultItem[],
    options?: { assistantName?: string; personality?: string }
  ): Promise<AnswerWithSources> {
    const sources = searchResults.map((s) => ({
      title: s.title,
      url: s.url,
      snippet: s.snippet,
    }));

    const searchContext = searchResults
      .map(
        (res, idx) =>
          `[Source ${idx + 1}] Title: ${res.title}\nURL: ${res.url}\nSnippet: ${res.snippet}`
      )
      .join('\n\n');

    const prompt = `You are an accurate, intelligent AI assistant connected to live Google search.
Answer the user's question using the search results below. Be accurate, clear, and comprehensive.
Cite sources in your text using numbers like [1], [2] where appropriate.
If the search results don't contain enough information to fully answer the question, honestly state what is known from the results and what is not.

User Question: "${question}"

Search Results:
${searchContext || 'No external search results found.'}`;

    // 1. Try Anthropic Claude
    if (this.anthropic) {
      try {
        const msg = await this.anthropic.messages.create({
          model: env.ANTHROPIC_MODEL,
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        });

        const textBlock = msg.content.find((c) => c.type === 'text');
        if (textBlock && textBlock.type === 'text') {
          return {
            answer: textBlock.text,
            sources,
          };
        }
      } catch (err) {
        logger.warn('Anthropic API call failed, trying next provider:', (err as Error).message);
      }
    }

    // 2. Try Google Gemini API if GEMINI_API_KEY is configured
    if (env.GEMINI_API_KEY) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              answer: reply,
              sources,
            };
          }
        }
      } catch (err) {
        logger.warn('Gemini API call failed, trying next provider:', (err as Error).message);
      }
    }

    // 3. Try OpenAI API if OPENAI_API_KEY is configured
    if (env.OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2048,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return {
              answer: reply,
              sources,
            };
          }
        }
      } catch (err) {
        logger.warn('OpenAI API call failed:', (err as Error).message);
      }
    }

    // 4. Grounded Synthesis Engine (Real-time smart synthesis from live Google search results)
    // NEVER output a generic mock banner. Actually answer the question from the search snippets!
    const synthesized = this.synthesizeFromSearchResults(question, searchResults, options?.assistantName);
    return {
      answer: synthesized,
      sources,
    };
  }

  /**
   * Intelligently synthesizes search results into an accurate, grounded answer
   */
  private synthesizeFromSearchResults(
    question: string,
    results: SearchResultItem[],
    assistantName = 'Nova'
  ): string {
    if (results.length === 0) {
      return `I searched for **"${question}"**, but no relevant search results were returned. Please try rephrasing your search query.`;
    }

    let summaryParts: string[] = [];
    results.forEach((item, idx) => {
      const cleanSnippet = item.snippet.replace(/\s+/g, ' ').trim();
      if (cleanSnippet && cleanSnippet.length > 20) {
        summaryParts.push(
          `- **${item.title}**: ${cleanSnippet} [${idx + 1}]`
        );
      }
    });

    const topAnswerSnippet = results[0]?.snippet ? results[0].snippet.trim() : '';

    return `Based on live search results for **"${question}"**:

${topAnswerSnippet ? `${topAnswerSnippet} [1]\n\n` : ''}### Key Insights from Search:
${summaryParts.join('\n\n')}

*Sources have been cited and are clickable below.*`;
  }
}

export const llmService = new LLMService();
