'use client';

import { useState, useEffect, useRef } from 'react';
import { Movie, FRANCOPHONE_REGIONS, getImageUrl } from '@/lib/tmdb';
import {
  User, getCurrentUser, loginUser, logoutUser, getLevelFromXP,
  recordMovieWatched, recordWordLearned, recordQuizResult, addXP, XP_REWARDS
} from '@/lib/userStore';
import QuizModal from '@/components/QuizModal';
import FlashcardModal from '@/components/FlashcardModal';
import ChatbotModal from '@/components/ChatbotModal';
import LeaderboardModal from '@/components/LeaderboardModal';
import InviteFriendModal from '@/components/InviteFriendModal';
import LoginModal from '@/components/LoginModal';

// Toast Notification Component
function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'xp' | 'level'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'from-green-500 to-emerald-500',
    xp: 'from-yellow-500 to-amber-500',
    level: 'from-purple-500 to-pink-500',
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3`}>
        <i className={`fas ${type === 'xp' ? 'fa-star' : type === 'level' ? 'fa-arrow-up' : 'fa-check-circle'}`}></i>
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}

// Sparkle Canvas Component
function SparkleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const sparkles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];

    for (let i = 0; i < 80; i++) {
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparkles.forEach((sparkle) => {
        sparkle.x += sparkle.speedX;
        sparkle.y += sparkle.speedY;

        if (sparkle.x < 0) sparkle.x = canvas.width;
        if (sparkle.x > canvas.width) sparkle.x = 0;
        if (sparkle.y < 0) sparkle.y = canvas.height;
        if (sparkle.y > canvas.height) sparkle.y = 0;

        sparkle.opacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.001 + sparkle.x)) * 0.5;

        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} id="sparkle-canvas" />;
}

export default function Home() {
  // Core state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [learningContent, setLearningContent] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Feature modals
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  // Quiz data
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'xp' | 'level' } | null>(null);

  // Refs
  const tutorPanelRef = useRef<HTMLDivElement>(null);

  // Load user on mount
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) setUser(savedUser);
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [selectedRegion]);

  async function fetchMovies() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion) {
        params.set('region', selectedRegion);
      } else {
        params.set('type', 'french');
      }

      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLearningContent(movie: Movie) {
    setSelectedMovie(movie);
    setLoadingContent(true);
    setTrailerKey(null);

    try {
      const [contentRes, trailerRes] = await Promise.all([
        fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'movie-content',
            title: movie.original_title || movie.title,
            overview: movie.overview,
          }),
        }),
        fetch(`/api/trailer?movieId=${movie.id}`),
      ]);

      const contentData = await contentRes.json();
      setLearningContent(contentData);

      if (trailerRes.ok) {
        const trailerData = await trailerRes.json();
        setTrailerKey(trailerData.key);
      }

      // Record movie watched and earn XP
      if (user) {
        recordMovieWatched(user.id, movie.id.toString());
        showToast(`+${XP_REWARDS.WATCH_TRAILER} XP for exploring!`, 'xp');
        refreshUser();
      }

      // Scroll to panel on mobile
      if (window.innerWidth < 1280 && tutorPanelRef.current) {
        tutorPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoadingContent(false);
    }
  }

  async function loadQuiz() {
    if (!selectedMovie || !learningContent) return;
    setLoadingQuiz(true);

    try {
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quiz',
          content: `Movie: ${selectedMovie.title}\nVocabulary: ${learningContent.vocabulary?.map((v: any) => v.word).join(', ')}\nPhrases: ${learningContent.phrases?.map((p: any) => p.phrase).join(', ')}`,
        }),
      });

      const data = await res.json();
      if (data.questions?.length > 0) {
        setQuizQuestions(data.questions);
        setShowQuiz(true);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoadingQuiz(false);
    }
  }

  function handleQuizComplete(correct: number, total: number) {
    if (user) {
      const result = recordQuizResult(user.id, correct, total);
      showToast(`+${result.xpEarned} XP${result.perfect ? ' - PERFECT!' : ''}`, result.perfect ? 'level' : 'xp');
      refreshUser();
    }
    setShowQuiz(false);
  }

  function handleWordLearned(word: string) {
    if (user) {
      recordWordLearned(user.id, word);
      refreshUser();
    }
  }

  function handleLogin(loggedInUser: User) {
    setUser(loggedInUser);
    setShowLoginModal(false);
    showToast('Welcome! Start learning French!', 'success');
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    showToast('Logged out successfully', 'success');
  }

  function refreshUser() {
    const updated = getCurrentUser();
    if (updated) setUser(updated);
  }

  function showToast(message: string, type: 'success' | 'xp' | 'level') {
    setToast({ message, type });
  }

  function speak(text: string, lang = 'fr-FR') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  const levelInfo = user ? getLevelFromXP(user.xp) : null;

  return (
    <main className="min-h-screen relative">
      <SparkleCanvas />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 bg-[rgba(5,5,8,0.95)] backdrop-blur-xl border-b border-[rgba(6,182,212,0.1)]">
        <div className="max-w-[1800px] mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
              CL
            </div>
            <span className="text-lg font-bold hidden sm:block">
              <span className="text-white">Cine</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
            </span>
          </a>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* XP & Level */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <i className="fas fa-star text-yellow-400 text-xs"></i>
                  <span className="text-yellow-400 font-bold text-sm">{user.xp}</span>
                  <span className="text-white/40 text-xs">XP</span>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <i className="fas fa-fire text-orange-400 text-xs"></i>
                  <span className="text-orange-400 font-bold text-sm">{user.streak}</span>
                </div>

                {/* Leaderboard */}
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                  title="Leaderboard"
                >
                  <i className="fas fa-trophy text-yellow-400 text-sm"></i>
                </button>

                {/* Invite Friends */}
                <button
                  onClick={() => setShowInviteFriend(true)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                  title="Invite Friends"
                >
                  <i className="fas fa-user-plus text-pink-400 text-sm"></i>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-cyan-500/30" />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium leading-tight">{user.name}</p>
                    <p className="text-[10px] text-cyan-400">Lvl {levelInfo?.level} • {levelInfo?.title}</p>
                  </div>
                </div>

                <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                <i className="fas fa-user mr-2"></i>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact */}
      <section className="pt-20 pb-6 px-4">
        <div className="max-w-[1800px] mx-auto flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-3">
            <div className="absolute inset-[-15px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)] animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i className="fas fa-film text-white text-2xl"></i>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold mb-2">
            <span className="text-white">Cine</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
          </h1>
          <p className="text-sm text-white/60 max-w-lg mb-3">
            Learn French through cinema with AI tutoring, quizzes, and flashcards
          </p>

          {!user && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              <i className="fas fa-rocket mr-2"></i>
              Start Learning Free
            </button>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1800px] mx-auto px-4 pb-20">

        {/* Region Selector */}
        <section id="regions" className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedRegion === ''
                  ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <span>All French</span>
            </button>
            {FRANCOPHONE_REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedRegion === region.code
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
                }`}
              >
                {region.flag} {region.code}
              </button>
            ))}
          </div>
        </section>

        {/* Trailer Player Section */}
        {selectedMovie && (
          <section id="player" className="mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-film text-cyan-400"></i>
                  <h2 className="text-lg font-bold">{selectedMovie.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="text-white/40 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {trailerKey ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailerKey}?rel=0&cc_load_policy=1&cc_lang_pref=fr`}
                      title={`${selectedMovie.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <i className="fas fa-video-slash text-3xl mb-2"></i>
                      <p className="text-sm">No trailer available</p>
                    </div>
                  </div>
                )}

                {/* Side-by-Side Translation */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-[10px] text-blue-400 mb-1 flex items-center gap-1">
                        <span>🇫🇷</span> Français
                      </p>
                      <p className="text-white/80 text-xs leading-relaxed">
                        {selectedMovie.original_title !== selectedMovie.title
                          ? selectedMovie.original_title
                          : selectedMovie.title}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <p className="text-[10px] text-purple-400 mb-1 flex items-center gap-1">
                        <span>🇬🇧</span> English
                      </p>
                      <p className="text-white/80 text-xs leading-relaxed">{selectedMovie.title}</p>
                    </div>
                  </div>

                  <p className="text-white/50 text-xs">{selectedMovie.overview}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={loadQuiz}
                      disabled={loadingQuiz || !learningContent}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loadingQuiz ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Loading...</>
                      ) : (
                        <><i className="fas fa-brain mr-2"></i>Quiz</>
                      )}
                    </button>
                    <button
                      onClick={() => setShowFlashcards(true)}
                      disabled={!learningContent?.vocabulary?.length}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <i className="fas fa-layer-group mr-2"></i>Flashcards
                    </button>
                    <button
                      onClick={() => setShowChatbot(true)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      <i className="fas fa-robot mr-2"></i>Ask AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== MAIN TWO-COLUMN LAYOUT ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

          {/* LEFT: Movies Grid */}
          <section id="movies">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <span className="text-purple-400 text-sm">🎬</span>
              <span>Popular French Movies</span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl h-56 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-3">
                {movies.slice(0, 16).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => loadLearningContent(movie)}
                    className={`bg-white/5 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:bg-white/10 border ${
                      selectedMovie?.id === movie.id
                        ? 'border-cyan-500/50 ring-2 ring-cyan-500/30'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={getImageUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-white font-medium text-xs truncate">{movie.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-amber-400 text-[10px]">
                          <i className="fas fa-star mr-1"></i>
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-white/30 text-[10px]">
                          {movie.release_date?.split('-')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: AI Tutor Panel */}
          <aside className="hidden xl:block">
            <div className="sticky top-20" ref={tutorPanelRef}>
              <div className={`bg-[rgba(5,5,8,0.95)] backdrop-blur-xl rounded-2xl p-4 border shadow-xl transition-all ${
                learningContent ? 'border-green-500/30 shadow-green-500/10' : 'border-white/10'
              }`}>
                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <span>AI Language Tutor</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 ml-auto">
                    Gemini
                  </span>
                </h2>

                {!selectedMovie ? (
                  <div className="text-center py-6 text-white/40">
                    <i className="fas fa-hand-pointer text-2xl mb-2 block"></i>
                    <p className="text-sm">Select a movie to start learning!</p>
                  </div>
                ) : loadingContent ? (
                  <div className="text-center py-6">
                    <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-white/40 text-xs">Generating content...</p>
                  </div>
                ) : learningContent ? (
                  <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    {/* Vocabulary with pronunciation */}
                    {learningContent.vocabulary?.length > 0 && (
                      <div>
                        <h3 className="text-purple-400 font-medium mb-2 text-xs flex items-center gap-2">
                          <i className="fas fa-book"></i>
                          Vocabulary
                        </h3>
                        <div className="space-y-1.5">
                          {learningContent.vocabulary.slice(0, 6).map((item: any, i: number) => (
                            <div key={i} className="p-2 bg-black/30 rounded-lg flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium text-xs">{item.word}</span>
                                  <button
                                    onClick={() => speak(item.word)}
                                    className="w-5 h-5 rounded bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                                  >
                                    <i className="fas fa-volume-up text-[8px] text-cyan-400"></i>
                                  </button>
                                </div>
                                <p className="text-white/50 text-[10px]">{item.translation}</p>
                              </div>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                                item.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                item.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {item.difficulty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phrases */}
                    {learningContent.phrases?.length > 0 && (
                      <div>
                        <h3 className="text-purple-400 font-medium mb-2 text-xs flex items-center gap-2">
                          <i className="fas fa-comment"></i>
                          Useful Phrases
                        </h3>
                        <div className="space-y-1.5">
                          {learningContent.phrases.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="p-2 bg-black/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white italic text-xs">&ldquo;{item.phrase}&rdquo;</p>
                                <button
                                  onClick={() => speak(item.phrase)}
                                  className="w-5 h-5 rounded bg-white/10 flex items-center justify-center hover:bg-white/20"
                                >
                                  <i className="fas fa-volume-up text-[8px] text-cyan-400"></i>
                                </button>
                              </div>
                              <p className="text-white/50 text-[10px]">{item.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
                      <button
                        onClick={loadQuiz}
                        disabled={loadingQuiz}
                        className="p-2 bg-purple-500/10 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all text-center"
                      >
                        <i className="fas fa-brain text-sm block mb-1"></i>
                        <span className="text-[10px]">Quiz</span>
                      </button>
                      <button
                        onClick={() => setShowFlashcards(true)}
                        className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all text-center"
                      >
                        <i className="fas fa-layer-group text-sm block mb-1"></i>
                        <span className="text-[10px]">Cards</span>
                      </button>
                      <button
                        onClick={() => setShowChatbot(true)}
                        className="p-2 bg-green-500/10 rounded-lg text-green-400 hover:bg-green-500/20 transition-all text-center"
                      >
                        <i className="fas fa-robot text-sm block mb-1"></i>
                        <span className="text-[10px]">Chat</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile AI Tutor */}
        <div className="xl:hidden mt-6" ref={tutorPanelRef}>
          {selectedMovie && learningContent && (
            <div className="bg-[rgba(5,5,8,0.95)] backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-robot text-green-400"></i>
                <span>AI Tutor</span>
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={loadQuiz} className="p-3 bg-purple-500/10 rounded-xl text-purple-400 text-center">
                  <i className="fas fa-brain text-lg block mb-1"></i>
                  <span className="text-xs">Quiz</span>
                </button>
                <button onClick={() => setShowFlashcards(true)} className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 text-center">
                  <i className="fas fa-layer-group text-lg block mb-1"></i>
                  <span className="text-xs">Cards</span>
                </button>
                <button onClick={() => setShowChatbot(true)} className="p-3 bg-green-500/10 rounded-xl text-green-400 text-center">
                  <i className="fas fa-robot text-lg block mb-1"></i>
                  <span className="text-xs">Ask AI</span>
                </button>
              </div>

              {/* Vocabulary preview */}
              <div className="space-y-2">
                {learningContent.vocabulary?.slice(0, 4).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{item.word}</span>
                      <button onClick={() => speak(item.word)} className="text-cyan-400">
                        <i className="fas fa-volume-up text-xs"></i>
                      </button>
                    </div>
                    <span className="text-white/50 text-xs">{item.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-4">
        <div className="max-w-[1800px] mx-auto px-4 text-center">
          <p className="text-white/40 text-xs">Built for Agentics TV5 Hackathon 2025</p>
          <p className="text-purple-400 text-xs font-medium">
            Powered by Google Gemini AI
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
      )}

      {showQuiz && quizQuestions.length > 0 && selectedMovie && (
        <QuizModal
          questions={quizQuestions}
          movieTitle={selectedMovie.title}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {showFlashcards && learningContent?.vocabulary && selectedMovie && (
        <FlashcardModal
          vocabulary={learningContent.vocabulary}
          movieTitle={selectedMovie.title}
          onWordLearned={handleWordLearned}
          onClose={() => setShowFlashcards(false)}
        />
      )}

      {showChatbot && selectedMovie && (
        <ChatbotModal
          movieTitle={selectedMovie.title}
          movieOverview={selectedMovie.overview}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showInviteFriend && (
        <InviteFriendModal onClose={() => setShowInviteFriend(false)} />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
