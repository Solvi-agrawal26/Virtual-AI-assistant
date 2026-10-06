import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '../types';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  isLoadingConversations: boolean;
  isStreaming: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectConversation: (id: string) => Promise<void>;
  startNewChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch conversations when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refreshConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  const refreshConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await api.get<{ success: boolean; data: { conversations: Conversation[] } }>(
        `/conversations${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`
      );
      if (res.success && res.data.conversations) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Re-filter when search query changes
  useEffect(() => {
    if (isAuthenticated) {
      const delay = setTimeout(() => {
        refreshConversations();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [searchQuery]);

  const selectConversation = async (id: string) => {
    if (activeConversation?.id === id) return;

    try {
      setIsLoadingMessages(true);
      const res = await api.get<{ success: boolean; data: { conversation: Conversation } }>(
        `/conversations/${id}`
      );
      if (res.success && res.data.conversation) {
        setActiveConversation(res.data.conversation);
        setMessages(res.data.conversation.messages || []);
      }
    } catch (err) {
      console.error('Failed to select conversation:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const startNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    if (isStreaming) {
      stopStreaming();
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const tempAssistantMsgId = `temp-assistant-${Date.now()}`;

    const userMessage: Message = {
      id: tempUserMsgId,
      conversationId: activeConversation?.id || '',
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const initialAssistantMsg: Message = {
      id: tempAssistantMsgId,
      conversationId: activeConversation?.id || '',
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
      sources: [],
    };

    // Optimistically update message state
    setMessages((prev) => [...prev, userMessage, initialAssistantMsg]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    let fullGeneratedText = '';
    let currentSources: { title: string; url: string; snippet?: string }[] = [];

    await api.streamChat(
      {
        conversationId: activeConversation?.id,
        message: content.trim(),
      },
      {
        onStart: (data) => {
          if (!activeConversation) {
            const newConv: Conversation = {
              id: data.conversationId,
              title: data.title || content.slice(0, 30),
              userId: '',
              pinned: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setActiveConversation(newConv);
            setConversations((prev) => [newConv, ...prev]);
          }
        },
        onSources: (sources) => {
          currentSources = sources;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId
                ? { ...msg, sources }
                : msg
            )
          );
        },
        onChunk: (chunk) => {
          fullGeneratedText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId
                ? { ...msg, content: fullGeneratedText, sources: currentSources }
                : msg
            )
          );
        },
        onDone: (data) => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId
                ? {
                    ...msg,
                    id: data.messageId,
                    content: data.fullText,
                    isStreaming: false,
                  }
                : msg
            )
          );

          // Update conversation in sidebar list
          refreshConversations();

          // Auto speak replies if enabled
          if (settings.voiceEnabled && settings.autoSpeak) {
            speechService.speak(data.fullText);
          }
        },
        onError: (errMessage) => {
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantMsgId
                ? {
                    ...msg,
                    content:
                      fullGeneratedText ||
                      `⚠️ *An error occurred: ${errMessage}*`,
                    isStreaming: false,
                  }
                : msg
            )
          );
        },
      },
      abortControllerRef.current.signal
    );
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    speechService.stopSpeaking();
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await api.patch(`/conversations/${id}`, { title: newTitle.trim() });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
      );
      if (activeConversation?.id === id) {
        setActiveConversation((prev) => (prev ? { ...prev, title: newTitle.trim() } : null));
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingMessages,
        isLoadingConversations,
        isStreaming,
        searchQuery,
        setSearchQuery,
        selectConversation,
        startNewChat,
        sendMessage,
        stopStreaming,
        renameConversation,
        deleteConversation,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
