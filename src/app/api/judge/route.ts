import { NextRequest, NextResponse } from 'next/server';
import { judgeEntry, judgeContest, JudgeEntryRequest } from '@/lib/aiJudges';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for video analysis

/**
 * POST /api/judge
 *
 * Judge a single entry or entire contest
 *
 * Body for single entry:
 * {
 *   "action": "judge_entry",
 *   "entry": { id, userName, movieTitle, prompt, videoUrl?, usedVocabulary, targetLanguage }
 * }
 *
 * Body for full contest:
 * {
 *   "action": "judge_contest",
 *   "contestId": "...",
 *   "entries": [...],
 *   "prizePool": 100
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'judge_entry') {
      // Judge a single entry
      const { entry } = body as { entry: JudgeEntryRequest };

      if (!entry || !entry.id || !entry.userName) {
        return NextResponse.json(
          { error: 'Missing required entry fields' },
          { status: 400 }
        );
      }

      const result = await judgeEntry({
        id: entry.id,
        userName: entry.userName,
        movieTitle: entry.movieTitle || 'Unknown Movie',
        prompt: entry.prompt || '',
        videoUrl: entry.videoUrl,
        usedVocabulary: entry.usedVocabulary || [],
        targetLanguage: entry.targetLanguage || 'French',
      });

      return NextResponse.json({
        success: true,
        result,
      });

    } else if (action === 'judge_contest') {
      // Judge entire contest
      const { contestId, entries, prizePool } = body;

      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return NextResponse.json(
          { error: 'No entries to judge' },
          { status: 400 }
        );
      }

      const results = await judgeContest(entries, prizePool || 0);

      return NextResponse.json({
        success: true,
        contestId,
        results,
        summary: {
          totalEntries: results.length,
          prizePool,
          winnersPool: prizePool * 0.8,
          platformFee: prizePool * 0.2,
          topScore: results[0]?.totalScore || 0,
          averageScore: results.reduce((sum, r) => sum + r.totalScore, 0) / results.length,
        },
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "judge_entry" or "judge_contest"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Judging API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to judge' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/judge?action=test
 *
 * Test the judging system with a sample entry
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'test') {
    // Run a test judging
    const testEntry = {
      id: 'test-entry-1',
      userName: 'Test User',
      movieTitle: 'Amélie',
      prompt: 'A whimsical scene in a Montmartre café where a young woman discovers a mysterious box of old photographs',
      usedVocabulary: ['rêveur', 'café', 'mystère', 'souvenir'],
      targetLanguage: 'French',
    };

    try {
      const result = await judgeEntry(testEntry);
      return NextResponse.json({
        success: true,
        message: 'Test judging complete',
        result,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    endpoints: {
      'POST /api/judge': {
        actions: ['judge_entry', 'judge_contest'],
        description: 'Judge entries using AI panel',
      },
      'GET /api/judge?action=test': {
        description: 'Test the judging system',
      },
    },
    judges: ['Le Cinéaste (Visual)', 'Le Linguiste (Language)', 'Le Public (Entertainment)'],
    scoring: 'Each judge scores 0-10, total max 30',
  });
}
