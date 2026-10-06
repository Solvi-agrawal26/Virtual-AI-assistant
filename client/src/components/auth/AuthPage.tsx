import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface AuthPageProps {
  onContinueGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onContinueGuest }) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters with 1 number and 1 capital letter');
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError((err as Error).message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setError(null);
      setDemoLoading(true);
      await demoLogin();
    } catch (err) {
      setError((err as Error).message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setMode('login');
    setEmail('demo@nova.ai');
    setPassword('DemoPassword123!');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-[#0B0F19] text-gray-100 px-4 py-8 relative overflow-y-auto selection:bg-brand-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/25 ring-4 ring-white/10 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Nova AI</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Live Google Search
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            Ask any question &mdash; fetches live Google search results and cites sources.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-dark-surface/90 border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Quick 1-Click Demo Login */}
          <div className="space-y-2 mb-6">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={demoLoading || loading}
              className="w-full group relative flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>Instant 1-Click Sign In</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {onContinueGuest && (
              <button
                type="button"
                onClick={onContinueGuest}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-700/70 hover:border-brand-500/60 bg-dark-bg/60 hover:bg-dark-hover text-xs text-gray-300 font-medium transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-brand-400" />
                <span>Continue as Guest (No Login Required)</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-gray-700/60 w-full" />
            <span className="bg-[#111827] px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              or with email
            </span>
            <div className="border-t border-gray-700/60 w-full" />
          </div>

          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="flex rounded-xl bg-dark-bg p-1 border border-dark-border/80 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-dark-card text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-dark-card text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-dark-border bg-dark-card text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-300">
                  Email Address
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[11px] text-brand-400 hover:underline font-medium"
                  >
                    Use demo details
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-dark-border bg-dark-card text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-dark-border bg-dark-card text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-dark-border bg-dark-card text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full py-2.5 mt-2 font-semibold shadow-md shadow-brand-500/20"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>

        {/* Feature badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
            Live Google Web Search
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
            Clickable Source Citations
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secure JWT Auth
          </span>
        </div>
      </div>
    </div>
  );
};
