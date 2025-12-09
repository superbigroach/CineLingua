'use client';

import { useState, useEffect, useRef } from 'react';
import VideoEnhancementSelector from './VideoEnhancementSelector';
import { buildEnhancedPrompt } from '@/lib/videoEffects';

// Types
interface PromptIngredient {
  id: string;
  word: string;
  translation: string;
  type: 'word' | 'phrase' | 'expression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movieContext: string;
  visualHint: string;
  unlocked: boolean;
}

interface SceneQuizQuestion {
  id: string;
  ingredientId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

interface MovieSceneTheme {
  theme: string;
  mood: string;
  visualStyle: string;
}

interface SceneCreatorModalProps {
  movieTitle: string;
  movieId: number;
  movieOverview: string;
  language: string;
  languageCode: string;
  onClose: () => void;
  onSceneCreated?: (sceneData: SceneData) => void;
}

interface SceneData {
  movieTitle: string;
  movieId: number;
  language: string;
  userPrompt: string;
  enhancedPrompt: string;
  usedIngredients: PromptIngredient[];
  stakeAmount: number;
  generationCost: number;
  enhancements: VideoEnhancements;
  totalCost: number;
}

interface VideoEnhancements {
  styleId: string | null;
  cameraId: string | null;
  moodId: string | null;
}

type Step = 'loading' | 'quiz' | 'unlocked' | 'create' | 'generating' | 'preview' | 'submit';

// Constants
const MIN_INGREDIENTS_REQUIRED = 3;
const VIDEO_CLIPS = 3;            // Number of 8-second clips to generate
const COST_PER_CLIP = 0.80;       // $0.80 per 8-second clip
const GENERATION_COST = VIDEO_CLIPS * COST_PER_CLIP; // $2.40 total
const STAKE_AMOUNT = 1.60;

const difficultyConfig = {
  beginner: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Easy' },
  intermediate: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Medium' },
  advanced: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Hard' },
};

export default function SceneCreatorModal({
  movieTitle,
  movieId,
  movieOverview,
  language,
  languageCode,
  onClose,
  onSceneCreated,
}: SceneCreatorModalProps) {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);

  // State
  const [step, setStep] = useState<Step>('loading');
  const [theme, setTheme] = useState<MovieSceneTheme | null>(null);
  const [ingredients, setIngredients] = useState<PromptIngredient[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<SceneQuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  // Scene creation state
  const [userPrompt, setUserPrompt] = useState('');
  const [promptValidation, setPromptValidation] = useState<{
    valid: boolean;
    usedWords: string[];
    missing: string[];
  } | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);

  // Contest state
  const [stakeAmount, setStakeAmount] = useState(0);
  const [enterContest, setEnterContest] = useState(false);

  // Video enhancement state
  const [videoEnhancements, setVideoEnhancements] = useState<VideoEnhancements>({
    styleId: null,
    cameraId: null,
    moodId: null,
  });

  // Scroll to top when step changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Load on mount
  useEffect(() => {
    loadSceneChallenge();
  }, []);

