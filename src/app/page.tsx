'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Movie, FRANCOPHONE_REGIONS, LEARNING_LANGUAGES, LearningLanguage, getImageUrl, getLanguageByCode } from '@/lib/tmdb';
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
import SceneCreatorModal from '@/components/SceneCreatorModal';

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
  const router = useRouter();

  // Core state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<LearningLanguage>(LEARNING_LANGUAGES[0]); // Default: French
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [learningContent, setLearningContent] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // User state
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Feature modals
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [showSceneCreator, setShowSceneCreator] = useState(false);

  // Quiz data
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'xp' | 'level' } | null>(null);

  // Refs
  const tutorPanelRef = useRef<HTMLDivElement>(null);

  // Check auth and redirect to login if not logged in
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (!savedUser) {
      router.push('/login');
      return;
    }
    setUser(savedUser);
    setCheckingAuth(false);
    fetchMovies();
  }, [router]);

  useEffect(() => {
    fetchMovies();
  }, [selectedRegion, selectedLanguage]);

  async function fetchMovies() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion) {
        params.set('region', selectedRegion);
      } else {
        // Use selected language code
        params.set('lang', selectedLanguage.code);
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
            language: selectedLanguage.name,
            languageCode: selectedLanguage.code,
          }),
        }),
        fetch(`/api/trailer?movieId=${movie.id}&lang=${selectedLanguage.code}`),
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
          language: selectedLanguage.name,
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

  async function handleQuizComplete(correct: number, total: number) {
    if (user) {
      const result = await recordQuizResult(user.id, correct, total);
      showToast(`+${result.xpEarned} XP${result.perfect ? ' - PERFECT!' : ''}`, result.perfect ? 'level' : 'xp');
      refreshUser();
    }
    setShowQuiz(false);
  }

  function handleWordLearned(word: string, translation: string) {
    if (user && selectedMovie) {
      recordWordLearned(user.id, word, translation, selectedMovie.id, selectedMovie.title);
      refreshUser();
    }
  }

  function handleLogin(loggedInUser: User) {
    setUser(loggedInUser);
    setShowLoginModal(false);
    showToast(`Welcome! Start learning ${selectedLanguage.name}!`, 'success');
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

  function speak(text: string, lang?: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || selectedLanguage.speechCode;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  const levelInfo = user ? getLevelFromXP(user.xp) : null;

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative bg-[#08080c]">
      <SparkleCanvas />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1800px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              CL
            </div>
            <span className="text-base font-semibold hidden sm:block tracking-tight">
              <span className="text-white">Cine</span>
              <span className="text-cyan-400">Lingua</span>
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            <a href="/studio" className="px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg text-sm transition-all">
              Studio
            </a>
            <a href="/contest" className="px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg text-sm transition-all">
              Contest
            </a>
            <a href="/wallet" className="px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg text-sm transition-all">
              Wallet
            </a>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="text-white text-xs font-medium">{user.xp}</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-white text-xs font-medium">{user.streak}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center hover:bg-white/[0.06] transition-all"
                  title="Leaderboard"
                >
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>

                <button
                  onClick={() => setShowInviteFriend(true)}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center hover:bg-white/[0.06] transition-all"
                  title="Invite"
                >
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>

                {/* User */}
                <div className="flex items-center gap-2 pl-2">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                  <div className="hidden md:block">
                    <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-white/40">Lvl {levelInfo?.level}</p>
                  </div>
                </div>

                <button onClick={handleLogout} className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center transition-all">
                  <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="h-8 px-4 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Language Bar - Fixed below nav */}
      <div className="pt-14">
        <div className="sticky top-14 z-40 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="max-w-[1800px] mx-auto px-4 py-3">
            {/* Language pills - centered grid on mobile, scroll on larger */}
            <div className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap sm:justify-start sm:overflow-x-auto scrollbar-hide">
              {LEARNING_LANGUAGES.map((lang, index) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setSelectedRegion('');
                  }}
                  className={`flex-shrink-0 h-8 px-3.5 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2 btn-press ${
                    selectedLanguage.code === lang.code
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80 border border-white/[0.04]'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Region sub-selector */}
            {selectedLanguage.regions.length > 1 && (
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.04] overflow-x-auto scrollbar-hide">
                <span className="text-[11px] text-white/30 uppercase tracking-wider mr-2 flex-shrink-0">Region</span>
                <button
                  onClick={() => setSelectedRegion('')}
                  className={`flex-shrink-0 h-7 px-3 rounded-md text-[12px] font-medium transition-all duration-200 btn-press ${
                    selectedRegion === ''
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
                >
                  All
                </button>
                {selectedLanguage.regions.map((region) => (
                  <button
                    key={region.code}
                    onClick={() => setSelectedRegion(region.code)}
                    className={`flex-shrink-0 h-7 px-3 rounded-md text-[12px] font-medium transition-all duration-200 btn-press ${
                      selectedRegion === region.code
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {region.flag} {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1800px] mx-auto px-4 py-6 pb-20">

        {/* Trailer Player Section */}
        {selectedMovie && (
          <section id="player" className="mb-8 animate-slide-up">
            <div className="bg-[#0a0a10] rounded-2xl border border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">{selectedMovie.title}</h2>
                    <p className="text-[11px] text-white/40">{selectedMovie.release_date?.split('-')[0]} • {selectedLanguage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all btn-press"
                >
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Video Player */}
                {trailerKey ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailerKey}?rel=0&cc_load_policy=1&cc_lang_pref=${selectedLanguage.code}`}
                      title={`${selectedMovie.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center border border-white/[0.04]">
                    <div className="text-center">
                      <svg className="w-10 h-10 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white/30 text-sm">No trailer available</p>
                    </div>
                  </div>
                )}

                {/* Info Panel */}
                <div className="space-y-4">
                  {/* Title translations */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-[10px] text-cyan-400/80 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                        <span>{selectedLanguage.flag}</span> {selectedLanguage.nativeName}
                      </p>
                      <p className="text-white text-sm font-medium leading-snug">
                        {selectedMovie.original_title !== selectedMovie.title
                          ? selectedMovie.original_title
                          : selectedMovie.title}
                      </p>
                    </div>
                    <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <p className="text-[10px] text-purple-400/80 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                        <span>🇬🇧</span> English
                      </p>
                      <p className="text-white text-sm font-medium leading-snug">{selectedMovie.title}</p>
                    </div>
                  </div>

                  {/* Overview */}
                  <p className="text-white/50 text-[13px] leading-relaxed line-clamp-3">{selectedMovie.overview}</p>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => user ? loadQuiz() : setShowLoginModal(true)}
                      disabled={loadingQuiz || !learningContent}
                      className="h-11 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[13px] font-medium transition-all duration-200 disabled:opacity-40 btn-press flex items-center justify-center gap-2"
                    >
                      {loadingQuiz ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      <span>Quiz</span>
                    </button>

                    <button
                      onClick={() => user ? setShowFlashcards(true) : setShowLoginModal(true)}
                      disabled={!learningContent?.vocabulary?.length}
                      className="h-11 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[13px] font-medium transition-all duration-200 disabled:opacity-40 btn-press flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Flashcards</span>
                    </button>

                    <button
                      onClick={() => user ? setShowChatbot(true) : setShowLoginModal(true)}
                      className="h-11 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-[13px] font-medium transition-all duration-200 btn-press flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Ask AI</span>
                    </button>

                    <button
                      onClick={() => user ? setShowSceneCreator(true) : setShowLoginModal(true)}
                      disabled={!learningContent}
                      className="h-11 px-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-xl text-[13px] font-medium text-orange-300 transition-all duration-200 disabled:opacity-40 btn-press flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Create Scene</span>
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
              <span className="text-purple-400 text-sm">{selectedLanguage.flag}</span>
              <span>Popular {selectedLanguage.name} Movies</span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-2xl overflow-hidden">
                    <div className="aspect-[3/4] bg-white/[0.02] animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-white/[0.04] rounded-lg animate-pulse" />
                      <div className="h-3 bg-white/[0.03] rounded-lg w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4">
                {movies.slice(0, 16).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => loadLearningContent(movie)}
                    className={`group bg-white/[0.02] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border ${
                      selectedMovie?.id === movie.id
                        ? 'border-cyan-500/40 bg-cyan-500/[0.05] shadow-lg shadow-cyan-500/10'
                        : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Poster - shorter aspect ratio */}
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={getImageUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Info section - taller */}
                    <div className="p-4">
                      <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 mb-3">{movie.title}</h3>

                      {/* Rating bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span className="text-white font-semibold text-sm">{movie.vote_average.toFixed(1)}</span>
                          </div>
                          <span className="text-white/30 text-xs">{movie.release_date?.split('-')[0]}</span>
                        </div>

                        {/* Rating progress bar */}
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                            style={{ width: `${(movie.vote_average / 10) * 100}%` }}
                          />
                        </div>

                        {/* Language badge */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">
                            {movie.original_language}
                          </span>
                          {selectedMovie?.id === movie.id && (
                            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
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
                    <div className="pt-2 border-t border-white/10 grid grid-cols-4 gap-2">
                      <button
                        onClick={() => user ? loadQuiz() : setShowLoginModal(true)}
                        disabled={loadingQuiz}
                        className="p-2 bg-purple-500/10 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all text-center"
                      >
                        <i className="fas fa-brain text-sm block mb-1"></i>
                        <span className="text-[10px]">Quiz</span>
                      </button>
                      <button
                        onClick={() => user ? setShowFlashcards(true) : setShowLoginModal(true)}
                        className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-all text-center"
                      >
                        <i className="fas fa-layer-group text-sm block mb-1"></i>
                        <span className="text-[10px]">Cards</span>
                      </button>
                      <button
                        onClick={() => user ? setShowChatbot(true) : setShowLoginModal(true)}
                        className="p-2 bg-green-500/10 rounded-lg text-green-400 hover:bg-green-500/20 transition-all text-center"
                      >
                        <i className="fas fa-robot text-sm block mb-1"></i>
                        <span className="text-[10px]">Chat</span>
                      </button>
                      <button
                        onClick={() => user ? setShowSceneCreator(true) : setShowLoginModal(true)}
                        className="p-2 bg-orange-500/10 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all text-center"
                      >
                        <i className="fas fa-film text-sm block mb-1"></i>
                        <span className="text-[10px]">Scene</span>
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
          <p className="text-white/40 text-xs mb-1">
            Currently learning: <span className="text-cyan-400">{selectedLanguage.flag} {selectedLanguage.name} ({selectedLanguage.nativeName})</span>
          </p>
          <p className="text-white/40 text-xs">Built for Agentics TV5 Hackathon 2025</p>
          <p className="text-purple-400 text-xs font-medium">
            Powered by Google Gemini AI
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} language={selectedLanguage.code} />
      )}

      {showQuiz && quizQuestions.length > 0 && selectedMovie && (
        <QuizModal
          questions={quizQuestions}
          movieTitle={selectedMovie.title}
          language={selectedLanguage.name}
          languageCode={selectedLanguage.code}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {showFlashcards && learningContent?.vocabulary && selectedMovie && (
        <FlashcardModal
          vocabulary={learningContent.vocabulary}
          movieTitle={selectedMovie.title}
          language={selectedLanguage.name}
          speechCode={selectedLanguage.speechCode}
          onWordLearned={handleWordLearned}
          onClose={() => setShowFlashcards(false)}
        />
      )}

      {showChatbot && selectedMovie && (
        <ChatbotModal
          movieTitle={selectedMovie.title}
          movieOverview={selectedMovie.overview}
          language={selectedLanguage.name}
          languageCode={selectedLanguage.code}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showInviteFriend && (
        <InviteFriendModal onClose={() => setShowInviteFriend(false)} />
      )}

      {showSceneCreator && selectedMovie && (
        <SceneCreatorModal
          movieTitle={selectedMovie.title}
          movieId={selectedMovie.id}
          movieOverview={selectedMovie.overview}
          language={selectedLanguage.name}
          languageCode={selectedLanguage.code}
          onClose={() => setShowSceneCreator(false)}
          onSceneCreated={(sceneData) => {
            console.log('Scene created:', sceneData);
            showToast('Scene submitted! Check the contest page.', 'success');
            setShowSceneCreator(false);
          }}
        />
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
