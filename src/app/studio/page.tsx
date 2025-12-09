'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/userStore';
import SceneCreatorModal from '@/components/SceneCreatorModal';

// Types
interface GeneratedVideo {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  movieTitle: string;
  movieId: number;
  language: string;
  prompt: string;
  enhancedPrompt: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  contestId?: string;
  contestStatus?: 'active' | 'completed' | 'judged';
  contestRank?: number;
  score?: number;
}

interface Contest {
  id: string;
  name: string;
  movieTitle: string;
  language: string;
  status: 'active' | 'judging' | 'completed';
  endDate: string;
  prizePool: number;
  participants: number;
  userEntry?: GeneratedVideo;
  userRank?: number;
}

interface QuizCompletion {
  id: string;
  movieTitle: string;
  language: string;
  score: number;
  totalQuestions: number;
  unlockedWords: string[];
  completedAt: string;
}

type TabType = 'create' | 'my-videos' | 'explore' | 'saved' | 'contests' | 'quizzes';

// Mock data for demo
const mockVideos: GeneratedVideo[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Marie Chen',
    userEmail: 'marie@example.com',
    movieTitle: 'Amélie',
    movieId: 101,
    language: 'French',
    prompt: 'A whimsical café scene',
    enhancedPrompt: 'A whimsical Parisian café scene with warm golden light...',
    videoUrl: null,
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/slVnvaH9rK7JOeI0JRlsP3EKDBO.jpg',
    status: 'completed',
    createdAt: new Date().toISOString(),
    likes: 42,
    comments: 8,
    shares: 3,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jean Dupont',
    userEmail: 'jean@example.com',
    movieTitle: 'Intouchables',
    movieId: 102,
    language: 'French',
    prompt: 'Two friends sharing a laugh',
    enhancedPrompt: 'Two friends from different worlds sharing a laugh...',
    videoUrl: null,
    thumbnailUrl: 'https://image.tmdb.org/t/p/w500/323BP0itpxTsO0skTwdnVmgJHIh.jpg',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 156,
    comments: 24,
    shares: 12,
    contestId: 'contest1',
    contestStatus: 'completed',
    contestRank: 2,
    score: 87,
  },
];

const mockContests: Contest[] = [
  {
    id: 'contest1',
    name: 'Week 49 Challenge',
    movieTitle: 'Amélie',
    language: 'French',
    status: 'active',
    endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    prizePool: 250,
    participants: 47,
  },
  {
    id: 'contest2',
    name: 'Week 48 Challenge',
    movieTitle: 'La Haine',
    language: 'French',
    status: 'completed',
    endDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    prizePool: 180,
    participants: 32,
    userRank: 3,
  },
];