  async function loadSceneChallenge() {
    setStep('loading');
    try {
      const res = await fetch('/api/scene-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-ingredients',
          movieTitle,
          movieOverview,
          language,
          languageCode,
        }),
      });

      const data = await res.json();

      if (data.theme && data.ingredients && data.quiz) {
        setTheme(data.theme);
        setIngredients(data.ingredients);
        setQuizQuestions(data.quiz);
        setStep('quiz');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Failed to load scene challenge:', error);
      setTheme({
        theme: `${movieTitle} Scenes`,
        mood: 'cinematic',
        visualStyle: 'French cinema aesthetic',
      });
      setStep('quiz');
    }
  }

  function handleQuizAnswer(index: number) {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const question = quizQuestions[currentQuizIndex];
    if (!question) return;

    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.id === question.ingredientId ? { ...ing, unlocked: true } : ing
        )
      );
      setUnlockedCount((prev) => prev + 1);
    }
  }

  function handleNextQuestion() {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setStep('unlocked');
    }
  }

  function validatePrompt(prompt: string) {
    const unlockedIngredients = ingredients.filter((i) => i.unlocked);
    const promptLower = prompt.toLowerCase();

    const usedWords: string[] = [];
    const missing: string[] = [];

    for (const ing of unlockedIngredients) {
      if (
        promptLower.includes(ing.word.toLowerCase()) ||
        promptLower.includes(ing.translation.toLowerCase())
      ) {
        usedWords.push(ing.word);
      } else {
        missing.push(ing.word);
      }
    }

    const valid = usedWords.length >= MIN_INGREDIENTS_REQUIRED;
    setPromptValidation({ valid, usedWords, missing });
  }

  function addWordToPrompt(word: string) {
    const newPrompt = userPrompt.trim() ? `${userPrompt} ${word}` : word;
    setUserPrompt(newPrompt);
    validatePrompt(newPrompt);
  }

  async function handleEnhancePrompt() {
    if (!promptValidation?.valid) return;
    setStep('generating');

    try {
      let basePrompt = userPrompt;
      if (videoEnhancements.styleId || videoEnhancements.cameraId || videoEnhancements.moodId) {
        basePrompt = buildEnhancedPrompt({
          basePrompt: userPrompt,
          styleId: videoEnhancements.styleId || undefined,
          cameraId: videoEnhancements.cameraId || undefined,
          mood: videoEnhancements.moodId || undefined,
        });
      }

      const res = await fetch('/api/scene-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance-prompt',
          userPrompt: basePrompt,
          ingredients: ingredients.filter((i) => i.unlocked),
          theme,
          language,
          enhancements: videoEnhancements,
        }),
      });

      const data = await res.json();
      setEnhancedPrompt(data.enhancedPrompt || basePrompt);
      setVariations(data.variations || [basePrompt]);
      setStep('preview');
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
      const enhanced = buildEnhancedPrompt({
        basePrompt: userPrompt,
        styleId: videoEnhancements.styleId || undefined,
        cameraId: videoEnhancements.cameraId || undefined,
        mood: videoEnhancements.moodId || undefined,
      });
      setEnhancedPrompt(enhanced);
      setVariations([enhanced]);
      setStep('preview');
    }
  }

  async function handleSubmitScene() {
    setStep('submit');

    const sceneData: SceneData = {
      movieTitle,
      movieId,
      language,
      userPrompt,
      enhancedPrompt: variations[selectedVariation] || enhancedPrompt,
      usedIngredients: ingredients.filter((i) => i.unlocked),
      stakeAmount: enterContest ? stakeAmount : 0,
      generationCost: GENERATION_COST,
      enhancements: videoEnhancements,
      totalCost: GENERATION_COST + (enterContest ? stakeAmount : 0),
    };

    if (onSceneCreated) {
      onSceneCreated(sceneData);
    }
  }

  const currentQuestion = quizQuestions[currentQuizIndex];
  const unlockedIngredients = ingredients.filter((i) => i.unlocked);
  const canCreateScene = unlockedIngredients.length >= MIN_INGREDIENTS_REQUIRED;
  const totalCost = GENERATION_COST + stakeAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="bg-gradient-to-b from-[#12121a] to-[#0a0a10] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl shadow-purple-500/10 mx-4">

        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">🎬</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">CinéScene Challenge</h2>
                <p className="text-white/50 text-sm">{movieTitle} • {language}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {theme && (
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                {theme.theme}
              </span>
              <span className="text-white/30 text-xs">{theme.mood}</span>
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">

          {/* LOADING STATE */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-white font-medium">Generating your challenge...</p>
              <p className="mt-2 text-white/40 text-sm">Creating vocabulary from "{movieTitle}"</p>
            </div>
          )}

          {/* QUIZ STEP */}
          {step === 'quiz' && currentQuestion && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/50 text-sm">
                    Question {currentQuizIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-emerald-400 text-sm font-medium">
                    {unlockedCount} unlocked
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Word Preview Card */}
              {(() => {
                const ing = ingredients.find((i) => i.id === currentQuestion.ingredientId);
                if (!ing) return null;
                const config = difficultyConfig[ing.difficulty];
                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xl font-bold text-white">{ing.word}</span>
                        <span className="text-white/40 text-sm ml-3">({ing.translation})</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm">{ing.movieContext}</p>
                  </div>
                );
              })()}

              {/* Question */}
              <h3 className="text-xl font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                        showCorrect
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : showWrong
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : isSelected
                              ? 'bg-purple-500/20 border-purple-500'
                              : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                          showCorrect
                            ? 'bg-emerald-500 text-white'
                            : showWrong
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/10 text-white/70'
                        }`}>
                          {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-white">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result Feedback */}
              {showResult && (
                <div className="space-y-4 pt-2">
                  <div className={`p-4 rounded-xl ${
                    selectedAnswer === currentQuestion.correctIndex
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-rose-500/10 border border-rose-500/30'
                  }`}>
                    {selectedAnswer === currentQuestion.correctIndex ? (
                      <div>
                        <p className="text-emerald-400 font-bold text-lg">🎉 Correct! Word Unlocked!</p>
                        <p className="text-white/50 text-sm mt-2">{currentQuestion.explanation}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-rose-400 font-medium">Not quite, but keep going!</p>
                        <p className="text-white/50 text-sm mt-2">{currentQuestion.explanation}</p>
                      </div>
                    )}
                  </div>

                  {selectedAnswer === currentQuestion.correctIndex && currentQuestion.hint && (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-purple-300 text-sm">
                        <span className="font-bold">💡 Scene Idea:</span> {currentQuestion.hint}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Your Words →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UNLOCKED INGREDIENTS */}
          {step === 'unlocked' && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center py-4">
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                  canCreateScene
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500'
                }`}>
                  <span className="text-4xl">{canCreateScene ? '🎬' : '🔓'}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {canCreateScene ? 'Ready to Create!' : `${unlockedIngredients.length}/${MIN_INGREDIENTS_REQUIRED} Words Unlocked`}
                </h3>
                <p className="text-white/50">
                  {canCreateScene
                    ? 'Use your unlocked words to write a cinematic scene!'
                    : 'You need at least 3 words to create a scene'}
                </p>
              </div>

              {/* Ingredients Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ingredients.map((ing) => {
                  const config = difficultyConfig[ing.difficulty];
                  return (
                    <div
                      key={ing.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ing.unlocked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white/5 border-white/10 opacity-40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className={`text-lg font-bold ${ing.unlocked ? 'text-emerald-300' : 'text-white/50'}`}>
                            {ing.unlocked ? '🔓' : '🔒'} {ing.word}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-sm">= "{ing.translation}"</p>
                      {ing.unlocked && (
                        <p className="text-purple-300/70 text-xs mt-2 italic line-clamp-2">
                          💡 {ing.visualHint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {canCreateScene ? (
                <button
                  onClick={() => setStep('create')}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  ✨ Create Your Scene
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-white/10 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Try Again Later
                </button>
              )}
            </div>
          )}

          {/* CREATE SCENE */}
          {step === 'create' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Write Your Scene</h3>
                <p className="text-white/50 text-sm">
                  Use at least {MIN_INGREDIENTS_REQUIRED} words from your vocabulary. Click any word to add it!
                </p>
              </div>

              {/* Word Cards */}
              <div className="space-y-3">
                {unlockedIngredients.map((ing) => {
                  const isUsed = promptValidation?.usedWords.includes(ing.word);
                  return (
                    <div
                      key={ing.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isUsed
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-bold ${isUsed ? 'text-emerald-300' : 'text-white'}`}>
                              {ing.word}
                            </span>
                            {isUsed && (
                              <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-white/40 text-sm mt-1">= "{ing.translation}" (English)</p>
                        </div>

                        <button
                          onClick={() => !isUsed && addWordToPrompt(ing.word)}
                          disabled={isUsed}
                          className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                            isUsed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/25'
                          }`}
                        >
                          {isUsed ? 'Added ✓' : `+ Add`}
                        </button>
                      </div>

                      <p className="text-purple-300/60 text-xs mt-3 italic">
                        💡 {ing.visualHint}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Add Row */}
              <div className="flex flex-wrap items-center gap-2 py-3 border-y border-white/10">
                <span className="text-white/30 text-xs font-medium">Quick add:</span>
                {unlockedIngredients.map((ing) => {
                  const isUsed = promptValidation?.usedWords.includes(ing.word);
                  return (
                    <button
                      key={`quick-${ing.id}`}
                      onClick={() => !isUsed && addWordToPrompt(ing.word)}
                      disabled={isUsed}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isUsed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {isUsed && '✓ '}{ing.word}
                    </button>
                  );
                })}
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  value={userPrompt}
                  onChange={(e) => {
                    setUserPrompt(e.target.value);
                    validatePrompt(e.target.value);
                  }}
                  placeholder={`Describe your cinematic scene (we'll generate 3x 8-second clips)...\n\nTip: You can write in ${language} or English!`}
                  className="w-full h-32 p-4 bg-black/40 rounded-xl border-2 border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none resize-none text-base"
                />
              </div>

              {/* Validation Status */}
              {promptValidation && (
                <div className={`p-4 rounded-xl ${
                  promptValidation.valid
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  {promptValidation.valid ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-emerald-300 font-medium">Ready to enhance!</p>
                        <p className="text-emerald-300/60 text-sm">Using: {promptValidation.usedWords.join(', ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📝</span>
                      </div>
                      <div>
                        <p className="text-amber-300 font-medium">
                          Need {MIN_INGREDIENTS_REQUIRED - promptValidation.usedWords.length} more word{MIN_INGREDIENTS_REQUIRED - promptValidation.usedWords.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-amber-300/60 text-sm">Click "+ Add" or type in {language}/English</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhancement Selector */}
              {promptValidation?.valid && (
                <div className="pt-4 border-t border-white/10">
                  <VideoEnhancementSelector
                    onSelect={setVideoEnhancements}
                    initialStyle={videoEnhancements.styleId}
                    initialCamera={videoEnhancements.cameraId}
                    initialMood={videoEnhancements.moodId}
                  />
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleEnhancePrompt}
                disabled={!promptValidation?.valid}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  promptValidation?.valid
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                ✨ Enhance & Preview
              </button>
            </div>
          )}

          {/* GENERATING */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-8 text-white font-medium text-lg">Enhancing your scene...</p>
              <p className="mt-2 text-white/40 text-sm">Creating cinematic variations with AI</p>
            </div>
          )}

          {/* PREVIEW VARIATIONS */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Choose Your Variation</h3>
                <p className="text-white/50 text-sm">Select the version that best matches your vision</p>
              </div>

              {/* Variations */}
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariation(index)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      selectedVariation === index
                        ? 'bg-purple-500/15 border-purple-500'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        selectedVariation === index ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-white">Variation {index + 1}</span>
                    </div>
                    <p className="text-white/60 text-sm line-clamp-3 pl-11">{variation}</p>
                  </button>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-lg">💰</span> Cost Breakdown
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Video Generation ({VIDEO_CLIPS}x 8-sec clips)</span>
                    <span className="text-white font-medium">${GENERATION_COST.toFixed(2)}</span>
                  </div>

                  {/* Contest Toggle */}
                  <div className="pt-3 border-t border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enterContest}
                        onChange={(e) => {
                          setEnterContest(e.target.checked);
                          setStakeAmount(e.target.checked ? STAKE_AMOUNT : 0);
                        }}
                        className="w-5 h-5 mt-0.5 rounded bg-white/10 border-white/30 text-purple-500 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-medium text-white block">Enter Weekly Contest</span>
                        <span className="text-white/40 text-sm">Stake to compete for prizes!</span>
                      </div>
                    </label>
                  </div>

                  {enterContest && (
                    <div className="space-y-2 pl-8">
                      <div className="flex justify-between">
                        <span className="text-white/60">Contest Stake</span>
                        <span className="text-cyan-400 font-medium">${STAKE_AMOUNT.toFixed(2)}</span>
                      </div>
                      <p className="text-white/30 text-xs">
                        100% goes to prize pool • Top 3 split 80% • Platform: 20%
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-cyan-400">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Prize Info */}
              {enterContest && (
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-amber-300 font-medium">Prize Distribution</p>
                      <p className="text-white/40 text-sm">1st: 50% • 2nd: 30% • 3rd: 20%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitScene}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                🎬 {enterContest ? 'Generate & Enter Contest' : 'Generate Video'} (${totalCost.toFixed(2)})
              </button>
            </div>
          )}

          {/* SUBMIT SUCCESS */}
          {step === 'submit' && (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 animate-bounce">
                <span className="text-5xl">🎬</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Scene Submitted!</h3>
              <p className="text-white/50 mb-8 max-w-sm mx-auto">
                {enterContest
                  ? 'Your scene is generating and will enter the weekly contest!'
                  : 'Your scene is being generated. Check back soon!'}
              </p>

              {enterContest && (
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 mb-6 max-w-sm mx-auto">
                  <p className="text-purple-300 text-sm">
                    ⚖️ AI judges will score your scene 30 minutes after the contest ends
                  </p>
                </div>
              )}

              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white"
                >
                  Done
                </button>
                <button
                  onClick={() => window.open('/contest', '_blank')}
                  className="w-full py-3 bg-white/10 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                >
                  🏆 View Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
