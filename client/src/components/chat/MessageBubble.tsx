import React, { useState } from 'react';
import { Message } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';
import { speechService } from '../../services/speech';
import { useSettings } from '../../context/SettingsContext';
import { Copy, Check, Volume2, VolumeX, Bot, User as UserIcon, Globe, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechService.speak(message.content, {
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group flex gap-4 px-4 py-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-gray-100/60 dark:bg-[#111827]/60 border-y border-gray-100 dark:border-dark-border/40'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-brand-500/20">
            <UserIcon className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-brand-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-400/30">
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content & Action Bar */}
      <div className="flex-1 min-w-0 max-w-3xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : settings.assistantName || 'Nova'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(message.createdAt)}
            </span>
          </div>

          {/* Quick Actions (Copy & Read Aloud) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy message"
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {!isUser && settings.voiceEnabled && (
              <button
                onClick={handleToggleSpeak}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                className={`p-1 rounded-md transition-colors ${
                  isSpeaking
                    ? 'text-brand-500 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                }`}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 animate-pulse text-brand-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bubble body */}
        <div className="text-gray-800 dark:text-gray-200">
          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : message.isStreaming ? (
            <TypingIndicator />
          ) : (
            <span className="text-gray-400 italic text-sm">Empty message</span>
          )}

          {/* Active streaming blinking cursor */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1 align-middle bg-brand-500 animate-pulse" />
          )}

          {/* Clickable Google Search Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-dark-border/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                <Globe className="w-3.5 h-3.5 text-brand-500" />
                <span>Sources & Citations ({message.sources.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-gray-100 hover:bg-gray-200 dark:bg-dark-card dark:hover:bg-dark-hover border border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 transition-all hover:border-brand-500 max-w-[280px] group shadow-sm"
                    title={`${source.title}\n${source.url}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{source.title || source.url}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-brand-500 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
