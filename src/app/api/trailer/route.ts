import { NextRequest, NextResponse } from 'next/server';
import { getMovieVideos } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const movieId = searchParams.get('movieId');

  if (!movieId) {
    return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
  }

  try {
    const video = await getMovieVideos(parseInt(movieId));

    if (video) {
      return NextResponse.json({
        key: video.key, // YouTube video ID
        name: video.name,
        type: video.type,
        language: video.iso_639_1,
      });
    }

    return NextResponse.json({ error: 'No trailer found' }, { status: 404 });
  } catch (error) {
    console.error('Trailer API error:', error);
    return NextResponse.json({ error: 'Failed to fetch trailer' }, { status: 500 });
  }
}
