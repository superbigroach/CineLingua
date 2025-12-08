// Scene Challenge System
// Connects movie learning → quiz → prompt unlocking → video generation

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================
// TYPES
// ============================================

export interface PromptIngredient {
  id: string;
  word: string;           // The word/phrase in target language
  translation: string;    // English translation
  type: 'word' | 'phrase' | 'expression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movieContext: string;   // How it relates to the movie
  visualHint: string;     // How to visualize it in a scene
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface MovieSceneTheme {
  movieId: number;
  movieTitle: string;
  language: string;
  theme: string;          // e.g., "Romantic Paris", "Mystery Noir", "Family Drama"
  mood: string;           // e.g., "whimsical", "tense", "heartwarming"
  visualStyle: string;    // e.g., "warm golden tones", "rain-soaked streets"
  ingredients: PromptIngredient[];
  generatedAt: Date;
}

export interface SceneQuizQuestion {
  id: string;
  ingredientId: string;   // Links to the ingredient this unlocks
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;           // Visual hint for the scene
}

export interface UserSceneProgress {
  odId: string;
  movieId: number;
  unlockedIngredients: string[];  // ingredient IDs
  quizAttempts: number;
  canCreateScene: boolean;        // true when 3+ ingredients unlocked
}

// ============================================
// DYNAMIC INGREDIENT GENERATION
// ============================================

// Generate unique, movie-specific prompt ingredients using Gemini
export async function generateMovieIngredients(
  movieTitle: string,
  movieOverview: string,
  targetLanguage: string,
  languageCode: string
): Promise<{
  theme: MovieSceneTheme;
  quiz: SceneQuizQuestion[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are creating a language learning game that connects movie vocabulary to creative scene-making.

MOVIE: "${movieTitle}"
SYNOPSIS: "${movieOverview}"
TARGET LANGUAGE: ${targetLanguage} (code: ${languageCode})

TASK: Generate 6 unique "Prompt Ingredients" - words/phrases from this movie that users will:
1. Learn through a quiz
2. Unlock as creative building blocks
3. Use to write their own movie scene

Each ingredient should be:
- Relevant to this specific movie's themes, setting, or plot
- Visually evocative (can be shown in a video scene)
- A mix of difficulties
- Fun and memorable

Respond in JSON:
{
  "theme": {
    "name": "A catchy theme name for scenes from this movie (e.g., 'Montmartre Dreams', 'Café Secrets')",
    "mood": "The emotional tone (e.g., 'whimsical and romantic', 'dark and mysterious')",
    "visualStyle": "Visual description for AI video generation (e.g., 'soft golden hour light, cobblestone streets, vintage French aesthetics')",
    "colorPalette": "3-4 colors that define the mood"
  },
  "ingredients": [
    {
      "word": "${targetLanguage} word or short phrase",
      "translation": "English translation",
      "type": "word|phrase|expression",
      "difficulty": "beginner|intermediate|advanced",
      "movieContext": "How this relates to the movie (1 sentence)",
      "visualHint": "How to show this in a scene (e.g., 'a character looking wistfully out a rain-streaked window')"
    }
  ],
  "quizQuestions": [
    {
      "ingredientIndex": 0,
      "question": "Fun quiz question about this word (can be multiple choice translation, fill-in-blank, or context-based)",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct + fun fact",
      "sceneHint": "Teaser of how they could use this word in their scene"
    }
  ]
}

IMPORTANT:
- Make questions FUN, not dry vocabulary drills
- Include visual/cinematic hints to inspire creativity
- Mix difficulties: 2 beginner, 2 intermediate, 2 advanced
- Each ingredient should inspire different types of scenes
- Questions can be playful (e.g., "If you saw someone doing X, they might say...")`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to generate ingredients');
  }

  const data = JSON.parse(jsonMatch[0]);

  // Build the theme object
  const theme: MovieSceneTheme = {
    movieId: 0, // Set by caller
    movieTitle,
    language: targetLanguage,
    theme: data.theme.name,
    mood: data.theme.mood,
    visualStyle: data.theme.visualStyle,
    ingredients: data.ingredients.map((ing: any, i: number) => ({
      id: `ing_${Date.now()}_${i}`,
      word: ing.word,
      translation: ing.translation,
      type: ing.type,
      difficulty: ing.difficulty,
      movieContext: ing.movieContext,
      visualHint: ing.visualHint,
      unlocked: false,
    })),
    generatedAt: new Date(),
  };

  // Build quiz questions
  const quiz: SceneQuizQuestion[] = data.quizQuestions.map((q: any, i: number) => ({
    id: `quiz_${Date.now()}_${i}`,
    ingredientId: theme.ingredients[q.ingredientIndex]?.id || theme.ingredients[i]?.id,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    hint: q.sceneHint,
  }));

  return { theme, quiz };
}

// ============================================
// PROMPT VALIDATION & ENHANCEMENT
// ============================================

// Check if user's scene prompt contains required unlocked words
export function validateScenePrompt(
  userPrompt: string,
  unlockedIngredients: PromptIngredient[]
): {
  valid: boolean;
  usedIngredients: PromptIngredient[];
  missingCount: number;
  suggestions: string[];
} {
  const promptLower = userPrompt.toLowerCase();
  const usedIngredients: PromptIngredient[] = [];
  const suggestions: string[] = [];

  for (const ingredient of unlockedIngredients) {
    const wordLower = ingredient.word.toLowerCase();
    // Check for the word or a reasonable variation
    if (promptLower.includes(wordLower) ||
        promptLower.includes(ingredient.translation.toLowerCase())) {
      usedIngredients.push(ingredient);
    } else {
      suggestions.push(`Try including "${ingredient.word}" (${ingredient.translation}) - ${ingredient.visualHint}`);
    }
  }

  const minRequired = 3;
  const valid = usedIngredients.length >= minRequired;
  const missingCount = Math.max(0, minRequired - usedIngredients.length);

  return {
    valid,
    usedIngredients,
    missingCount,
    suggestions: suggestions.slice(0, missingCount),
  };
}

// Enhance user's scene prompt for video generation
export async function enhanceScenePrompt(
  userPrompt: string,
  usedIngredients: PromptIngredient[],
  theme: MovieSceneTheme,
  targetLanguage: string
): Promise<{
  enhancedPrompt: string;
  variations: string[];
  dialogue: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a cinematographer enhancing a user's scene idea for AI video generation.

MOVIE THEME: ${theme.theme}
VISUAL STYLE: ${theme.visualStyle}
MOOD: ${theme.mood}

USER'S SCENE IDEA: "${userPrompt}"

${targetLanguage.toUpperCase()} WORDS THEY EARNED & MUST FEATURE:
${usedIngredients.map(i => `- "${i.word}" (${i.translation}): ${i.visualHint}`).join('\n')}

Create a cinematic 8-second scene prompt. Respond in JSON:
{
  "enhancedPrompt": "Detailed cinematic description (50-80 words) with specific visuals, lighting, camera movement. Must naturally showcase the earned ${targetLanguage} words through visuals or text overlays.",
  "variations": [
    "Variation 1: Same concept, different camera angle or timing",
    "Variation 2: Same concept, different weather or lighting",
    "Variation 3: Same concept, unexpected twist or reveal"
  ],
  "dialogue": "Optional short ${targetLanguage} dialogue or text that could appear (subtitled)"
}

Make it CINEMATIC - describe like you're directing a film shoot!`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    enhancedPrompt: userPrompt,
    variations: [userPrompt],
    dialogue: '',
  };
}

// ============================================
// CONTEST HELPERS
// ============================================

export interface ContestEntry {
  id: string;
  odId: string;
  odName: string;
  movieTitle: string;
  language: string;
  prompt: string;
  enhancedPrompt: string;
  usedIngredients: PromptIngredient[];
  videoUrl?: string;
  thumbnailUrl?: string;
  stakeAmount: number;
  scores?: {
    cinematographer: number;
    linguist: number;
    audience: number;
    total: number;
  };
  rank?: number;
  prize?: number;
  createdAt: Date;
}

// Calculate prize distribution
export function calculatePrizes(
  totalPool: number,
  entries: ContestEntry[]
): ContestEntry[] {
  // Sort by total score descending
  const sorted = [...entries].sort((a, b) =>
    (b.scores?.total || 0) - (a.scores?.total || 0)
  );

  // Assign ranks and prizes
  const prizeDistribution = [0.50, 0.30, 0.20]; // 50%, 30%, 20%

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    prize: index < 3 ? totalPool * prizeDistribution[index] : 0,
  }));
}

// Format currency for display
export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)} USDC`;
}
