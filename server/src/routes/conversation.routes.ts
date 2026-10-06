import { Router } from 'express';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/conversation.controller';
import { getMessages, deleteMessage } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createConversationSchema, updateConversationSchema } from '../validators/chat.validator';

const router = Router();

// Conversation endpoints
router.get('/', authenticate, listConversations);
router.post('/', authenticate, validateRequest({ body: createConversationSchema }), createConversation);
router.get('/:id', authenticate, getConversation);
router.patch('/:id', authenticate, validateRequest({ body: updateConversationSchema }), updateConversation);
router.delete('/:id', authenticate, deleteConversation);

// Nested messages endpoints
router.get('/:conversationId/messages', authenticate, getMessages);
router.delete('/messages/:id', authenticate, deleteMessage);

export default router;
