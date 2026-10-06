import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, Code2, Briefcase, GraduationCap, PenTool } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const { settings } = useSettings();

  const suggestions = [
    {
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      title: 'Architect a TypeScript API',
      prompt: 'Help me design and write a clean REST API in TypeScript with error handling and Prisma ORM.',
      category: 'Coding & Architecture',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-emerald-400" />,
      title: 'Draft a Startup Pitch',
      prompt: 'Write an executive summary and competitive moat analysis for an AI SaaS startup.',
      category: 'Business Strategy',
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      title: 'Explain Complex Science',
      prompt: 'Explain the principles of quantum computing and superposition like I am a high school student.',
      category: 'Academic & Learning',
    },
    {
      icon: <PenTool className="w-5 h-5 text-purple-400" />,
      title: 'Craft High-Converting Copy',
      prompt: 'Draft 3 persuasive email copy variations for an enterprise product launch.',
      category: 'Creative Writing',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto animate-in fade-in duration-300">
      {/* Halo Avatar Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-brand-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 ring-4 ring-white/10">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
        How can {settings.assistantName || 'Nova'} help you today?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-lg mb-8">
        Streaming intelligence powered by Claude 3.5 Sonnet. Choose a prompt starter below or dictate with your microphone.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex flex-col text-left p-4 rounded-xl border border-gray-200 dark:border-dark-border/80 bg-white/70 dark:bg-dark-surface/60 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-dark-hover transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/80 group-hover:scale-105 transition-transform">
                {item.icon}
              </span>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {item.category}
              </span>
            </div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-200 mb-1 group-hover:text-brand-500 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
