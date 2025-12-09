'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavBar from '@/components/NavBar';
import SparkleBackground from '@/components/SparkleBackground';
import { getCurrentUser } from '@/lib/userStore';

interface ContestMovie {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  posterPath: string;
  language: string;
  theme: string;
}

interface Submission {
  id: string;
  userName: string;
  userAvatar: string;
  prompt: string;
  thumbnailUrl: string;
  score: number | null;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
}

// This week's contest movies
const CONTEST_MOVIES: ContestMovie[] = [
  { id: 194, title: 'Amélie', originalTitle: 'Le Fabuleux Destin d\'Amélie Poulain', year: 2001, posterPath: '/slVnvaH5B4NrT5rBIpUwRing3jY.jpg', language: 'French', theme: 'Whimsical Paris' },
  { id: 77338, title: 'The Intouchables', originalTitle: 'Intouchables', year: 2011, posterPath: '/4mFsNQwbD0F237Tx7gAPotSpBXj.jpg', language: 'French', theme: 'Unlikely Friendship' },
  { id: 11860, title: 'La Haine', originalTitle: 'La Haine', year: 1995, posterPath: '/lyYyCUiXLCxjMgGwExrKnRjLfNE.jpg', language: 'French', theme: 'Urban Tension' },
  { id: 152532, title: 'Blue Is the Warmest Color', originalTitle: 'La Vie d\'Adèle', year: 2013, posterPath: '/hoBqI7QVWA7oRfwDJvNPgfFqBfQ.jpg', language: 'French', theme: 'Passion & Identity' },
  { id: 489925, title: 'Portrait of a Lady on Fire', originalTitle: 'Portrait de la jeune fille en feu', year: 2019, posterPath: '/2LquGwEhbg3soxSCs9VNyh5VJd9.jpg', language: 'French', theme: 'Art & Desire' },
];

