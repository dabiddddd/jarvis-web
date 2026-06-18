'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-jarvis-blue text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-4 text-jarvis-blue glow">
          JARVIS
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Your personal AI assistant, accessible from anywhere
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-jarvis-blue text-black font-semibold rounded-lg hover:bg-jarvis-blue-dark transition-all glow-hover"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3 border border-jarvis-blue text-jarvis-blue font-semibold rounded-lg hover:bg-jarvis-blue/10 transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
