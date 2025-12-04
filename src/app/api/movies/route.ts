import { NextRequest, NextResponse } from 'next/server';
import { getFrenchMovies, getMoviesByRegion, searchMovies, getTrendingMovies } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'french';
  const region = searchParams.get('region') as 'FR' | 'BE' | 'CA' | 'CH' | 'SN' | 'MA' | null;
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    let data;

    if (query) {
      data = await searchMovies(query, 'fr');
    } else if (type === 'trending') {
      data = await getTrendingMovies('week');
    } else if (region) {
      data = await getMoviesByRegion(region, page);
    } else {
      data = await getFrenchMovies(page);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB API error:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
