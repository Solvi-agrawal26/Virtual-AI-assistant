import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AssistantSettings, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: (User & { settings?: AssistantSettings }) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { settings?: AssistantSettings }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get<{ success: boolean; data: { user: User & { settings?: AssistantSettings } } }>('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
      api.setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    if (res.success && res.data) {
      api.setAccessToken(res.data.tokens.accessToken);
      setUser(res.data.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
    if (res.success && res.data) {
      api.setAccessToken(res.data.tokens.accessToken);
      setUser(res.data.user);
    }
  };

  const demoLogin = async () => {
    const res = await api.post<AuthResponse>('/auth/demo');
    if (res.success && res.data) {
      api.setAccessToken(res.data.tokens.accessToken);
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      api.setAccessToken(null);
      setUser(null);
    }
  };

  const updateUserContext = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