function MoviePoster({ posterPath, title, className }: { posterPath: string; title: string; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

  if (imgError) {
    return (
      <div className={`bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center ${className}`}>
        <span className="text-white/50 text-xs text-center px-2">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className={className}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

export default function ContestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedMovie, setSelectedMovie] = useState<ContestMovie | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const contestEndTime = new Date();
  contestEndTime.setDate(contestEndTime.getDate() + (7 - contestEndTime.getDay()));
  contestEndTime.setHours(23, 59, 59, 999);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (!savedUser) {
      router.push('/login');
      return;
    }
    setUser(savedUser);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = contestEndTime.getTime() - now.getTime();
      if (diff <= 0) { setTimeRemaining('Ended'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      // TODO: Fetch real submissions from database
      setSubmissions([]);
      setChatMessages([]);
    }
  }, [selectedMovie]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  function sendMessage() {
    if (!newMessage.trim() || !user || !selectedMovie) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      userName: user.name,
      userAvatar: user.avatar,
      message: newMessage,
      timestamp: new Date().toISOString(),
    }]);
    setNewMessage('');
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(ts).toLocaleDateString();
  }

  if (!user) return <div className="min-h-screen bg-[#08080c] flex items-center justify-center"><div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-[#08080c] relative">
      <SparkleBackground />
      <NavBar userAvatar={user?.avatar} />

      <div className="pt-6 relative z-10">
        {!selectedMovie ? (
          /* MOVIE SELECTION */
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Week {Math.ceil(new Date().getDate() / 7)} Active
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">This Week's Contest</h1>
              <p className="text-white/50 mb-6">Pick a movie to enter</p>
              <div className="flex justify-center">
                <div><p className="text-2xl font-bold text-white">{timeRemaining}</p><p className="text-white/40 text-sm">Remaining</p></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CONTEST_MOVIES.map((movie) => (
                <button key={movie.id} onClick={() => setSelectedMovie(movie)} className="group text-left bg-white/[0.02] rounded-xl overflow-hidden border border-white/[0.06] hover:border-purple-500/40 transition-all">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <MoviePoster
                      posterPath={movie.posterPath}
                      title={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm">{movie.title}</h3>
                      <p className="text-white/50 text-xs">{movie.year} • {movie.language}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* CONTEST POOL VIEW */
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            <button onClick={() => setSelectedMovie(null)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Movies
            </button>

            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="w-24 h-36 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <MoviePoster
                  posterPath={selectedMovie.posterPath}
                  title={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{selectedMovie.title}</h1>
                <p className="text-white/50 text-sm mb-4">{selectedMovie.theme} • {selectedMovie.language} • {selectedMovie.year}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-2 bg-white/[0.04] rounded-lg"><p className="text-lg font-bold text-white">{submissions.length}</p><p className="text-white/40 text-xs">Entries</p></div>
                  <div className="px-3 py-2 bg-white/[0.04] rounded-lg"><p className="text-lg font-bold text-cyan-400">{timeRemaining}</p><p className="text-white/40 text-xs">Left</p></div>
                </div>
              </div>
            </div>

            {/* Entry Flow Steps */}
            <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 rounded-2xl border border-white/10 p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 text-center">Enter This Contest</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Step 1: Take Quiz */}
                <button
                  onClick={() => router.push(`/?movie=${selectedMovie.id}`)}
                  className="group p-4 bg-white/5 hover:bg-purple-500/20 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">1</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Take Quiz</h3>
                  <p className="text-white/40 text-xs">Learn vocabulary</p>
                </button>

                {/* Step 2: Create Scene */}
                <button
                  onClick={() => router.push(`/?movie=${selectedMovie.id}&action=create`)}
                  className="group p-4 bg-white/5 hover:bg-cyan-500/20 rounded-xl border border-white/10 hover:border-cyan-500/40 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">2</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Create Scene</h3>
                  <p className="text-white/40 text-xs">Write your prompt</p>
                </button>

                {/* Step 3: Generate Video */}
                <button
                  onClick={() => router.push(`/?movie=${selectedMovie.id}&action=generate`)}
                  className="group p-4 bg-white/5 hover:bg-orange-500/20 rounded-xl border border-white/10 hover:border-orange-500/40 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">3</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Generate</h3>
                  <p className="text-white/40 text-xs">3x 8-sec clips</p>
                </button>

                {/* Step 4: Submit & Pay */}
                <button
                  onClick={() => router.push('/wallet')}
                  className="group p-4 bg-white/5 hover:bg-emerald-500/20 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">4</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Submit</h3>
                  <p className="text-white/40 text-xs">$4.80 USDC</p>
                </button>
              </div>
              <p className="text-center text-white/30 text-xs mt-4">
                $2.40 generation + $1.90 stake + $0.50 platform • Top 3 split 80% of pool
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Submissions */}
              <div className="lg:col-span-2 bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
                <h2 className="font-bold text-white mb-4">Submissions</h2>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-white/40 mb-2">No entries yet</p>
                    <p className="text-white/20 text-sm">Be the first to submit!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {submissions.map((sub, idx) => (
                      <div key={sub.id} className="bg-black/30 rounded-lg overflow-hidden border border-white/[0.06]">
                        <div className="aspect-video relative">
                          <img src={sub.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          {idx < 3 && <div className="absolute top-2 left-2 text-lg">{['🥇','🥈','🥉'][idx]}</div>}
                          {sub.score && <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs font-bold">{sub.score}</div>}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <img src={sub.userAvatar} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-white text-sm">{sub.userName}</span>
                          </div>
                          <p className="text-white/40 text-xs truncate">{sub.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat */}
              <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] flex flex-col h-[500px]">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h2 className="font-bold text-white">Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/30 text-sm">No messages yet</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <img src={msg.userAvatar} alt="" className="w-6 h-6 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2"><span className="text-white text-sm font-medium">{msg.userName}</span><span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span></div>
                          <p className="text-white/70 text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-white/[0.06]">
                  <div className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message..." className="flex-1 h-9 bg-black/40 border border-white/[0.08] rounded-lg px-3 text-white text-sm placeholder-white/30 focus:outline-none" />
                    <button onClick={sendMessage} className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
