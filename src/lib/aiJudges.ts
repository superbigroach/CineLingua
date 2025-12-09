// AI Video Judging System
// Uses Gemini 2.0 Flash with video understanding to score contest entries

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================
// JUDGE PERSONAS & CRITERIA
// ============================================

export interface JudgePersona {
  id: string;
  name: string;
  title: string;
  emoji: string;
  specialty: string;
  criteria: string[];
  personality: string;
  catchphrase: string;
}

export const AI_JUDGES: Record<string, JudgePersona> = {
  cinematographer: {
    id: 'cinematographer',
    name: 'Le Cinéaste',
    title: 'Legendary Film Director',
    emoji: '🎬',
    specialty: 'Visual storytelling and cinematic technique',
    criteria: [
      'Visual composition and framing',
      'Lighting and color palette',
      'Camera movement and flow',
      'Mood and atmosphere',
      'Visual storytelling clarity',
    ],
    personality: 'Exacting perfectionist with an eye for visual poetry. References classic French cinema.',
    catchphrase: 'The camera never lies, but it can dream...',
  },
  linguist: {
    id: 'linguist',
    name: 'Le Linguiste',
    title: 'Académie Française Member',
    emoji: '🗣️',
    specialty: 'Language authenticity and cultural accuracy',
    criteria: [
      'Correct usage of vocabulary words',
      'Cultural authenticity',
      'Natural integration of language',
      'Educational value',
      'Creative use of expressions',
    ],
    personality: 'Passionate guardian of the French language. Values elegance and precision.',
    catchphrase: 'Each word is a brushstroke on the canvas of meaning.',
  },
  audience: {
    id: 'audience',
    name: 'Le Public',
    title: 'Festival Enthusiast',
    emoji: '🎭',
    specialty: 'Entertainment value and emotional impact',
    criteria: [
      'Emotional engagement',
      'Creativity and originality',
      'Entertainment value',
      'Memorable moments',
      'Overall impression',
    ],
    personality: 'Loves being surprised, moved, and entertained. Represents the everyday viewer.',
    catchphrase: 'Cinema is meant to make you FEEL something!',
  },
};

// ============================================
// SCORE STRUCTURE
// ============================================

export interface JudgeScore {
  judgeId: string;
  score: number;           // 0-10, one decimal place
  feedback: string;        // 2-3 sentences of critique
  highlights: string;      // What they loved
  improvements: string;    // What could be better
  thoughts: string[];      // Live "thinking" messages for the show
}

export interface FullJudgingResult {
  entryId: string;
  userName: string;
  movieTitle: string;
  scores: {
    cinematographer: JudgeScore;
    linguist: JudgeScore;
    audience: JudgeScore;
  };
  totalScore: number;      // Sum of all 3 judges (max 30)
  averageScore: number;    // Average (max 10)
  rank?: number;
  prize?: number;
  judgedAt: Date;
}

// ============================================
// VIDEO ANALYSIS FUNCTIONS
// ============================================

/**
 * Have a single AI judge analyze a video
 * Uses Gemini 2.0 Flash's video understanding capabilities
 */
