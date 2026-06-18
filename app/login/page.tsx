'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (password.length === 4 && !loading) {
      handleSubmit();
    }
  }, [password]);

  const handleSubmit = async () => {
    if (!password || loading) return;
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Access denied');
        setPassword('');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('System error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-jarvis-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-jarvis-accent/30 mb-4 md:mb-6 glow-green">
            <svg className="w-8 h-8 md:w-12 md:h-12 text-jarvis-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-jarvis-text tracking-wider mb-2 md:mb-3">
            JARVIS
          </h1>
          <p className="text-jarvis-muted text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase">
            Just A Rather Very Intelligent System
          </p>
        </div>

        {/* Password input */}
        <div className="relative">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div className={`relative transition-all duration-300 ${focused ? 'scale-105' : ''}`}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="ENTER ACCESS CODE"
              maxLength={4}
              className="w-56 md:w-72 px-6 py-4 md:px-8 md:py-5 bg-jarvis-card/80 border border-jarvis-border rounded-lg focus:outline-none focus:border-jarvis-accent text-jarvis-text text-center text-2xl md:text-3xl tracking-[0.5em] md:tracking-[0.8em] font-heading font-medium transition-all duration-300 glass"
              autoFocus
            />

            {/* Focus ring effect */}
            <div className={`absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none ${focused ? 'ring-2 ring-jarvis-accent/50' : ''}`} />
          </div>

          {loading && (
            <p className="mt-4 md:mt-6 text-jarvis-accent font-heading text-xs md:text-sm tracking-widest animate-pulse">
              AUTHENTICATING...
            </p>
          )}
        </div>

        {/* Status indicator */}
        <div className="mt-8 md:mt-12 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-jarvis-accent animate-pulse' : 'bg-jarvis-muted/30'}`} />
          <span className="text-jarvis-muted text-xs tracking-wider">
            {loading ? 'PROCESSING' : 'SYSTEM STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
}
