import { NextRequest, NextResponse } from 'next/server';
import { generateMovieIngredients, enhanceScenePrompt, validateScenePrompt } from '@/lib/sceneChallenge';
import { judgeSubmission } from '@/lib/veo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'generate-ingredients': {
        const { movieTitle, movieOverview, language, languageCode } = body;

        if (!movieTitle || !language) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const result = await generateMovieIngredients(
          movieTitle,
          movieOverview || '',
          language,
          languageCode || 'fr'
        );

        return NextResponse.json({
          theme: {
            theme: result.theme.theme,
            mood: result.theme.mood,
            visualStyle: result.theme.visualStyle,
          },
          ingredients: result.theme.ingredients,
          quiz: result.quiz,
        });
      }

      case 'enhance-prompt': {
        const { userPrompt, ingredients, theme, language } = body;

        if (!userPrompt || !ingredients || !theme) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Validate prompt contains required words
        const validation = validateScenePrompt(userPrompt, ingredients);

        if (!validation.valid) {
          return NextResponse.json({
            error: 'Prompt must contain at least 3 unlocked ingredients',
            validation,
          }, { status: 400 });
        }

        // Enhance the prompt
        const enhanced = await enhanceScenePrompt(
          userPrompt,
          validation.usedIngredients,
          theme,
          language
        );

        return NextResponse.json({
          enhancedPrompt: enhanced.enhancedPrompt,
          variations: enhanced.variations,
          dialogue: enhanced.dialogue,
          usedIngredients: validation.usedIngredients,
        });
      }

      case 'judge-submission': {
        const { prompt, requiredWords, language, videoDescription } = body;

        if (!prompt || !requiredWords || !language) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const scores = await judgeSubmission({
          prompt,
          requiredWords,
          language,
          videoDescription: videoDescription || prompt,
        });

        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

        return NextResponse.json({
          scores,
          totalScore,
          maxScore: 30,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scene challenge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
