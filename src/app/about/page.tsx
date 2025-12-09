'use client';

import Link from 'next/link';
import NavBar from '@/components/NavBar';
import SparkleBackground from '@/components/SparkleBackground';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08080c] relative">
      <SparkleBackground />
      <NavBar />

      <div className="pt-14 relative z-10">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-white/[0.04]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/10 to-pink-600/10" />
          <div className="relative max-w-[1000px] mx-auto px-6 py-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
              <span className="text-4xl">🎬</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Learn Languages Through Cinema
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              CineLingua combines AI-powered language learning with creative video generation and blockchain-based contests
            </p>
          </div>
        </div>

        {/* How It Works */}
        <section className="max-w-[1000px] mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: '🎥',
                title: 'Watch & Learn',
                desc: 'Browse movies in your target language. Watch trailers and learn vocabulary with AI-generated content.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '2',
                icon: '📝',
                title: 'Take Quizzes',
                desc: 'Pass vocabulary quizzes to unlock words. Each correct answer adds words to your scene toolkit.',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                step: '3',
                icon: '✨',
                title: 'Create Scenes',
                desc: 'Write prompts using your unlocked vocabulary. AI generates 3x 8-second cinematic clips.',
                color: 'from-orange-500 to-red-500'
              },
              {
                step: '4',
                icon: '🏆',
                title: 'Compete & Win',
                desc: 'Enter weekly contests with USDC stakes. Top 3 creators split 80% of the prize pool.',
                color: 'from-emerald-500 to-teal-500'
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06] h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm border border-white/20">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-white/[0.01] border-y border-white/[0.04]">
          <div className="max-w-[1000px] mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Platform Features</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Language Tutor */}
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Language Tutor</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Powered by Google Gemini AI, our tutor generates contextual vocabulary, phrases, and cultural insights from real movie content.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Movie-specific vocabulary
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Interactive flashcards
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> AI chat for questions
                  </li>
                </ul>
              </div>

              {/* Video Generation */}
              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Veo AI Video Generation</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Create cinematic scenes using Google Veo 3.1 Fast. Your vocabulary becomes the foundation for stunning 8-second AI-generated clips.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> 3x 8-second clips per scene
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Cinematic style presets
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Camera movement options
                  </li>
                </ul>
              </div>

              {/* Weekly Contests */}
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Weekly Contests</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Compete with other learners in themed challenges. AI judges score scenes on creativity, language use, and cinematic quality.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> 3 AI judges per scene
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Top 3 split 80% of pool
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Live judging shows
                  </li>
                </ul>
              </div>

              {/* Blockchain Wallet */}
              <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Base Network Wallet</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Connect your Web3 wallet to participate in contests. All transactions use USDC on Base Sepolia testnet.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> MetaMask compatible
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Free testnet USDC faucet
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Smart contract prizes
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-[1000px] mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Pricing</h2>
          <p className="text-white/50 text-center mb-12 max-w-lg mx-auto">
            Simple, transparent pricing. Learning is free - you only pay when generating videos.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
              <h3 className="text-lg font-bold text-white mb-2">Learning</h3>
              <div className="text-3xl font-bold text-emerald-400 mb-4">Free</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> Browse all movies
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> Watch trailers
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> AI-generated vocabulary
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> Flashcards & quizzes
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> AI tutor chat
                </li>
              </ul>
            </div>

            {/* Contest */}
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-2">Contest Entry</h3>
              <div className="text-3xl font-bold text-purple-400 mb-4">$4.00 <span className="text-base font-normal text-white/40">USDC</span></div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> 3x 8-second video clips
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> Veo AI generation ($2.40)
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> Contest stake ($1.60)
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> Compete for prizes
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> AI judge feedback
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="bg-white/[0.01] border-y border-white/[0.04]">
          <div className="max-w-[1000px] mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Supported Languages</h2>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { flag: '🇫🇷', name: 'French' },
                { flag: '🇪🇸', name: 'Spanish' },
                { flag: '🇩🇪', name: 'German' },
                { flag: '🇮🇹', name: 'Italian' },
                { flag: '🇵🇹', name: 'Portuguese' },
                { flag: '🇯🇵', name: 'Japanese' },
                { flag: '🇰🇷', name: 'Korean' },
                { flag: '🇨🇳', name: 'Chinese' },
              ].map((lang) => (
                <div key={lang.name} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-white/70 text-sm">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-[1000px] mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Built With</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Google Gemini', desc: 'AI Language Tutor' },
              { name: 'Google Veo 3.1', desc: 'Video Generation' },
              { name: 'Base Network', desc: 'Smart Contracts' },
              { name: 'Circle USDC', desc: 'Payments' },
              { name: 'Next.js 15', desc: 'Frontend Framework' },
              { name: 'Supabase', desc: 'Database' },
              { name: 'TMDB API', desc: 'Movie Data' },
              { name: 'Vercel', desc: 'Hosting' },
            ].map((tech) => (
              <div key={tech.name} className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] text-center">
                <p className="text-white font-medium text-sm">{tech.name}</p>
                <p className="text-white/40 text-xs mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1000px] mx-auto px-6 py-16">
          <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Pick a movie, learn vocabulary, and create your first AI-generated scene today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Start Learning
              </Link>
              <Link
                href="/contest"
                className="px-6 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl font-semibold text-white hover:bg-white/[0.1] transition-all"
              >
                View Contests
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] py-6">
          <div className="max-w-[1000px] mx-auto px-6 text-center">
            <p className="text-white/30 text-xs">
              Built for Agentics TV5 Hackathon 2025 • Powered by Google AI & Base Network
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
