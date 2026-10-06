import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSettings } from '../../context/SettingsContext';
import { speechService } from '../../services/speech';
import { ArrowUp, Square, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  inputVal: string;
  setInputVal: (val: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ inputVal, setInputVal }) => {
  const { sendMessage, isStreaming, stopStreaming } = useChat();
  const { settings } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isVoiceSupported = speechService.isSpeechRecognitionSupported();

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputVal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputVal.trim() || isStreaming) return;
    sendMessage(inputVal);
    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setInputVal(transcript);
        },
        () => {
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <div className="relative rounded-2xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface shadow-lg focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition-all">
        {/* Active Listening Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-red-500/10 border-b border-red-500/20 text-xs text-red-500 rounded-t-2xl font-medium animate-pulse">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Listening to speech... Speak clearly
            </span>
            <button
              onClick={toggleVoiceInput}
              className="hover:underline text-[11px] font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${settings.assistantName || 'Nova'}...`}
          rows={1}
          disabled={isStreaming}
          className="w-full px-4 pt-3.5 pb-12 resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-sm md:text-base leading-relaxed"
        />

        {/* Input Footer Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Google Search
            </span>
            <span className="hidden sm:inline">
              &bull; Persona: <strong className="text-gray-600 dark:text-gray-300 capitalize">{settings.personality}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Dictation Button */}
            {isVoiceSupported && settings.voiceEnabled && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Stop listening' : 'Dictate with voice'}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-bounce'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send / Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                title="Stop response generation"
                className="p-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputVal.trim()}
                title="Send message (Enter)"
                className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand-500 text-white shadow-md shadow-brand-500/25 transition-all active:scale-95"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-2">
        Claude 3.5 Sonnet may produce inaccurate information about people, places, or facts.
      </p>
    </div>
  );
};
