'use client';

import { useState, useEffect, useRef } from 'react';
import { Movie, FRANCOPHONE_REGIONS, getImageUrl } from '@/lib/tmdb';

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

    // Create sparkles
    for (let i = 0; i < 100; i++) {
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

        // Wrap around edges
        if (sparkle.x < 0) sparkle.x = canvas.width;
        if (sparkle.x > canvas.width) sparkle.x = 0;
        if (sparkle.y < 0) sparkle.y = canvas.height;
        if (sparkle.y > canvas.height) sparkle.y = 0;

        // Twinkle effect
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [learningContent, setLearningContent] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

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
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoadingContent(false);
    }
  }

  return (
    <main className="min-h-screen relative">
      <SparkleCanvas />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-5 bg-[rgba(5,5,8,0.85)] backdrop-blur-xl border-b border-[rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center relative">
          {/* Logo */}
          <a href="#" className="absolute left-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              CL
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Cine</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
            </span>
          </a>

          {/* Nav Links */}
          <ul className="flex gap-8 list-none">
            <li><a href="#regions" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative py-2 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500 after:transition-all">Regions</a></li>
            <li><a href="#movies" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative py-2 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500 after:transition-all">Movies</a></li>
            <li><a href="#learn" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative py-2 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500 after:transition-all">Learn</a></li>
            <li><a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative py-2 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500 after:transition-all">How It Works</a></li>
          </ul>

          {/* Sponsor Badges */}
          <div className="absolute right-6 flex items-center gap-3">
            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">TV5 Monde</span>
            <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">Google AI</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
        <div className="text-center max-w-4xl">
          {/* Animated Logo */}
          <div className="relative w-36 h-36 mx-auto mb-10">
            <div className="absolute inset-[-50px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />
            <div className="relative w-full h-full rounded-full flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
              <span className="text-6xl">🎬</span>
            </div>
          </div>

          <span className="block text-lg text-purple-400 mb-2">Welcome to</span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Cine</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            Learn French through cinema. Discover popular movies from Francophone regions worldwide
            and master the language with AI-powered tutoring.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <a href="#movies" className="btn btn-primary inline-flex items-center gap-2">
              <i className="fas fa-film" />
              Explore Movies
            </a>
            <a href="#how-it-works" className="btn btn-secondary inline-flex items-center gap-2">
              <i className="fas fa-question-circle" />
              How It Works
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce text-white/50 flex flex-col items-center gap-2">
            <div className="w-6 h-10 border-2 border-white/30 rounded-xl relative">
              <div className="w-1 h-2 bg-white/50 rounded-full absolute top-2 left-1/2 -translate-x-1/2 animate-[scroll_2s_ease-in-out_infinite]" />
            </div>
            <span className="text-xs">Scroll Down</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Region Selector Section */}
        <section id="regions" className="mb-16">
          <h2 className="section-title">
            <span className="title-number">01.</span>
            <span>Explore Francophone Regions</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedRegion('')}
              className={`glass-card p-4 text-center transition-all hover:scale-105 ${
                selectedRegion === ''
                  ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : ''
              }`}
            >
              <span className="text-3xl block mb-2">🇫🇷</span>
              <span className="text-sm font-medium">All French</span>
            </button>
            {FRANCOPHONE_REGIONS.map((region, index) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`glass-card p-4 text-center transition-all hover:scale-105 float-animation ${
                  selectedRegion === region.code
                    ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    : ''
                }`}
                style={{ animationDelay: `${-index * 0.5}s` }}
              >
                <span className="text-3xl block mb-2">{region.flag}</span>
                <span className="text-sm font-medium">{region.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trailer Player Section */}
        {selectedMovie && (
          <section id="player" className="mb-16">
            <div className="glass-card p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎬</span>
                <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>
                {selectedMovie.original_title !== selectedMovie.title && (
                  <span className="text-white/50 text-lg">({selectedMovie.original_title})</span>
                )}
              </div>

              {trailerKey ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
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
                <div className="aspect-video bg-[rgba(0,0,0,0.4)] rounded-xl flex items-center justify-center border border-white/10">
                  <div className="text-center text-white/50">
                    <p className="text-5xl mb-3">🎥</p>
                    <p className="text-lg">No trailer available</p>
                  </div>
                </div>
              )}

              <p className="text-white/70 mt-6 leading-relaxed">{selectedMovie.overview}</p>

              <div className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
                <p className="text-cyan-300 flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <span>
                    <strong className="block mb-1">Learning Tip:</strong>
                    Watch the trailer first, then review the vocabulary below. Try to listen for the words you&apos;ve learned!
                  </span>
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Grid */}
          <div className="lg:col-span-2" id="movies">
            <h2 className="section-title">
              <span className="title-number">02.</span>
              <span>
                Popular Movies
                {selectedRegion && (
                  <span className="text-cyan-400 ml-2">
                    in {FRANCOPHONE_REGIONS.find(r => r.code === selectedRegion)?.name}
                  </span>
                )}
              </span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card h-80 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {movies.slice(0, 12).map((movie, index) => (
                  <div
                    key={movie.id}
                    onClick={() => loadLearningContent(movie)}
                    className={`glass-card overflow-hidden cursor-pointer transition-all hover:scale-105 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] float-animation ${
                      selectedMovie?.id === movie.id ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : ''
                    }`}
                    style={{ animationDelay: `${-index * 0.3}s` }}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={getImageUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-sm font-medium text-white">Click to learn</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm truncate mb-1">
                        {movie.title}
                      </h3>
                      <p className="text-white/50 text-xs truncate mb-3">
                        {movie.original_title !== movie.title && movie.original_title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 text-sm flex items-center gap-1">
                          <i className="fas fa-star text-xs" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-white/40 text-xs">
                          {movie.release_date?.split('-')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Panel */}
          <div className="lg:col-span-1" id="learn">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <i className="fas fa-robot text-white" />
                </span>
                <span>AI Language Tutor</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 ml-auto">
                  Gemini
                </span>
              </h2>

              {!selectedMovie ? (
                <div className="text-center py-16 text-white/50">
                  <p className="text-5xl mb-4">👈</p>
                  <p className="text-lg">Select a movie to start learning!</p>
                </div>
              ) : loadingContent ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/50">Generating learning content...</p>
                </div>
              ) : learningContent ? (
                <div className="space-y-6">
                  {/* Selected Movie Mini Card */}
                  <div className="flex gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
                    <img
                      src={getImageUrl(selectedMovie.poster_path, 'w92')}
                      alt={selectedMovie.title}
                      className="w-14 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-white font-semibold">{selectedMovie.title}</h3>
                      <p className="text-white/50 text-sm">{selectedMovie.original_title}</p>
                    </div>
                  </div>

                  {/* Vocabulary */}
                  {learningContent.vocabulary?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-book" />
                        Vocabulary
                      </h3>
                      <div className="space-y-2">
                        {learningContent.vocabulary.slice(0, 5).map((item: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 bg-black/30 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-white font-medium">{item.word}</span>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                item.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                item.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {item.difficulty}
                              </span>
                            </div>
                            <p className="text-white/60 text-sm">{item.translation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phrases */}
                  {learningContent.phrases?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-comment" />
                        Useful Phrases
                      </h3>
                      <div className="space-y-2">
                        {learningContent.phrases.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/5">
                            <p className="text-white italic">&ldquo;{item.phrase}&rdquo;</p>
                            <p className="text-white/60 text-sm mt-2">{item.meaning}</p>
                            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                              <i className="fas fa-thumbtack" />
                              {item.usage}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cultural Context */}
                  {learningContent.culturalContext && (
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-theater-masks" />
                        Cultural Context
                      </h3>
                      <p className="text-white/70 text-sm p-4 bg-black/30 rounded-xl border border-white/5 leading-relaxed">
                        {learningContent.culturalContext}
                      </p>
                    </div>
                  )}

                  {/* Practice Questions */}
                  {learningContent.discussionQuestions?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fas fa-question-circle" />
                        Practice Questions
                      </h3>
                      <div className="space-y-2">
                        {learningContent.discussionQuestions.map((q: string, i: number) => (
                          <div key={i} className="p-4 bg-black/30 rounded-xl border border-white/5 text-white/70 text-sm">
                            {i + 1}. {q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-20">
          <h2 className="section-title">
            <span className="title-number">03.</span>
            <span>How CineLingua Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-search', title: 'Browse Movies', desc: 'Explore French films from different Francophone regions', color: 'cyan' },
              { icon: 'fa-play', title: 'Watch Trailer', desc: 'Preview the movie and hear authentic French dialogue', color: 'purple' },
              { icon: 'fa-graduation-cap', title: 'Learn Vocabulary', desc: 'AI generates key words and phrases from the movie', color: 'pink' },
              { icon: 'fa-check-circle', title: 'Watch & Understand', desc: 'Enjoy the full movie with better comprehension!', color: 'green' },
            ].map((step, index) => (
              <div
                key={index}
                className="glass-card p-8 text-center float-animation"
                style={{ animationDelay: `${-index * 0.5}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl text-white ${
                  step.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
                  step.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                  step.color === 'pink' ? 'bg-gradient-to-br from-pink-400 to-rose-500' :
                  'bg-gradient-to-br from-green-400 to-emerald-500'
                }`}>
                  <i className={`fas ${step.icon}`} />
                </div>
                <div className="text-4xl font-bold text-white/10 mb-3">{index + 1}</div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsor Integration Section */}
        <section className="mt-20">
          <h2 className="section-title">
            <span className="title-number">04.</span>
            <span>Powered By</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center float-animation">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📺</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">TV5 Monde</h3>
              <p className="text-white/60 text-sm">French content from 8 Francophone regions worldwide</p>
            </div>

            <div className="glass-card p-8 text-center float-animation" style={{ animationDelay: '-1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Google AI</h3>
              <p className="text-white/60 text-sm">Gemini-powered language tutoring with vocabulary, phrases & cultural context</p>
            </div>

            <div className="glass-card p-8 text-center float-animation" style={{ animationDelay: '-2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">▶️</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">YouTube</h3>
              <p className="text-white/60 text-sm">Embedded trailer player with French closed captions</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm mb-2">Built for Agentics TV5 Hackathon 2025</p>
          <p className="text-white/30 text-xs">
            Integrating TV5 Monde Content • Google AI (Gemini) • YouTube Trailers
          </p>
          <p className="text-purple-400 text-sm mt-4 font-medium">
            Learn French. Watch Movies. Immerse Yourself.
          </p>
        </div>
      </footer>
    </main>
  );
}