const mockQuizzes: QuizCompletion[] = [
  {
    id: 'quiz1',
    movieTitle: 'Amélie',
    language: 'French',
    score: 5,
    totalQuestions: 5,
    unlockedWords: ['rêveur', 'bonheur', 'destin', 'amour', 'espoir'],
    completedAt: new Date().toISOString(),
  },
  {
    id: 'quiz2',
    movieTitle: 'Le Fabuleux Destin',
    language: 'French',
    score: 4,
    totalQuestions: 5,
    unlockedWords: ['liberté', 'courage', 'passion', 'joie'],
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function StudioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [myVideos, setMyVideos] = useState<GeneratedVideo[]>([]);
  const [exploreVideos, setExploreVideos] = useState<GeneratedVideo[]>(mockVideos);
  const [savedVideos, setSavedVideos] = useState<GeneratedVideo[]>([]);
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [quizzes, setQuizzes] = useState<QuizCompletion[]>(mockQuizzes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [showSceneCreator, setShowSceneCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (!savedUser) {
      router.push('/login');
      return;
    }
    setUser(savedUser);
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoading(true);
    // In production, fetch from API
    await new Promise(resolve => setTimeout(resolve, 500));
    setMyVideos([...mockVideos].slice(0, 1));
    setLoading(false);
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      setExploreVideos(mockVideos);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = mockVideos.filter(v =>
      v.userName.toLowerCase().includes(query) ||
      v.userEmail.toLowerCase().includes(query) ||
      v.movieTitle.toLowerCase().includes(query)
    );
    setExploreVideos(filtered);
  }

  function handleLike(videoId: string) {
    setExploreVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, likes: v.isLiked ? v.likes - 1 : v.likes + 1, isLiked: !v.isLiked } : v
    ));
  }

  function handleSave(videoId: string) {
    const video = exploreVideos.find(v => v.id === videoId);
    if (!video) return;

    if (video.isSaved) {
      setSavedVideos(prev => prev.filter(v => v.id !== videoId));
    } else {
      setSavedVideos(prev => [...prev, { ...video, isSaved: true }]);
    }

    setExploreVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, isSaved: !v.isSaved } : v
    ));
  }

  function handleShare(video: GeneratedVideo) {
    if (navigator.share) {
      navigator.share({
        title: `${video.movieTitle} Scene by ${video.userName}`,
        text: video.prompt,
        url: window.location.href,
      });
    }
  }

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: 'create',
      label: 'Create',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
    },
    {
      id: 'my-videos',
      label: 'My Videos',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
    },
    {
      id: 'contests',
      label: 'Contests',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
    },
    {
      id: 'quizzes',
      label: 'Quizzes',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080c]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              CL
            </div>
            <span className="text-base font-semibold tracking-tight">
              <span className="text-white">Cine</span>
              <span className="text-cyan-400">Lingua</span>
            </span>
          </a>

          <div className="flex items-center gap-6">
            <a href="/" className="text-white/50 hover:text-white text-sm transition-colors">Learn</a>
            <span className="text-cyan-400 text-sm font-medium">Studio</span>
            <a href="/contest" className="text-white/50 hover:text-white text-sm transition-colors">Contest</a>
            <a href="/wallet" className="text-white/50 hover:text-white text-sm transition-colors">Wallet</a>
            <a href="/about" className="text-white/50 hover:text-white text-sm transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="text-sm text-white font-medium hidden sm:block">{user.name}</span>
          </div>
        </div>
      </nav>

      <div className="pt-14">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-orange-600/20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          <div className="relative max-w-[1400px] mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CinéStudio</h1>
                <p className="text-white/50">Create, explore, and compete with AI-generated scenes</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-2xl font-bold text-white">{myVideos.length}</p>
                <p className="text-white/40 text-sm">My Scenes</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-2xl font-bold text-cyan-400">{savedVideos.length}</p>
                <p className="text-white/40 text-sm">Saved</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-2xl font-bold text-purple-400">{contests.filter(c => c.userRank).length}</p>
                <p className="text-white/40 text-sm">Contest Wins</p>
              </div>
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <p className="text-2xl font-bold text-emerald-400">{quizzes.length}</p>
                <p className="text-white/40 text-sm">Quizzes Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 z-40 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create a New Scene</h2>
                <p className="text-white/50">Select a movie from the Learn page to unlock vocabulary and create your scene</p>
              </div>

              <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Start Creating</h3>
                <p className="text-white/50 mb-6">Go to the Learn page, select a movie, and click "Create Scene" to begin</p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  Browse Movies
                </a>
              </div>

              {/* Recent Activity */}
              {myVideos.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Creations</h3>
                  <div className="space-y-3">
                    {myVideos.slice(0, 3).map(video => (
                      <div key={video.id} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{video.movieTitle}</h4>
                          <p className="text-white/40 text-sm truncate">{video.prompt}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          video.status === 'generating' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-white/10 text-white/50'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MY VIDEOS TAB */}
          {activeTab === 'my-videos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">My Generated Scenes</h2>
                <span className="text-white/40 text-sm">{myVideos.length} videos</span>
              </div>

              {myVideos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
                  <p className="text-white/40 mb-6">Create your first scene to see it here</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white"
                  >
                    Create Scene
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={setSelectedVideo}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      showUser={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPLORE TAB */}
          {activeTab === 'explore' && (
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search by username, email, or movie..."
                      className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pl-11 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40 transition-all"
                    />
                    <svg className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 h-12 bg-cyan-500 rounded-xl font-medium text-white hover:bg-cyan-600 transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exploreVideos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={setSelectedVideo}
                    onLike={handleLike}
                    onSave={handleSave}
                    onShare={handleShare}
                    showUser={true}
                  />
                ))}
              </div>

              {exploreVideos.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-white/40">No videos found matching your search</p>
                </div>
              )}
            </div>
          )}

          {/* SAVED TAB */}
          {activeTab === 'saved' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Saved Scenes</h2>
                <span className="text-white/40 text-sm">{savedVideos.length} saved</span>
              </div>

              {savedVideos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No saved videos</h3>
                  <p className="text-white/40 mb-6">Explore and save videos you like</p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-6 py-3 bg-white/10 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    Explore Videos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onSelect={setSelectedVideo}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      showUser={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTESTS TAB */}
          {activeTab === 'contests' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">My Contests</h2>

              <div className="space-y-4">
                {contests.map(contest => (
                  <div key={contest.id} className="p-5 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-white">{contest.name}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            contest.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            contest.status === 'judging' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {contest.status}
                          </span>
                        </div>
                        <p className="text-white/50 text-sm">{contest.movieTitle} • {contest.language}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-cyan-400">${contest.prizePool} prize pool</span>
                          <span className="text-white/30">{contest.participants} participants</span>
                        </div>
                      </div>
                      {contest.userRank && (
                        <div className="text-center px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          <p className="text-2xl font-bold text-amber-400">#{contest.userRank}</p>
                          <p className="text-white/40 text-xs">Your Rank</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {contests.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-white/40">You haven't participated in any contests yet</p>
                </div>
              )}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Completed Quizzes</h2>

              <div className="space-y-4">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="p-5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-white mb-1">{quiz.movieTitle}</h3>
                        <p className="text-white/50 text-sm">{quiz.language}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-400">{quiz.score}/{quiz.totalQuestions}</p>
                        <p className="text-white/40 text-xs">Score</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quiz.unlockedWords.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-lg text-sm border border-purple-500/20">
                          {word}
                        </span>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs mt-3">
                      Completed {new Date(quiz.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {quizzes.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-white/40">Complete quizzes to unlock vocabulary for scene creation</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onLike={handleLike}
          onSave={handleSave}
          onShare={handleShare}
        />
      )}
    </main>
  );
}

// Video Card Component
function VideoCard({
  video,
  onSelect,
  onLike,
  onSave,
  onShare,
  showUser
}: {
  video: GeneratedVideo;
  onSelect: (v: GeneratedVideo) => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (v: GeneratedVideo) => void;
  showUser: boolean;
}) {
  return (
    <div className="group bg-white/[0.02] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.1] transition-all">
      {/* Thumbnail */}
      <div
        className="aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative cursor-pointer overflow-hidden"
        onClick={() => onSelect(video)}
      >
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Contest badge */}
        {video.contestRank && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 rounded-lg text-xs font-bold text-black">
            #{video.contestRank}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {showUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {video.userName.charAt(0)}
            </div>
            <span className="text-white/60 text-sm">{video.userName}</span>
          </div>
        )}

        <h3 className="font-medium text-white mb-1 line-clamp-1">{video.movieTitle}</h3>
        <p className="text-white/40 text-sm line-clamp-2 mb-3">{video.prompt}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(video.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                video.isLiked ? 'text-rose-400' : 'text-white/40 hover:text-rose-400'
              }`}
            >
              <svg className="w-4 h-4" fill={video.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {video.likes}
            </button>
            <button
              onClick={() => onSave(video.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                video.isSaved ? 'text-cyan-400' : 'text-white/40 hover:text-cyan-400'
              }`}
            >
              <svg className="w-4 h-4" fill={video.isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => onShare(video)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Video Player Modal
function VideoPlayerModal({
  video,
  onClose,
  onLike,
  onSave,
  onShare,
}: {
  video: GeneratedVideo;
  onClose: () => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (v: GeneratedVideo) => void;
}) {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#0c0c14] rounded-2xl border border-white/[0.08] overflow-hidden">
          {/* Video Player */}
          <div className="aspect-video bg-black relative">
            {video.videoUrl ? (
              <video
                src={video.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            ) : video.thumbnailUrl ? (
              <div className="w-full h-full relative">
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white/60">Video generating...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white/40">No video available</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {video.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{video.userName}</p>
                    <p className="text-white/40 text-sm">{video.userEmail}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{video.movieTitle}</h2>
                <p className="text-white/60">{video.prompt}</p>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 py-4 border-y border-white/[0.06]">
              <button
                onClick={() => onLike(video.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  video.isLiked
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                <svg className="w-5 h-5" fill={video.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {video.likes} Likes
              </button>
              <button
                onClick={() => onSave(video.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  video.isSaved
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                <svg className="w-5 h-5" fill={video.isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save
              </button>
              <button
                onClick={() => onShare(video)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-white/60 hover:bg-white/[0.08] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-4">
              <h3 className="font-semibold text-white mb-4">{video.comments} Comments</h3>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40 transition-all"
                />
                <button
                  disabled={!comment.trim()}
                  className="px-5 h-11 bg-cyan-500 rounded-xl font-medium text-white hover:bg-cyan-600 transition-all disabled:opacity-40"
                >
                  Post
                </button>
              </div>

              <div className="text-center py-8 text-white/30 text-sm">
                No comments yet. Be the first to comment!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
