import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sun,
  Moon,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Menu,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onToggleSidebar,
  onOpenAuth,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMute = () => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled });
  };

  return (
    <header className="h-14 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md px-4 flex items-center justify-between z-20">
      {/* Left: Mobile Sidebar Toggle + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
                {settings.assistantName || 'Nova'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40">
                {settings.personality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Voice Toggle */}
        <button
          onClick={toggleMute}
          title={settings.voiceEnabled ? 'Voice enabled (click to mute)' : 'Voice muted (click to enable)'}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          {settings.voiceEnabled ? (
            <Volume2 className="w-4 h-4 text-brand-500" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Assistant & Voice Settings"
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 dark:bg-dark-border mx-1" />

        {/* Auth status / Profile */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-1">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"
              title={`${user.name} (${user.email})`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
