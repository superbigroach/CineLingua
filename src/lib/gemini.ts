// Google Gemini AI - FREE tier (60 requests/min)
// https://aistudio.google.com/apikey

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Language Tutor Agent - explains words and phrases
export async function explainWord(
  word: string,
  context: string,
  targetLanguage = 'French'
): Promise<{
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: string[];
  culturalNote?: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a ${targetLanguage} language tutor. Explain this word/phrase to an English speaker learning ${targetLanguage}.

Word: "${word}"
Context from movie: "${context}"

Respond in JSON format only:
{
  "translation": "English translation",
  "pronunciation": "phonetic pronunciation",
  "partOfSpeech": "noun/verb/adjective/etc",
  "examples": ["example sentence 1", "example sentence 2"],
  "culturalNote": "any cultural context if relevant"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    translation: 'Translation unavailable',
    pronunciation: '',
    partOfSpeech: '',
    examples: [],
  };
}

// Movie Discussion Agent - generates learning content from movie
export async function generateMovieLearningContent(
  movieTitle: string,
  movieOverview: string,
  targetLanguage = 'French'
): Promise<{
  vocabulary: Array<{ word: string; translation: string; difficulty: string }>;
  phrases: Array<{ phrase: string; meaning: string; usage: string }>;
  culturalContext: string;
  discussionQuestions: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a language learning content creator. Based on this ${targetLanguage} movie, create learning materials for English speakers.

Movie: "${movieTitle}"
Synopsis: "${movieOverview}"

Create learning content in JSON format:
{
  "vocabulary": [
    {"word": "${targetLanguage} word", "translation": "English", "difficulty": "beginner/intermediate/advanced"}
  ],
  "phrases": [
    {"phrase": "common ${targetLanguage} phrase", "meaning": "meaning", "usage": "when to use it"}
  ],
  "culturalContext": "relevant cultural background for understanding this film",
  "discussionQuestions": ["question about the movie in ${targetLanguage}"]
}

Generate 5-8 vocabulary words, 3-4 phrases, and 3 discussion questions.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    vocabulary: [],
    phrases: [],
    culturalContext: '',
    discussionQuestions: [],
  };
}

// Quiz Agent - generates comprehension questions
export async function generateQuiz(
  content: string,
  targetLanguage = 'French',
  difficulty = 'intermediate'
): Promise<{
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Create a ${difficulty} level ${targetLanguage} language quiz based on this content:

"${content}"

Generate 3 multiple choice questions in JSON:
{
  "questions": [
    {
      "question": "Question in ${targetLanguage}",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { questions: [] };
}

// Discovery Agent - recommends movies based on learning goals
export async function recommendMoviesForLearning(
  currentLevel: 'beginner' | 'intermediate' | 'advanced',
  interests: string[],
  targetLanguage = 'French'
): Promise<{
  recommendations: Array<{
    searchQuery: string;
    reason: string;
    learningBenefit: string;
  }>;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a ${targetLanguage} language learning advisor. Recommend movies for a ${currentLevel} learner interested in: ${interests.join(', ')}.

Respond in JSON:
{
  "recommendations": [
    {
      "searchQuery": "movie search term",
      "reason": "why this movie is good",
      "learningBenefit": "what they'll learn"
    }
  ]
}

Give 3-5 recommendations for ${targetLanguage} movies or shows.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { recommendations: [] };
}
