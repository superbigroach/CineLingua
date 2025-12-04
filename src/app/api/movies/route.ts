import { NextRequest, NextResponse } from 'next/server';
import { getFrenchMovies, getMoviesByRegion, getMoviesByLanguage, searchMovies, getTrendingMovies } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'french';
  const region = searchParams.get('region');
  const lang = searchParams.get('lang'); // New: language code (fr, es, de, etc.)
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    let data;

    if (query) {
      // Search with specified language or default to French
      data = await searchMovies(query, lang || 'fr');
    } else if (type === 'trending') {
      data = await getTrendingMovies('week');
    } else if (region) {
      // Filter by region
      data = await getMoviesByRegion(region, page);
    } else if (lang) {
      // Get movies by language code
      data = await getMoviesByLanguage(lang, page);
    } else {
      // Default: French movies
      data = await getFrenchMovies(page);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB API error:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
