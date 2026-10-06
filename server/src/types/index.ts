import { Request } from 'express';
import { TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export type AssistantPersona = 'general' | 'coding' | 'business' | 'academic' | 'creative' | 'custom';

export interface ChatStreamChunk {
  type: 'chunk' | 'done' | 'error' | 'title';
  text?: string;
  messageId?: string;
  error?: string;
  title?: string;
}

export interface ChatMessageContext {
  role: 'user' | 'assistant';
  content: string;
}
