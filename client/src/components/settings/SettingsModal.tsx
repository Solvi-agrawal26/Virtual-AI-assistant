import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSettings } from '../../context/SettingsContext';
import { PersonaType } from '../../types';
import {
  Sparkles,
  Code2,
  Briefcase,
  GraduationCap,
  PenTool,
  Sliders,
  Volume2,
  Cpu,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();

  const [assistantName, setAssistantName] = useState(settings.assistantName || 'Nova');
  const [personality, setPersonality] = useState<PersonaType>(settings.personality || 'general');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(settings.customSystemPrompt || '');
  const [language, setLanguage] = useState(settings.language || 'en');
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeak);
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7);
  const [saved, setSaved] = useState(false);

  const personas: { type: PersonaType; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'general',
      title: 'General Assistant',
      desc: 'Balanced, articulate, helpful, and concise answers.',
      icon: <Sparkles className="w-5 h-5 text-brand-500" />,
    },
    {
      type: 'coding',
      title: 'Coding Mentor',
      desc: 'Senior Staff Architect. Produces robust, clean, typed code.',
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
    },
    {
      type: 'business',
      title: 'Business Strategist',
      desc: 'Executive advisor. Actionable ROI trade-offs & execution plans.',
      icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
    },
    {
      type: 'academic',
      title: 'Academic Tutor',
      desc: 'University professor. Deep conceptual clarity and reasoning.',
      icon: <GraduationCap className="w-5 h-5 text-amber-500" />,
    },
    {
      type: 'creative',
      title: 'Creative Muse',
      desc: 'Storyteller and copywriter. Vivid words and expressive flair.',
      icon: <PenTool className="w-5 h-5 text-purple-500" />,
    },
    {
      type: 'custom',
      title: 'Custom Persona',
      desc: 'Define your own exact system instructions below.',
      icon: <Sliders className="w-5 h-5 text-cyan-500" />,
    },
  ];

  const handleSave = async () => {
    await updateSettings({
      assistantName,
      personality,
      customSystemPrompt,
      language,
      voiceEnabled,
      autoSpeak,
      temperature,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assistant Customization" maxWidth="lg">
      <div className="space-y-6">
        {/* Assistant Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Assistant Name
          </label>
          <input
            type="text"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
            placeholder="Nova"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Personality Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Intelligence Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {personas.map((p) => {
              const isSelected = personality === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => setPersonality(p.type)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-500/30'
                      : 'border-gray-200 dark:border-dark-border/80 bg-white dark:bg-dark-card/60 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/90 flex-shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom system prompt (if custom or any) */}
        {personality === 'custom' && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Custom System Instructions
            </label>
            <textarea
              rows={3}
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder="Provide exact rules and behavior instructions for the assistant..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        )}

        {/* Language & Temperature Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Language Preference
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="en">English (US)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="zh">Chinese (Mandarin)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-brand-500" />
                <span>Creativity (Temperature)</span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-500">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0.0 Precise</span>
              <span>0.7 Balanced</span>
              <span>1.0 Creative</span>
            </div>
          </div>
        </div>

        {/* Voice and Speech Section */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50/70 dark:bg-dark-card/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
            <Volume2 className="w-4 h-4 text-brand-500" />
            <span>Voice & Audio Synthesis</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Enable Voice Input & Output
              </p>
              <p className="text-[11px] text-gray-500">
                Allows speech-to-text dictation and read-aloud buttons.
              </p>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-dark-border/40">
            <div>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                Auto-Speak Responses
              </p>
              <p className="text-[11px] text-gray-500">
                Automatically read the AI's reply out loud upon completion.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSpeak}
              disabled={!voiceEnabled}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-dark-border">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            {saved ? (
              <span className="flex items-center gap-1.5 text-emerald-100">
                <Check className="w-4 h-4" /> Saved!
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
