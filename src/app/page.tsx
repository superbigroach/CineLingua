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
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-[rgba(5,5,8,0.9)] backdrop-blur-xl border-b border-[rgba(6,182,212,0.1)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              CL
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Cine</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
            </span>
          </a>

          {/* Nav Links */}
          <ul className="hidden md:flex gap-8 list-none">
            <li><a href="#regions" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Regions</a></li>
            <li><a href="#movies" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Movies</a></li>
            <li><a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">How It Works</a></li>
          </ul>

          {/* Sponsor Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">TV5</span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30">Gemini</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Icon */}
          <div className="relative w-28 h-28 mb-8">
            <div className="absolute inset-[-30px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.2)_0%,transparent_70%)] animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <i className="fas fa-film text-white text-4xl"></i>
            </div>
          </div>

          <p className="text-purple-400 mb-2 text-sm uppercase tracking-wider">Welcome to</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-white">Cine</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mb-8">
            Learn French through cinema. Discover movies from Francophone regions and master the language with AI tutoring.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#movies" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5">
              <i className="fas fa-play mr-2"></i>
              Explore Movies
            </a>
            <a href="#how-it-works" className="px-6 py-3 bg-white/5 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all">
              <i className="fas fa-info-circle mr-2"></i>
              How It Works
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Region Selector Section */}
        <section id="regions" className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="text-purple-400 text-sm">01.</span>
            <span>Explore Francophone Regions</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
            <button
              onClick={() => setSelectedRegion('')}
              className={`p-3 rounded-xl text-center transition-all hover:scale-105 border ${
                selectedRegion === ''
                  ? 'border-cyan-500/50 bg-cyan-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="block text-xs font-bold text-cyan-400">FR</span>
              <span className="block text-[10px] text-white/60 mt-1">All French</span>
            </button>
            {FRANCOPHONE_REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`p-3 rounded-xl text-center transition-all hover:scale-105 border ${
                  selectedRegion === region.code
                    ? 'border-cyan-500/50 bg-cyan-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="block text-xs font-bold text-white">{region.code}</span>
                <span className="block text-[10px] text-white/60 mt-1 truncate">{region.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trailer Player Section */}
        {selectedMovie && (
          <section id="player" className="mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <i className="fas fa-film text-cyan-400"></i>
                <h2 className="text-xl font-bold">{selectedMovie.title}</h2>
                {selectedMovie.original_title !== selectedMovie.title && (
                  <span className="text-white/50 text-sm">({selectedMovie.original_title})</span>
                )}
              </div>

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
                    <i className="fas fa-video-slash text-4xl mb-2"></i>
                    <p>No trailer available</p>
                  </div>
                </div>
              )}

              <p className="text-white/60 mt-4 text-sm">{selectedMovie.overview}</p>

              <div className="mt-4 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <p className="text-cyan-300 text-sm">
                  <i className="fas fa-lightbulb mr-2"></i>
                  <strong>Tip:</strong> Watch the trailer, then review vocabulary in the AI Tutor panel!
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Grid */}
          <div className="lg:col-span-2" id="movies">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="text-purple-400 text-sm">02.</span>
              <span>
                Popular Movies
                {selectedRegion && (
                  <span className="text-cyan-400 ml-2 text-base font-normal">
                    in {FRANCOPHONE_REGIONS.find(r => r.code === selectedRegion)?.name}
                  </span>
                )}
              </span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {movies.slice(0, 12).map((movie) => (
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
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm truncate">
                        {movie.title}
                      </h3>
                      <p className="text-white/40 text-xs truncate">
                        {movie.original_title !== movie.title && movie.original_title}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-amber-400 text-xs">
                          <i className="fas fa-star mr-1"></i>
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-white/30 text-xs">
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
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <span>AI Language Tutor</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 ml-auto">
                  Gemini
                </span>
              </h2>

              {!selectedMovie ? (
                <div className="text-center py-12 text-white/40">
                  <i className="fas fa-hand-point-left text-4xl mb-3"></i>
                  <p>Select a movie to start learning!</p>
                </div>
              ) : loadingContent ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-white/40 text-sm">Generating content...</p>
                </div>
              ) : learningContent ? (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Selected Movie */}
                  <div className="flex gap-3 p-3 bg-black/30 rounded-xl">
                    <img
                      src={getImageUrl(selectedMovie.poster_path, 'w92')}
                      alt={selectedMovie.title}
                      className="w-12 h-16 rounded object-cover"
                    />
                    <div>
                      <h3 className="text-white font-medium text-sm">{selectedMovie.title}</h3>
                      <p className="text-white/40 text-xs">{selectedMovie.original_title}</p>
                    </div>
                  </div>

                  {/* Vocabulary */}
                  {learningContent.vocabulary?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2 text-sm flex items-center gap-2">
                        <i className="fas fa-book"></i>
                        Vocabulary
                      </h3>
                      <div className="space-y-2">
                        {learningContent.vocabulary.slice(0, 5).map((item: any, i: number) => (
                          <div key={i} className="p-3 bg-black/30 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-white font-medium text-sm">{item.word}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                item.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                item.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {item.difficulty}
                              </span>
                            </div>
                            <p className="text-white/50 text-xs">{item.translation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phrases */}
                  {learningContent.phrases?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2 text-sm flex items-center gap-2">
                        <i className="fas fa-comment"></i>
                        Useful Phrases
                      </h3>
                      <div className="space-y-2">
                        {learningContent.phrases.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="p-3 bg-black/30 rounded-lg">
                            <p className="text-white italic text-sm">&ldquo;{item.phrase}&rdquo;</p>
                            <p className="text-white/50 text-xs mt-1">{item.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cultural Context */}
                  {learningContent.culturalContext && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2 text-sm flex items-center gap-2">
                        <i className="fas fa-theater-masks"></i>
                        Cultural Context
                      </h3>
                      <p className="text-white/60 text-xs p-3 bg-black/30 rounded-lg leading-relaxed">
                        {learningContent.culturalContext}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-16">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="text-purple-400 text-sm">03.</span>
            <span>How CineLingua Works</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'fa-search', title: 'Browse', desc: 'Explore French films from Francophone regions', color: 'from-cyan-400 to-blue-500' },
              { icon: 'fa-play', title: 'Watch', desc: 'Preview trailers with French dialogue', color: 'from-purple-400 to-pink-500' },
              { icon: 'fa-graduation-cap', title: 'Learn', desc: 'AI generates vocabulary & phrases', color: 'from-pink-400 to-rose-500' },
              { icon: 'fa-check-circle', title: 'Understand', desc: 'Enjoy movies with comprehension!', color: 'from-green-400 to-emerald-500' },
            ].map((step, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-5 text-center border border-white/10 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-br ${step.color}`}>
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <div className="text-3xl font-bold text-white/10 mb-1">{index + 1}</div>
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-white/50 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Powered By */}
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="text-purple-400 text-sm">04.</span>
            <span>Powered By</span>
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-tv text-white"></i>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">TV5 Monde</h3>
              <p className="text-white/50 text-xs">French content from 8 Francophone regions</p>
            </div>

            <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-3 flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Google AI</h3>
              <p className="text-white/50 text-xs">Gemini-powered language tutoring</p>
            </div>

            <div className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 mx-auto mb-3 flex items-center justify-center">
                <i className="fab fa-youtube text-white"></i>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">YouTube</h3>
              <p className="text-white/50 text-xs">Trailers with French captions</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/40 text-sm mb-1">Built for Agentics TV5 Hackathon 2025</p>
          <p className="text-purple-400 text-sm font-medium">
            Learn French. Watch Movies. Immerse Yourself.
          </p>
        </div>
      </footer>
    </main>
  );
}
