'use client';

import Link from 'next/link';
import NavBar from '@/components/NavBar';
import SparkleBackground from '@/components/SparkleBackground';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08080c] relative">
      <SparkleBackground />
      <NavBar />

      <div className="pt-6 relative z-10">
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
              CineLingua combines AI-powered language learning with Google Veo 3.1 video generation, blockchain contests, and NFT awards
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
                desc: 'Write prompts using your unlocked vocabulary. Veo 3.1 generates stunning 1080p cinematic clips.',
                color: 'from-orange-500 to-red-500'
              },
              {
                step: '4',
                icon: '🏆',
                title: 'Compete & Win',
                desc: 'Enter weekly contests with USDC stakes. Top 5 winners split the pool + everyone earns an NFT!',
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

        {/* NFT Awards Section - NEW */}
        <section className="bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-orange-900/10 border-y border-purple-500/20">
          <div className="max-w-[1000px] mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <span className="text-5xl mb-4 block">🏆</span>
              <h2 className="text-2xl font-bold text-white mb-4">NFT Awards for Every Participant</h2>
              <p className="text-white/50 max-w-lg mx-auto">
                Every contestant receives a unique animated NFT trophy. Winners get special gold, silver, and bronze editions!
              </p>
            </div>

            <div className="grid md:grid-cols-6 gap-4">
              {[
                { tier: '🥇', name: '1st Place', color: 'from-yellow-400 to-amber-500', desc: 'Gold Trophy (50%)' },
                { tier: '🥈', name: '2nd Place', color: 'from-gray-300 to-gray-400', desc: 'Silver Trophy (20%)' },
                { tier: '🥉', name: '3rd Place', color: 'from-orange-400 to-orange-600', desc: 'Bronze Trophy (10%)' },
                { tier: '🎬', name: '4th/5th', color: 'from-blue-400 to-indigo-500', desc: 'Film Medal (10%)' },
                { tier: '🎞️', name: 'Participant', color: 'from-cyan-400 to-blue-500', desc: 'Film Badge' },
                { tier: '👑', name: 'Champion', color: 'from-purple-400 to-pink-500', desc: 'Season Winner' },
              ].map((award) => (
                <div key={award.name} className="text-center p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                  <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${award.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <span className="text-2xl">{award.tier}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{award.name}</p>
                  <p className="text-white/40 text-xs">{award.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              <h4 className="text-white font-semibold mb-3">NFT Features</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">On-chain SVG animation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">Film reel aesthetic</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">Shine & grain effects</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">AI judge score display</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">Movie title & theme</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-white/60">Video thumbnail</span>
                </div>
              </div>
            </div>
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
                  Powered by Google Gemini 2.5, our tutor generates contextual vocabulary, phrases, and cultural insights from real movie content.
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
                  <h3 className="text-lg font-bold text-white">Google Veo 3.1 Video</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Create stunning 1080p cinematic scenes using Google Veo 3.1. Choose Fast or Standard quality tiers for your AI-generated movie clips.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> 24 seconds of 1080p video
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Fast ($8) or Standard ($20) tiers
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> 3× clips or 1× seamless scene
                  </li>
                </ul>
              </div>

              {/* AI Judges */}
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Video Judges</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Three AI judges powered by Gemini 2.5 Flash actually WATCH your videos and provide detailed scoring and feedback.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-cyan-400">🎬</span> Le Cinéaste - Visual quality
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-cyan-400">🗣️</span> Le Linguiste - Language use
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-cyan-400">🎭</span> Le Public - Entertainment
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
                  <h3 className="text-lg font-bold text-white">Base Network + NFTs</h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Connect your Web3 wallet to participate. Win USDC prizes and collect animated NFT trophies on Base Sepolia.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> MetaMask compatible
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> Smart contract prizes
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <span className="text-emerald-400">✓</span> On-chain NFT awards
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
            Simple, transparent pricing. Learning is free - you only pay when generating videos for contests.
          </p>

          {/* Free Learning */}
          <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06] max-w-md mx-auto mb-8">
            <h3 className="text-lg font-bold text-white mb-2 text-center">Learning</h3>
            <div className="text-3xl font-bold text-emerald-400 mb-4 text-center">Free</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/60">
                <span className="text-emerald-400">✓</span> Browse all movies & watch trailers
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <span className="text-emerald-400">✓</span> AI-generated vocabulary & flashcards
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <span className="text-emerald-400">✓</span> Quizzes & AI tutor chat
              </li>
            </ul>
          </div>

          {/* Contest Tiers */}
          <h3 className="text-lg font-semibold text-white text-center mb-6">Contest Entry Tiers</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Fast Tier */}
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">⚡ Fast</h3>
                <span className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-400">Budget</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">$8 <span className="text-base font-normal text-white/40">USDC</span></div>
              <p className="text-xs text-white/30 mb-4">Veo 3.1 Fast • $4 to pool</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> 3× 8-sec clips (24s total)
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> Good quality 1080p
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-emerald-400">✓</span> AI judging + NFT trophy
                </li>
              </ul>
            </div>

            {/* Standard Tier */}
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 rounded-full text-xs text-white font-semibold">Popular</div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">🎬 Standard</h3>
                <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400">Best Value</span>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">$20 <span className="text-base font-normal text-white/40">USDC</span></div>
              <p className="text-xs text-white/30 mb-4">Veo 3.1 Standard • $10 to pool</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> 3× 8-sec clips (24s total)
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> High quality 1080p
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-purple-400">✓</span> AI judging + NFT trophy
                </li>
              </ul>
            </div>

            {/* Premium Tier */}
            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">✨ Premium</h3>
                <span className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400">Seamless</span>
              </div>
              <div className="text-3xl font-bold text-amber-400 mb-1">$20 <span className="text-base font-normal text-white/40">USDC</span></div>
              <p className="text-xs text-white/30 mb-4">Veo 3.1 Standard • $10 to pool</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-amber-400">✓</span> 1× 24-sec seamless video
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-amber-400">✓</span> High quality 1080p
                </li>
                <li className="flex items-center gap-2 text-white/60">
                  <span className="text-amber-400">✓</span> AI judging + NFT trophy
                </li>
              </ul>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="mt-8 p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06] max-w-3xl mx-auto">
            <h4 className="text-white font-semibold mb-4 text-center">Prize Distribution (5 Winners)</h4>
            <div className="grid grid-cols-5 gap-3 text-center text-sm">
              <div>
                <p className="text-2xl font-bold text-yellow-400">50%</p>
                <p className="text-white/40">🥇 1st</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-300">20%</p>
                <p className="text-white/40">🥈 2nd</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">10%</p>
                <p className="text-white/40">🥉 3rd</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">10%</p>
                <p className="text-white/40">🎬 4th</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">10%</p>
                <p className="text-white/40">🎬 5th</p>
              </div>
            </div>
            <p className="text-center text-white/30 text-xs mt-4">
              Half of each entry goes to prize pool. 5 winners split 100% of the pool!
            </p>
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
              { name: 'Google Gemini 2.5', desc: 'AI Tutor & Judges' },
              { name: 'Google Veo 3.1', desc: '1080p Video Gen' },
              { name: 'Base Network', desc: 'Smart Contracts' },
              { name: 'ERC-721 NFTs', desc: 'On-chain Awards' },
              { name: 'Next.js 16', desc: 'Frontend' },
              { name: 'Supabase', desc: 'Database' },
              { name: 'Circle USDC', desc: 'Payments' },
              { name: 'Vercel', desc: 'Hosting' },
            ].map((tech) => (
              <div key={tech.name} className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] text-center">
                <p className="text-white font-medium text-sm">{tech.name}</p>
                <p className="text-white/40 text-xs mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Contracts */}
        <section className="bg-white/[0.01] border-y border-white/[0.04]">
          <div className="max-w-[1000px] mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Smart Contracts</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <h4 className="text-white font-semibold mb-2">Contest Contract</h4>
                <p className="text-white/40 text-xs font-mono break-all mb-2">
                  0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa
                </p>
                <a
                  href="https://sepolia.basescan.org/address/0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 text-xs hover:underline"
                >
                  View on BaseScan →
                </a>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <h4 className="text-white font-semibold mb-2">NFT Contract</h4>
                <p className="text-white/40 text-xs font-mono break-all mb-2">
                  0x5E70D149E496eda49Ad2E65ec46d9418f44a7883
                </p>
                <a
                  href="https://sepolia.basescan.org/address/0x5E70D149E496eda49Ad2E65ec46d9418f44a7883"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 text-xs hover:underline"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1000px] mx-auto px-6 py-16">
          <div className="p-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Pick a movie, learn vocabulary, create AI-generated scenes, and earn your first NFT trophy!
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
              Built for Google AI Hackathon 2025 • Powered by Google Veo 3.1, Gemini 2.5 & Base Network
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
