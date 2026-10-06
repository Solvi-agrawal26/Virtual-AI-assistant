import React, { useState } from 'react';
import { Navbar } from '../layout/Navbar';
import { Sidebar } from '../layout/Sidebar';
import { ChatArea } from './ChatArea';
import { ChatInput } from './ChatInput';
import { SettingsModal } from '../settings/SettingsModal';
import { AuthModal } from '../auth/AuthModal';
import { useChat } from '../../context/ChatContext';

export const ChatContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const { sendMessage } = useChat();

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Flow */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Message Stream Body */}
        <ChatArea onSelectPrompt={handleSelectPrompt} />

        {/* Chat Input Floating Container */}
        <ChatInput inputVal={inputVal} setInputVal={setInputVal} />
      </div>

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Auth Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};
