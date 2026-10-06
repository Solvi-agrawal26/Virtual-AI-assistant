const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_BASE = envUrl ? (envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`) : '/api/v1';

class ApiService {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('access_token');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle token expiration & auto-refresh
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || 'API request failed');
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        this.setAccessToken(null);
        return false;
      }

      const data = await res.json();
      if (data.data?.tokens?.accessToken) {
        this.setAccessToken(data.data.tokens.accessToken);
        return true;
      }
      return false;
    } catch {
      this.setAccessToken(null);
      return false;
    }
  }

  // REST wrappers
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Ask question endpoint calling POST /api/ask with live Google search
   */
  async ask(question: string) {
    return this.request<{
      success: boolean;
      answer: string;
      sources: { title: string; url: string }[];
    }>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  /**
   * Stream chat endpoint using Fetch and SSE ReadableStream
   */
  async streamChat(
    payload: { conversationId?: string; message: string },
    callbacks: {
      onStart: (data: { conversationId: string; userMessageId: string; title?: string }) => void;
      onChunk: (chunk: string) => void;
      onSources?: (sources: { title: string; url: string; snippet?: string }[]) => void;
      onDone: (data: { messageId: string; fullText: string }) => void;
      onError: (error: string) => void;
    },
    signal?: AbortSignal
  ) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Chat stream failed to start');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported by browser');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.replace('data: ', '');
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'start') {
                callbacks.onStart(event);
              } else if (event.type === 'sources' && event.sources) {
                callbacks.onSources?.(event.sources);
              } else if (event.type === 'chunk' && event.text) {
                callbacks.onChunk(event.text);
              } else if (event.type === 'done') {
                callbacks.onDone(event);
              } else if (event.type === 'error') {
                callbacks.onError(event.error || 'Stream error occurred');
              }
            } catch (err) {
              console.warn('Failed to parse SSE payload', err);
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        callbacks.onError('Generation cancelled');
      } else {
        callbacks.onError((err as Error).message || 'Connection lost');
      }
    }
  }
}

export const api = new ApiService();
