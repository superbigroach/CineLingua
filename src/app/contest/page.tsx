'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { getCurrentUser } from '@/lib/userStore';

interface ContestMovie {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  poster: string;
  language: string;
  theme: string;
  entries: number;
  prizePool: number;
}

interface Submission {
  id: string;
  userName: string;
  userAvatar: string;
  prompt: string;
  thumbnailUrl: string;
  score: number | null;
  likes: number;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
}

const CONTEST_MOVIES: ContestMovie[] = [
  { id: 194, title: 'Amélie', originalTitle: 'Le Fabuleux Destin d\'Amélie Poulain', year: 2001, poster: 'https://image.tmdb.org/t/p/w500/nSxDa3ppafARKqWDLoQ7k4PwfGW.jpg', language: 'French', theme: 'Whimsical Paris', entries: 24, prizePool: 38.40 },
  { id: 77338, title: 'The Intouchables', originalTitle: 'Intouchables', year: 2011, poster: 'https://image.tmdb.org/t/p/w500/323BP0itpxTsO0skTwdnVmgJHIh.jpg', language: 'French', theme: 'Unlikely Friendship', entries: 18, prizePool: 28.80 },
  { id: 11860, title: 'La Haine', originalTitle: 'La Haine', year: 1995, poster: 'https://image.tmdb.org/t/p/w500/1lGIrNLIE0GgqD1bJDLuaVXiSw1.jpg', language: 'French', theme: 'Urban Tension', entries: 12, prizePool: 19.20 },
  { id: 152532, title: 'Blue Is the Warmest Color', originalTitle: 'La Vie d\'Adèle', year: 2013, poster: 'https://image.tmdb.org/t/p/w500/uyaFYhnqMKwU1F0wxmZkNlFfbwJ.jpg', language: 'French', theme: 'Passion & Identity', entries: 8, prizePool: 12.80 },
  { id: 489925, title: 'Portrait of a Lady on Fire', originalTitle: 'Portrait de la jeune fille en feu', year: 2019, poster: 'https://image.tmdb.org/t/p/w500/2LquGwEhbg3soxSCs9VNyh5VJd9.jpg', language: 'French', theme: 'Art & Desire', entries: 15, prizePool: 24.00 },
];

const MOCK_SUBMISSIONS: Record<number, Submission[]> = {
  194: [
    { id: '1', userName: 'Pierre M.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre', prompt: 'Amélie discovers a hidden treasure box...', thumbnailUrl: 'https://image.tmdb.org/t/p/w300/nSxDa3ppafARKqWDLoQ7k4PwfGW.jpg', score: 26.2, likes: 42, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', userName: 'Sophie L.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', prompt: 'The garden gnome travels...', thumbnailUrl: 'https://image.tmdb.org/t/p/w300/nSxDa3ppafARKqWDLoQ7k4PwfGW.jpg', score: 24.5, likes: 38, createdAt: new Date(Date.now() - 7200000).toISOString() },
  ],
  77338: [
    { id: '3', userName: 'Marie C.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie', prompt: 'Two friends race through Paris...', thumbnailUrl: 'https://image.tmdb.org/t/p/w300/323BP0itpxTsO0skTwdnVmgJHIh.jpg', score: 27.8, likes: 56, createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

const MOCK_CHAT: Record<number, ChatMessage[]> = {
  194: [
    { id: '1', userName: 'Pierre M.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre', message: 'Just submitted my scene!', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: '2', userName: 'Sophie L.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', message: 'Good luck everyone!', timestamp: new Date(Date.now() - 600000).toISOString() },
  ],
};

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
      setSubmissions(MOCK_SUBMISSIONS[selectedMovie.id] || []);
      setChatMessages(MOCK_CHAT[selectedMovie.id] || []);
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

  const totalPool = CONTEST_MOVIES.reduce((s, m) => s + m.prizePool, 0);

  if (!user) return <div className="min-h-screen bg-[#08080c] flex items-center justify-center"><div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-[#08080c]">
      <NavBar userAvatar={user?.avatar} />

      <div className="pt-14">
        {!selectedMovie ? (
          /* MOVIE SELECTION */
          <div className="max-w-[1400px] mx-auto px-6 py-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Week {Math.ceil(new Date().getDate() / 7)} Active
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">This Week's Contest</h1>
              <p className="text-white/50 mb-6">Pick a movie to enter</p>
              <div className="flex justify-center gap-8">
                <div><p className="text-2xl font-bold text-emerald-400">${totalPool.toFixed(2)}</p><p className="text-white/40 text-sm">Prize Pool</p></div>
                <div><p className="text-2xl font-bold text-white">{timeRemaining}</p><p className="text-white/40 text-sm">Remaining</p></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CONTEST_MOVIES.map((movie) => (
                <button key={movie.id} onClick={() => setSelectedMovie(movie)} className="group text-left bg-white/[0.02] rounded-xl overflow-hidden border border-white/[0.06] hover:border-purple-500/40 transition-all">
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 rounded text-xs font-bold">${movie.prizePool.toFixed(0)}</div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm">{movie.title}</h3>
                      <p className="text-white/50 text-xs">{movie.entries} entries</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* CONTEST POOL VIEW */
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <button onClick={() => setSelectedMovie(null)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>

            <div className="flex items-start gap-6 mb-8">
              <img src={selectedMovie.poster} alt="" className="w-24 h-36 rounded-lg object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-white">{selectedMovie.title}</h1>
                <p className="text-white/50 text-sm mb-4">{selectedMovie.theme}</p>
                <div className="flex gap-4">
                  <div className="px-3 py-2 bg-emerald-500/20 rounded-lg"><p className="text-lg font-bold text-emerald-400">${selectedMovie.prizePool.toFixed(2)}</p><p className="text-white/40 text-xs">Pool</p></div>
                  <div className="px-3 py-2 bg-white/[0.04] rounded-lg"><p className="text-lg font-bold text-white">{submissions.length}</p><p className="text-white/40 text-xs">Entries</p></div>
                  <div className="px-3 py-2 bg-white/[0.04] rounded-lg"><p className="text-lg font-bold text-cyan-400">{timeRemaining}</p><p className="text-white/40 text-xs">Left</p></div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Submissions */}
              <div className="lg:col-span-2 bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
                <h2 className="font-bold text-white mb-4">Submissions</h2>
                {submissions.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No entries yet</p>
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
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <img src={msg.userAvatar} alt="" className="w-6 h-6 rounded-full" />
                      <div>
                        <div className="flex items-center gap-2"><span className="text-white text-sm font-medium">{msg.userName}</span><span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span></div>
                        <p className="text-white/70 text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
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
