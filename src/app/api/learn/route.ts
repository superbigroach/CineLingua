import { NextRequest, NextResponse } from 'next/server';
import { explainWord, generateMovieLearningContent, generateQuiz, recommendMoviesForLearning } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'explain': {
        const result = await explainWord(
          params.word,
          params.context,
          params.language || 'French'
        );
        return NextResponse.json(result);
      }

      case 'movie-content': {
        const result = await generateMovieLearningContent(
          params.title,
          params.overview,
          params.language || 'French'
        );
        return NextResponse.json(result);
      }

      case 'quiz': {
        const result = await generateQuiz(
          params.content,
          params.language || 'French',
          params.difficulty || 'intermediate'
        );
        return NextResponse.json(result);
      }

      case 'recommend': {
        const result = await recommendMoviesForLearning(
          params.level || 'intermediate',
          params.interests || ['drama', 'comedy'],
          params.language || 'French'
        );
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Learning API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
