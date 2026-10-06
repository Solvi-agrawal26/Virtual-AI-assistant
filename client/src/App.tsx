import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ChatProvider } from './context/ChatContext';
import { ChatContainer } from './components/chat/ChatContainer';
import { AuthPage } from './components/auth/AuthPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B0F19] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 animate-pulse flex items-center justify-center text-xl font-bold shadow-lg shadow-brand-500/30">
            ✨
          </div>
          <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading Nova AI...
          </span>
        </div>
      </div>
    );
  }

  // If not signed in and hasn't chosen guest mode, show the Sign In / Login page
  if (!isAuthenticated && !isGuest) {
    return <AuthPage onContinueGuest={() => setIsGuest(true)} />;
  }

  // Once authenticated or guest mode chosen, show the Chat Dashboard
  return <ChatContainer />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
