// TMDB API - FREE (https://www.themoviedb.org/settings/api)
// TV5 content integration through French language movies

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Get popular French movies (TV5 Monde content area)
export async function getFrenchMovies(page = 1): Promise<TMDBResponse> {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=fr&sort_by=popularity.desc&page=${page}`
  );
  return res.json();
}

// Get popular movies by region (simulating TV5's global reach)
export async function getMoviesByRegion(
  region: 'FR' | 'BE' | 'CA' | 'CH' | 'SN' | 'MA',
  page = 1
): Promise<TMDBResponse> {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&region=${region}&sort_by=popularity.desc&page=${page}`
  );
  return res.json();
}

// Search movies with language filter
export async function searchMovies(
  query: string,
  language = 'fr'
): Promise<TMDBResponse> {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}`
  );
  return res.json();
}

// Get movie details with translations
export async function getMovieDetails(movieId: number) {
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=translations,credits,videos`
  );
  return res.json();
}

// Get trending movies globally
export async function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBResponse> {
  const res = await fetch(
    `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
  );
  return res.json();
}

// Get available languages
export async function getLanguages() {
  const res = await fetch(
    `${TMDB_BASE_URL}/configuration/languages?api_key=${TMDB_API_KEY}`
  );
  return res.json();
}

// Francophone regions (TV5 Monde coverage)
export const FRANCOPHONE_REGIONS = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CA', name: 'Canada (Quebec)', flag: '🇨🇦' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
];

export function getImageUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder-movie.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
