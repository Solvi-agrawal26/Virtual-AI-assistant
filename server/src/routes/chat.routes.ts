import { Router } from 'express';
import { streamChat } from '../controllers/chat.controller';
import { authenticateWithGuestFallback } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { chatLimiter } from '../middlewares/rateLimiter.middleware';
import { streamChatSchema } from '../validators/chat.validator';

const router = Router();

// Streaming chat endpoint with SSE (supports authenticated users & guest search)
router.post('/stream', authenticateWithGuestFallback, chatLimiter, validateRequest({ body: streamChatSchema }), streamChat);

export default router;
