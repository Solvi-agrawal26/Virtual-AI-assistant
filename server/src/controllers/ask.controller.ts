import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { searchService } from '../services/search.service';
import { llmService } from '../services/llm.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export const askSchema = z.object({
  question: z
    .string()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question is too long (max 1000 chars)'),
  numResults: z.number().min(1).max(10).optional().default(6),
});

export const askQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, numResults } = askSchema.parse(req.body);

    logger.info(`Processing ask request: "${question}"`);

    // 1. Fetch search results from Google / SerpAPI / Live web
    const searchResults = await searchService.search(question, numResults);

    // 2. Synthesize answer with LLM using instructions and search results
    const response = await llmService.answerWithSearch(question, searchResults);

    res.status(200).json({
      success: true,
      answer: response.answer,
      sources: response.sources.map((s) => ({
        title: s.title,
        url: s.url,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(AppError.badRequest(error.errors.map((e) => e.message).join(', ')));
    }
    logger.error('Error handling /ask question:', error);
    next(error);
  }
};
