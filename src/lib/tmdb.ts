// TMDB API - FREE (https://www.themoviedb.org/settings/api)
// Multi-language movie discovery for language learning

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

// Supported languages for learning (Gemini works great with all these)
export interface LearningLanguage {
  code: string;          // ISO 639-1 code for TMDB
  name: string;          // Display name
  nativeName: string;    // Name in the language itself
  flag: string;          // Emoji flag
  speechCode: string;    // Web Speech API code
  regions: { code: string; name: string; flag: string }[];
}

export const LEARNING_LANGUAGES: LearningLanguage[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
    regions: [
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
      { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
      { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
    ],
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechCode: 'es-ES',
    regions: [
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
      { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
      { code: 'PE', name: 'Peru', flag: '🇵🇪' },
      { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    ],
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    speechCode: 'de-DE',
    regions: [
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'AT', name: 'Austria', flag: '🇦🇹' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    ],
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    speechCode: 'it-IT',
    regions: [
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    ],
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    speechCode: 'pt-PT',
    regions: [
      { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    ],
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
    regions: [
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    ],
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    speechCode: 'ko-KR',
    regions: [
      { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    ],
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    speechCode: 'zh-CN',
    regions: [
      { code: 'CN', name: 'China', flag: '🇨🇳' },
      { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
      { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    ],
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    speechCode: 'hi-IN',
    regions: [
      { code: 'IN', name: 'India', flag: '🇮🇳' },
    ],
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    speechCode: 'ar-SA',
    regions: [
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: 'AE', name: 'UAE', flag: '🇦🇪' },
      { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
    ],
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechCode: 'ru-RU',
    regions: [
      { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    ],
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    speechCode: 'tr-TR',
    regions: [
      { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    ],
  },
];

// Get movies by language
export async function getMoviesByLanguage(langCode: string, page = 1): Promise<TMDBResponse> {
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${langCode}&sort_by=popularity.desc&page=${page}`
  );
  return res.json();
}

// Get popular French movies (default - TV5 Monde content area)
export async function getFrenchMovies(page = 1): Promise<TMDBResponse> {
  return getMoviesByLanguage('fr', page);
}

// Get popular movies by region
export async function getMoviesByRegion(
  region: string,
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

// Legacy: Francophone regions (TV5 Monde coverage)
export const FRANCOPHONE_REGIONS = LEARNING_LANGUAGES[0].regions;

export function getImageUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder-movie.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Get movie videos (trailers from YouTube) - PRIORITIZE target language
export async function getMovieVideos(movieId: number, langCode = 'fr') {
  // Language-specific speech codes for TMDB
  const langMap: Record<string, string> = {
    'fr': 'fr-FR', 'es': 'es-ES', 'de': 'de-DE', 'it': 'it-IT',
    'pt': 'pt-PT', 'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN',
    'hi': 'hi-IN', 'ar': 'ar-SA', 'ru': 'ru-RU', 'tr': 'tr-TR'
  };

  const tmdbLang = langMap[langCode] || `${langCode}-${langCode.toUpperCase()}`;

  // First try to get target language videos specifically
  const langRes = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=${tmdbLang}`
  );
  const langData = await langRes.json();
  const langVideos = langData.results || [];

  // Then get all videos as fallback
  const allRes = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
  );
  const allData = await allRes.json();
  const allVideos = allData.results || [];

  // Combine and dedupe
  const combinedVideos = [...langVideos, ...allVideos.filter((v: any) => !langVideos.some((lv: any) => lv.id === v.id))];

  // Priority order:
  // 1. Target language trailer
  // 2. Target language teaser
  // 3. Target language clip
  // 4. Any target language video
  // 5. Any trailer
  // 6. Any video

  const targetTrailer = combinedVideos.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.iso_639_1 === langCode
  );
  const targetTeaser = combinedVideos.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Teaser' && v.iso_639_1 === langCode
  );
  const targetClip = combinedVideos.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Clip' && v.iso_639_1 === langCode
  );
  const anyTargetVideo = combinedVideos.find(
    (v: any) => v.site === 'YouTube' && v.iso_639_1 === langCode
  );
  const anyTrailer = combinedVideos.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  const anyVideo = combinedVideos.find((v: any) => v.site === 'YouTube');

  const selected = targetTrailer || targetTeaser || targetClip || anyTargetVideo || anyTrailer || anyVideo || null;

  // Add flag to indicate if it's in target language
  if (selected) {
    selected.isTargetLanguage = selected.iso_639_1 === langCode;
  }

  return selected;
}

// Helper to get language by code
export function getLanguageByCode(code: string): LearningLanguage | undefined {
  return LEARNING_LANGUAGES.find(l => l.code === code);
}
