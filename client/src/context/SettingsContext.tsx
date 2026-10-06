import React, { createContext, useContext, useState, useEffect } from 'react';
import { AssistantSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AssistantSettings;
  updateSettings: (newSettings: Partial<AssistantSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: AssistantSettings = {
  assistantName: 'Nova',
  personality: 'general',
  customSystemPrompt: '',
  language: 'en',
  theme: 'dark',
  voiceEnabled: true,
  autoSpeak: false,
  temperature: 0.7,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [settings, setSettings] = useState<AssistantSettings>(user?.settings || defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    } else if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, user]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; data: { settings: AssistantSettings } }>('/user/settings');
      if (res.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AssistantSettings>) => {
    // Optimistic UI update
    setSettings((prev) => ({ ...prev, ...newSettings }));

    if (isAuthenticated) {
      try {
        const res = await api.patch<{ success: boolean; data: { settings: AssistantSettings } }>(
          '/user/settings',
          newSettings
        );
        if (res.success && res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
