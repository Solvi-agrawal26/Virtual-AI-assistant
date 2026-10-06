import React from 'react';
import { Button } from '../common/Button';
import {
  Sparkles,
  Zap,
  Mic,
  ShieldCheck,
  Code2,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Bot,
  Play,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onStartChat: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, onOpenAuth }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100 overflow-y-auto selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-dark-border/60 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Nova AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Log in
          </button>
          <Button variant="primary" size="sm" onClick={onStartChat}>
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-28 md:pb-32 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/3 -translate-x-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feature Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800/60 text-brand-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Powered by Claude 3.5 Sonnet & Real-Time Voice Synthesis</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Your Virtual AI Assistant with{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Real Voice & Memory
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl font-normal leading-relaxed">
          Experience low-latency streaming conversations, voice dictation, customizable intelligence personas, and seamless conversation history tailored for students, developers, and businesses.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartChat}
            className="w-full sm:w-auto shadow-xl shadow-brand-500/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Free Chatting</span>
          </Button>

          <button
            onClick={onStartChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-dark-border bg-dark-surface/60 hover:bg-dark-hover text-gray-200 text-base font-medium transition-all"
          >
            <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
            <span>Interactive Demo</span>
          </button>
        </div>

        {/* Social Proof / Security Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            Bcrypt & httpOnly Cookie Auth
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-400" />
            PostgreSQL Conversation Memory
          </span>
        </div>

        {/* Live Chat Interface Preview Card */}
        <div className="mt-14 w-full max-w-4xl rounded-2xl border border-dark-border bg-dark-surface/90 shadow-2xl overflow-hidden text-left relative group">
          <div className="h-10 bg-dark-bg/80 border-b border-dark-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-brand-400" />
              <span>Nova AI &mdash; Coding Mentor Persona</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="p-6 space-y-4">
            {/* User message */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                U
              </div>
              <div className="bg-dark-card/90 rounded-2xl px-4 py-2.5 text-sm text-gray-200 border border-dark-border/60">
                How do I implement SSE streaming with express and react?
              </div>
            </div>

            {/* Assistant message */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-brand-500 flex items-center justify-center text-white flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-brand-400">Nova AI</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  Here is how you set up low-latency Server-Sent Events (SSE):
                </div>
                <div className="rounded-xl bg-[#12161F] p-3 text-xs font-mono text-emerald-300 border border-gray-800">
                  <span className="text-gray-500">// Set headers on response</span>
                  <br />
                  res.writeHead(200, &#123; <span className="text-cyan-300">'Content-Type': 'text/event-stream'</span>, <span className="text-cyan-300">'Connection': 'keep-alive'</span> &#125;);
                  <br />
                  res.write(`data: $&#123;JSON.stringify(&#123; chunk: "Hello!" &#125;)&#125;\n\n`);
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Persona Cards */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white">
            Built for Every Workflow
          </h2>
          <p className="mt-3 text-gray-400 text-sm md:text-base">
            Switch between purpose-built personas or configure custom prompt behavior on the fly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-dark-border bg-dark-surface/50 hover:bg-dark-surface hover:border-brand-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Software Engineers</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Debug complex algorithms, refactor architecture, write unit tests, and inspect code syntax blocks with copy actions.
            </p>
            <span className="text-xs font-semibold text-brand-400 flex items-center gap-1">
              Senior Architect Mode &rarr;
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-dark-border bg-dark-surface/50 hover:bg-dark-surface hover:border-emerald-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Businesses & Executives</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Draft strategic decks, analyze market opportunities, create ROI models, and compose persuasive outreach copy.
            </p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Executive Strategy Mode &rarr;
            </span>
          </div>

          <div className="p-6 rounded-2xl border border-dark-border bg-dark-surface/50 hover:bg-dark-surface hover:border-amber-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Students & Researchers</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Learn difficult physics, math, and humanities topics with intuitive step-by-step breakdowns and voice read-aloud tutoring.
            </p>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              Academic Tutor Mode &rarr;
            </span>
          </div>
        </div>
      </section>

      {/* Core Tech Highlights */}
      <section className="py-16 px-6 bg-dark-surface/30 border-y border-dark-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-brand-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm text-white">Instant SSE Streaming</h4>
              <p className="text-xs text-gray-400 mt-1">Zero lag token-by-token responses straight from Claude 3.5 Sonnet.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm text-white">Speech In & Out</h4>
              <p className="text-xs text-gray-400 mt-1">Dictate using Web Speech API and listen to replies in clear natural audio.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm text-white">HttpOnly JWT Security</h4>
              <p className="text-xs text-gray-400 mt-1">Protected against XSS and CSRF with token rotation and bcrypt hashing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-sm text-white">Full History & Memory</h4>
              <p className="text-xs text-gray-400 mt-1">Relational conversation memory stored in PostgreSQL via Prisma ORM.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-dark-border/80 px-6 py-8 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-gray-300">Nova Virtual AI Assistant</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Nova AI. Full-stack Production Architecture.</p>
        </div>
      </footer>
    </div>
  );
};
