'use client';

import { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModalProps {
  questions: QuizQuestion[];
  movieTitle: string;
  language?: string;
  languageCode?: string;
  onComplete: (correct: number, total: number) => void;
  onClose: () => void;
}

const celebrations: Record<string, { perfect: string; good: string; okay: string }> = {
  fr: { perfect: 'Parfait!', good: 'Très bien!', okay: 'Bien joué!' },
  es: { perfect: 'Perfecto!', good: 'Muy bien!', okay: 'Bien hecho!' },
  de: { perfect: 'Perfekt!', good: 'Sehr gut!', okay: 'Gut gemacht!' },
  it: { perfect: 'Perfetto!', good: 'Molto bene!', okay: 'Ben fatto!' },
  pt: { perfect: 'Perfeito!', good: 'Muito bem!', okay: 'Bem feito!' },
  ja: { perfect: '完璧!', good: 'とても良い!', okay: 'よくできました!' },
  ko: { perfect: '완벽해요!', good: '아주 좋아요!', okay: '잘했어요!' },
  zh: { perfect: '完美!', good: '非常好!', okay: '做得好!' },
  hi: { perfect: 'परफेक्ट!', good: 'बहुत अच्छा!', okay: 'अच्छा किया!' },
  ar: { perfect: 'ممتاز!', good: 'جيد جداً!', okay: 'أحسنت!' },
  ru: { perfect: 'Отлично!', good: 'Очень хорошо!', okay: 'Хорошо!' },
  tr: { perfect: 'Mükemmel!', good: 'Çok iyi!', okay: 'Aferin!' },
};

export default function QuizModal({ questions, movieTitle, language = 'French', languageCode = 'fr', onComplete, onClose }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === question.correctIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      onComplete(correctAnswers + (selectedAnswer === question.correctIndex ? 1 : 0), questions.length);
    }
  };

  const score = correctAnswers + (selectedAnswer === question.correctIndex ? 1 : 0);
  const percentage = Math.round((score / questions.length) * 100);
  const isPerfect = score === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-[28px] blur-xl opacity-60" />

        <div className="relative bg-[#0c0c14] rounded-[24px] border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-purple-500/[0.08] via-pink-500/[0.08] to-orange-500/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Quiz Time</h2>
                  <p className="text-[11px] text-white/40">{movieTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {!quizComplete && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-emerald-400">{correctAnswers} correct</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {quizComplete ? (
              // Results screen
              <div className="text-center py-6">
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                  isPerfect
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                    : percentage >= 70
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/30'
                      : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30'
                }`}>
                  {isPerfect ? (
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                    </svg>
                  ) : (
                    <span className="text-4xl font-bold text-white">{percentage}%</span>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-2 text-white">
                  {isPerfect
                    ? (celebrations[languageCode]?.perfect || 'Perfect!')
                    : percentage >= 70
                      ? (celebrations[languageCode]?.good || 'Great job!')
                      : (celebrations[languageCode]?.okay || 'Good effort!')}
                </h3>
                <p className="text-white/50 text-sm mb-8">
                  You got {score} out of {questions.length} correct
                </p>

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Continue Learning
                </button>

                {isPerfect && (
                  <div className="mt-6 mx-auto max-w-xs p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      +50 XP bonus!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Question
              <>
                <h3 className="text-lg font-medium text-white mb-6 leading-relaxed">{question.question}</h3>

                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correctIndex;
                    const showCorrect = showResult && isCorrect;
                    const showWrong = showResult && isSelected && !isCorrect;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                          showCorrect
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                            : showWrong
                              ? 'bg-red-500/15 border-red-500/50 text-red-300'
                              : isSelected
                                ? 'bg-purple-500/15 border-purple-500/50'
                                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                            showCorrect
                              ? 'bg-emerald-500 text-white'
                              : showWrong
                                ? 'bg-red-500 text-white'
                                : isSelected
                                  ? 'bg-purple-500/30 text-purple-300'
                                  : 'bg-white/[0.06] text-white/50'
                          }`}>
                            {showCorrect ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : showWrong ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </span>
                          <span className="text-[14px] text-white/90">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showResult && (
                  <div className="mt-5 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z"/>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <p className="text-white/60 text-[13px] leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                )}

                {showResult && (
                  <button
                    onClick={handleNext}
                    className="mt-5 w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