export async function judgeVideoWithPersona(
  videoUrl: string,
  judgeId: keyof typeof AI_JUDGES,
  context: {
    movieTitle: string;
    originalPrompt: string;
    usedVocabulary: string[];
    targetLanguage: string;
  }
): Promise<JudgeScore> {
  const judge = AI_JUDGES[judgeId];
  // Gemini 2.5 Flash has excellent video understanding
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const systemPrompt = `You are ${judge.name}, ${judge.title}.
PERSONALITY: ${judge.personality}
YOUR CATCHPHRASE: "${judge.catchphrase}"

You are judging an AI-generated video for a language learning contest called CinéScene.

CONTEXT:
- Movie Inspiration: "${context.movieTitle}"
- Target Language: ${context.targetLanguage}
- User's Scene Prompt: "${context.originalPrompt}"
- Vocabulary Words They Had to Include: ${context.usedVocabulary.join(', ')}

YOUR SPECIALTY: ${judge.specialty}

CRITERIA YOU JUDGE (each worth up to 2 points, total 10):
${judge.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Watch the video carefully and provide your expert judgment.

Respond in JSON format:
{
  "score": 7.5,
  "feedback": "Your 2-3 sentence critique in character as ${judge.name}",
  "highlights": "What you specifically loved (1-2 things)",
  "improvements": "One constructive suggestion",
  "thoughts": [
    "*adjusts monocle* Hmm, interesting choice...",
    "I see what they were going for with the lighting...",
    "The use of '${context.usedVocabulary[0] || 'vocabulary'}' was ${Math.random() > 0.5 ? 'quite elegant' : 'effective'}...",
    "*nods* ${Math.random() > 0.5 ? 'Impressive' : 'I have my verdict'}..."
  ]
}

IMPORTANT SCORING GUIDELINES:
- 9-10: Exceptional, professional quality
- 7-8: Very good, minor issues only
- 5-6: Decent, room for improvement
- 3-4: Below average, significant issues
- 1-2: Poor execution
- Be fair but critical. Most entries should score 5-8.
- Stay in character throughout your feedback!`;

  try {
    // For video analysis, we need to handle the video URL
    // Gemini can analyze videos via URL or uploaded file
    const result = await model.generateContent([
      systemPrompt,
      {
        fileData: {
          mimeType: 'video/mp4',
          fileUri: videoUrl,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        judgeId,
        score: Math.min(10, Math.max(0, parseFloat(data.score) || 7)),
        feedback: data.feedback || 'Intriguing work.',
        highlights: data.highlights || 'Creative approach.',
        improvements: data.improvements || 'Keep experimenting.',
        thoughts: data.thoughts || getDefaultThoughts(judgeId),
      };
    }
  } catch (error) {
    console.error(`Judge ${judgeId} failed to analyze video:`, error);
  }

  // Fallback if video analysis fails - analyze based on prompt/context
  return await judgeFromPromptOnly(judgeId, context);
}

/**
 * Fallback: Judge based on prompt and context when video isn't accessible
 */
async function judgeFromPromptOnly(
  judgeId: keyof typeof AI_JUDGES,
  context: {
    movieTitle: string;
    originalPrompt: string;
    usedVocabulary: string[];
    targetLanguage: string;
  }
): Promise<JudgeScore> {
  const judge = AI_JUDGES[judgeId];
  // Gemini 2.5 Flash has excellent video understanding
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  const prompt = `You are ${judge.name}, ${judge.title}.
PERSONALITY: ${judge.personality}

You are judging a scene CONCEPT for a language learning video contest.
(Note: You're evaluating the creative concept, not the actual video)

CONTEXT:
- Movie Inspiration: "${context.movieTitle}"
- Target Language: ${context.targetLanguage}
- User's Scene Prompt: "${context.originalPrompt}"
- Vocabulary Words Included: ${context.usedVocabulary.join(', ')}

Score this concept on a scale of 1-10 based on:
${judge.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Respond in JSON:
{
  "score": 7.0,
  "feedback": "Your critique as ${judge.name}",
  "highlights": "What you love about this concept",
  "improvements": "One suggestion",
  "thoughts": ["thought 1", "thought 2", "thought 3", "final verdict"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        judgeId,
        score: Math.min(10, Math.max(0, parseFloat(data.score) || 6.5)),
        feedback: data.feedback || 'Creative concept.',
        highlights: data.highlights || 'Good effort.',
        improvements: data.improvements || 'Continue developing.',
        thoughts: data.thoughts || getDefaultThoughts(judgeId),
      };
    }
  } catch (error) {
    console.error(`Fallback judging failed for ${judgeId}:`, error);
  }

  // Ultimate fallback
  return {
    judgeId,
    score: 6 + Math.random() * 2,
    feedback: `An interesting interpretation of ${context.movieTitle}.`,
    highlights: `Creative use of ${context.usedVocabulary[0] || 'vocabulary'}.`,
    improvements: 'Consider adding more visual storytelling elements.',
    thoughts: getDefaultThoughts(judgeId),
  };
}

function getDefaultThoughts(judgeId: string): string[] {
  const defaults: Record<string, string[]> = {
    cinematographer: [
      '*adjusts monocle* Let me examine the composition...',
      'The visual flow here is... interesting.',
      'I see potential in the framing choices.',
      '*nods thoughtfully* I have reached my verdict.',
    ],
    linguist: [
      '*opens notebook* Analyzing the linguistic elements...',
      'The vocabulary integration shows effort.',
      'Cultural authenticity is important here...',
      '*writes notes* My assessment is complete.',
    ],
    audience: [
      '*leans forward* Oh, this looks interesting!',
      'I want to see where this is going...',
      'The creativity is evident here.',
      '*applauds softly* I know what I think!',
    ],
  };
  return defaults[judgeId] || defaults.audience;
}

// ============================================
// FULL JUDGING ORCHESTRATION
// ============================================

/**
 * Run all 3 judges on a single entry
 */
export async function judgeEntry(
  entry: {
    id: string;
    userName: string;
    movieTitle: string;
    prompt: string;
    videoUrl?: string;
    usedVocabulary: string[];
    targetLanguage: string;
  }
): Promise<FullJudgingResult> {
  const context = {
    movieTitle: entry.movieTitle,
    originalPrompt: entry.prompt,
    usedVocabulary: entry.usedVocabulary,
    targetLanguage: entry.targetLanguage,
  };

  // Run all 3 judges (can be parallel or sequential for the show effect)
  const cinematographerScore = await judgeVideoWithPersona(
    entry.videoUrl || '',
    'cinematographer',
    context
  );

  const linguistScore = await judgeVideoWithPersona(
    entry.videoUrl || '',
    'linguist',
    context
  );

  const audienceScore = await judgeVideoWithPersona(
    entry.videoUrl || '',
    'audience',
    context
  );

  const totalScore =
    cinematographerScore.score +
    linguistScore.score +
    audienceScore.score;

  return {
    entryId: entry.id,
    userName: entry.userName,
    movieTitle: entry.movieTitle,
    scores: {
      cinematographer: cinematographerScore,
      linguist: linguistScore,
      audience: audienceScore,
    },
    totalScore,
    averageScore: totalScore / 3,
    judgedAt: new Date(),
  };
}

/**
 * Judge all contest entries and rank them
 */
export async function judgeContest(
  entries: Array<{
    id: string;
    userName: string;
    movieTitle: string;
    prompt: string;
    videoUrl?: string;
    usedVocabulary: string[];
    targetLanguage: string;
  }>,
  prizePool: number
): Promise<FullJudgingResult[]> {
  // Judge all entries
  const results: FullJudgingResult[] = [];

  for (const entry of entries) {
    const result = await judgeEntry(entry);
    results.push(result);
  }

  // Sort by total score descending
  results.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks and prizes
  // Platform takes 20%, winners get 80%
  const winnersPool = prizePool * 0.8;
  const prizeDistribution = [0.5, 0.3, 0.2]; // 50%, 30%, 20%

  results.forEach((result, index) => {
    result.rank = index + 1;
    if (index < 3) {
      result.prize = winnersPool * prizeDistribution[index];
    } else {
      result.prize = 0;
    }
  });

  return results;
}

// ============================================
// API ROUTE HELPER
// ============================================

export interface JudgeEntryRequest {
  entryId: string;
  userName: string;
  movieTitle: string;
  prompt: string;
  videoUrl?: string;
  usedVocabulary: string[];
  targetLanguage: string;
}

export interface JudgeContestRequest {
  contestId: string;
  entries: JudgeEntryRequest[];
  prizePool: number;
}
