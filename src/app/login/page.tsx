'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUserSync } from '@/lib/userStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!name.trim() || name.length < 2) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    loginUserSync(email, name);

    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Learn Through Cinema',
      description: 'Watch trailers in your target language with AI-generated vocabulary and phrases'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Tutoring',
      description: 'Get instant help from Gemini AI for grammar, pronunciation, and cultural context'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Weekly Contests',
      description: 'Compete with others, create AI-generated scenes, and win USDC prizes'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'AI Judges',
      description: 'Three AI judges score your creative scenes: Language Pro, Cinema Critic, and Creative Director'
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080c] flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                CL
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                <span className="text-white">Cine</span>
                <span className="text-cyan-400">Lingua</span>
              </h1>
            </div>
            <p className="text-white/40 text-sm">Learn languages through cinema</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-[15px] placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-[15px] placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/30 text-xs">
            By continuing, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 bg-white/[0.02] border-l border-white/[0.04] items-center justify-center p-16">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-3">
            Master Languages with Movies
          </h2>
          <p className="text-white/50 mb-10">
            The most engaging way to learn a new language. Watch, learn, compete, and win.
          </p>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-cyan-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-white">12+</p>
              <p className="text-white/40 text-sm">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1000+</p>
              <p className="text-white/40 text-sm">Movies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="text-white/40 text-sm">Powered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
