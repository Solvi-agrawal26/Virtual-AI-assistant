import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(100),
  pinned: z.boolean().optional(),
});

export const streamChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(8000, 'Message cannot exceed 8,000 characters'),
});
