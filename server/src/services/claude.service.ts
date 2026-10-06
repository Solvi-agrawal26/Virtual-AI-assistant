import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { ChatMessageContext, AssistantPersona } from '../types';
import { searchService, SearchResultItem } from './search.service';
import { llmService } from './llm.service';

export interface ClaudeStreamOptions {
  assistantName?: string;
  personality?: AssistantPersona | string;
  customSystemPrompt?: string | null;
  language?: string;
  temperature?: number;
  enableWebSearch?: boolean;
}

export class ClaudeService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.trim() !== '') {
      try {
        this.anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });
        logger.info('Anthropic Claude SDK initialized successfully');
      } catch (err) {
        logger.error('Failed to initialize Anthropic client', err);
      }
    }
  }

  private buildSystemPrompt(options?: ClaudeStreamOptions, searchResults?: SearchResultItem[]): string {
    const name = options?.assistantName || 'Nova';
    const personality = options?.personality || 'general';
    const lang = options?.language || 'en';

    const personaInstructions: Record<string, string> = {
      general: 'You are an accurate, intelligent AI assistant connected to live Google search. Deliver clear, well-structured, and helpful answers.',
      coding: 'You are an elite Senior Staff Software Engineer and Architect. Provide elegant, production-grade, bug-free code with clear comments, architectural best practices, and security considerations.',
      business: 'You are an executive business consultant and startup advisor. Structure insights using crisp bullet points, frameworks, ROI trade-offs, and strategic action plans.',
      academic: 'You are a patient university professor and scientific researcher. Explain complex concepts intuitively, break down fundamentals, and encourage deep critical reasoning.',
      creative: 'You are an award-winning creative writer, copywriter, and brainstorming muse. Write with captivating style, vivid imagery, and engaging rhythm.',
      custom: options?.customSystemPrompt || 'You are an adaptive AI assistant.',
    };

    const selectedInstruction = personaInstructions[personality] || personaInstructions.general;

    let searchContext = '';
    if (searchResults && searchResults.length > 0) {
      searchContext = `\n\nLIVE SEARCH RESULTS:\n` + searchResults
        .map((r, i) => `[Source ${i + 1}] Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
        .join('\n\n') +
        `\n\nInstructions: Answer the user's question using the search results above. Be accurate and clear. Cite sources with numbers like [1], [2] where appropriate. If the results do not contain the answer, say so.`;
    }

    return `Your name is ${name}.
${selectedInstruction}
${searchContext}

Guidelines:
- Language: Output your responses primarily in ${lang === 'en' ? 'English' : lang} unless explicitly addressed in another language.
- Format: Use Markdown extensively (bolding, headers, lists, code fences with language tags).
- Tone: Helpful, articulate, proactive, and respectful.
- Safety: Maintain high standards of security, privacy, and truthfulness.`;
  }

  /**
   * Stream responses token-by-token with live Google Search grounding
   */
  async streamResponse(
    messages: ChatMessageContext[],
    options: ClaudeStreamOptions,
    onChunk: (text: string) => void,
    onDone: (fullText: string) => void,
    onError: (err: Error) => void,
    onSources?: (sources: { title: string; url: string; snippet?: string }[]) => void
  ) {
    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // 1. Fetch live Google search results
    let searchResults: SearchResultItem[] = [];
    try {
      if (lastUserMsg.trim().length > 2) {
        searchResults = await searchService.search(lastUserMsg, 6);
        if (searchResults.length > 0 && onSources) {
          onSources(searchResults);
        }
      }
    } catch (e) {
      logger.warn('Search lookup warning:', (e as Error).message);
    }

    const systemPrompt = this.buildSystemPrompt(options, searchResults);

    // If Anthropic Claude API key is configured, stream directly via Anthropic SDK
    if (this.anthropic) {
      try {
        const sanitizedMessages = messages
          .filter((m) => m.content && m.content.trim() !== '')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        if (sanitizedMessages.length > 0 && sanitizedMessages[0].role !== 'user') {
          sanitizedMessages.shift();
        }

        let fullResponse = '';

        const stream = await this.anthropic.messages.stream({
          model: env.ANTHROPIC_MODEL,
          max_tokens: 4096,
          temperature: options.temperature ?? 0.7,
          system: systemPrompt,
          messages: sanitizedMessages,
        });

        stream.on('text', (deltaText) => {
          fullResponse += deltaText;
          onChunk(deltaText);
        });

        stream.on('end', () => {
          onDone(fullResponse);
        });

        stream.on('error', (error) => {
          logger.error('Claude API Stream Error:', error);
          onError(error);
        });
        return;
      } catch (error) {
        logger.error('Claude Service Execution Error, falling back to multi-provider:', error);
      }
    }

    // Fallback: If Anthropic key is not present or failed, synthesize response using live search results & LLM
    try {
      const response = await llmService.answerWithSearch(lastUserMsg, searchResults, {
        assistantName: options.assistantName,
        personality: options.personality,
      });

      // Stream the generated answer token-by-token for a smooth reading experience
      const words = response.answer.split(' ');
      let accumulated = '';

      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        accumulated += chunk;
        onChunk(chunk);
        await new Promise((r) => setTimeout(r, 18));
      }

      onDone(accumulated);
    } catch (err) {
      logger.error('Streaming fallback error:', err);
      onError(err as Error);
    }
  }
}

export const claudeService = new ClaudeService();
