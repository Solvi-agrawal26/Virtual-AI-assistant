export type PersonaType = 'general' | 'coding' | 'business' | 'academic' | 'creative' | 'custom';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AssistantSettings {
  id?: string;
  assistantName: string;
  personality: PersonaType;
  customSystemPrompt?: string | null;
  language: string;
  theme: 'dark' | 'light';
  voiceEnabled: boolean;
  autoSpeak: boolean;
  temperature: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  sources?: { title: string; url: string; snippet?: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User & { settings?: AssistantSettings };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
