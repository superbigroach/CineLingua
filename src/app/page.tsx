'use client';

import { useState, useEffect } from 'react';
import { Movie, FRANCOPHONE_REGIONS, getImageUrl } from '@/lib/tmdb';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [learningContent, setLearningContent] = useState<any>(null);
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
    try {
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'movie-content',
          title: movie.original_title || movie.title,
          overview: movie.overview,
        }),
      });
      const data = await res.json();
      setLearningContent(data);
    } catch (error) {
      console.error('Failed to load learning content:', error);
    } finally {
      setLoadingContent(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎬</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CineLingua
                </h1>
                <p className="text-xs text-gray-400">Learn French Through Cinema</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="px-2 py-1 bg-blue-500/20 rounded">TV5 Monde</span>
              <span className="px-2 py-1 bg-green-500/20 rounded">Google AI</span>
              <span className="px-2 py-1 bg-orange-500/20 rounded">Kaltura</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Region Selector - TV5 Integration */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            🌍 Explore Francophone Regions (TV5 Monde)
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('')}
              className={`px-4 py-2 rounded-full transition ${
                selectedRegion === ''
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🇫🇷 All French
            </button>
            {FRANCOPHONE_REGIONS.map((region) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedRegion === region.code
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {region.flag} {region.name}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">
              🎥 Popular Movies {selectedRegion && `in ${FRANCOPHONE_REGIONS.find(r => r.code === selectedRegion)?.name}`}
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {movies.slice(0, 12).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => loadLearningContent(movie)}
                    className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-purple-500 ${
                      selectedMovie?.id === movie.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <img
                      src={getImageUrl(movie.poster_path, 'w342')}
                      alt={movie.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm truncate">
                        {movie.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {movie.original_title !== movie.title && movie.original_title}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-yellow-400 text-xs">
                          ⭐ {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {movie.release_date?.split('-')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Panel - Google AI Integration */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🤖</span>
                <span>AI Language Tutor</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                  Gemini
                </span>
              </h2>

              {!selectedMovie ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">👈</p>
                  <p>Select a movie to start learning!</p>
                </div>
              ) : loadingContent ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-4xl">🔄</div>
                  <p className="text-gray-400 mt-4">Generating learning content...</p>
                </div>
              ) : learningContent ? (
                <div className="space-y-6">
                  {/* Selected Movie */}
                  <div className="flex gap-3 bg-gray-900/50 rounded-lg p-3">
                    <img
                      src={getImageUrl(selectedMovie.poster_path, 'w92')}
                      alt={selectedMovie.title}
                      className="w-16 h-24 rounded object-cover"
                    />
                    <div>
                      <h3 className="text-white font-medium">{selectedMovie.title}</h3>
                      <p className="text-gray-400 text-sm">{selectedMovie.original_title}</p>
                    </div>
                  </div>

                  {/* Vocabulary */}
                  {learningContent.vocabulary?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2">📚 Vocabulary</h3>
                      <div className="space-y-2">
                        {learningContent.vocabulary.slice(0, 5).map((item: any, i: number) => (
                          <div
                            key={i}
                            className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900 transition"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-white font-medium">{item.word}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                item.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {item.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{item.translation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phrases */}
                  {learningContent.phrases?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2">💬 Useful Phrases</h3>
                      <div className="space-y-2">
                        {learningContent.phrases.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="bg-gray-900/50 rounded-lg p-3">
                            <p className="text-white italic">&ldquo;{item.phrase}&rdquo;</p>
                            <p className="text-gray-400 text-sm mt-1">{item.meaning}</p>
                            <p className="text-gray-500 text-xs mt-1">📌 {item.usage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cultural Context */}
                  {learningContent.culturalContext && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2">🎭 Cultural Context</h3>
                      <p className="text-gray-300 text-sm bg-gray-900/50 rounded-lg p-3">
                        {learningContent.culturalContext}
                      </p>
                    </div>
                  )}

                  {/* Discussion Questions */}
                  {learningContent.discussionQuestions?.length > 0 && (
                    <div>
                      <h3 className="text-purple-400 font-medium mb-2">❓ Practice Questions</h3>
                      <div className="space-y-2">
                        {learningContent.discussionQuestions.map((q: string, i: number) => (
                          <div key={i} className="bg-gray-900/50 rounded-lg p-3 text-gray-300 text-sm">
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

        {/* Kaltura Section - Video Player Placeholder */}
        <section className="mt-12 bg-gray-800/50 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">📺 Video Learning (Kaltura Integration)</h2>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">Coming Soon</span>
          </div>
          <p className="text-gray-400 mb-4">
            Interactive video player with dual subtitles, clickable vocabulary, and learning checkpoints.
          </p>
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-6xl mb-4">🎬</p>
              <p>Kaltura Player Integration</p>
              <p className="text-sm">Watch French content with interactive learning features</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-black/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Built for Agentics TV5 Hackathon 2025</p>
          <p className="mt-1">
            Integrating TV5 Monde • Google AI (Gemini) • Kaltura
          </p>
        </div>
      </footer>
    </main>
  );
}
