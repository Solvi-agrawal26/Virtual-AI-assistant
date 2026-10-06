import { Router } from 'express';
import { askQuestion } from '../controllers/ask.controller';
import { chatLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Endpoint: POST /api/ask or /api/v1/ask
router.post('/', chatLimiter, askQuestion);

export default router;
