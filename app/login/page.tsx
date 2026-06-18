'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        setError('Wrong password');
        setPassword('');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-6xl font-bold text-jarvis-blue glow mb-8">JARVIS</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter access code"
          maxLength={4}
          className="w-full px-6 py-4 bg-jarvis-gray border border-gray-700 rounded-lg focus:outline-none focus:border-jarvis-blue text-white text-center text-2xl tracking-[0.5em] font-mono"
          autoFocus
        />

        {loading && (
          <p className="mt-4 text-jarvis-blue animate-pulse">Authenticating...</p>
        )}
      </div>
    </div>
  );
}
