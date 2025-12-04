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

// Celebration phrases in different languages
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(15,15,20,0.98)] rounded-3xl max-w-lg w-full border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-brain text-purple-400"></i>
              Quiz Time!
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-white/60 text-sm">{movieTitle}</p>

          {/* Progress bar */}
          {!quizComplete && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{correctAnswers} correct</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
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
            <div className="text-center py-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                isPerfect
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse'
                  : percentage >= 70
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
              }`}>
                {isPerfect ? (
                  <i className="fas fa-crown text-4xl text-white"></i>
                ) : (
                  <span className="text-3xl font-bold text-white">{percentage}%</span>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2">
                {isPerfect
                  ? (celebrations[languageCode]?.perfect || 'Perfect!')
                  : percentage >= 70
                    ? (celebrations[languageCode]?.good || 'Great job!')
                    : (celebrations[languageCode]?.okay || 'Good effort!')}
              </h3>
              <p className="text-white/60 mb-6">
                You got {score} out of {questions.length} correct
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <i className="fas fa-check mr-2"></i>
                  Done
                </button>
              </div>

              {isPerfect && (
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">
                    <i className="fas fa-star mr-2"></i>
                    +50 XP bonus for perfect score!
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Question
            <>
              <h3 className="text-lg font-medium mb-6">{question.question}</h3>

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
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        showCorrect
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : showWrong
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : isSelected
                              ? 'bg-purple-500/20 border-purple-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          showCorrect
                            ? 'bg-green-500'
                            : showWrong
                              ? 'bg-red-500'
                              : 'bg-white/10'
                        }`}>
                          {showCorrect ? (
                            <i className="fas fa-check"></i>
                          ) : showWrong ? (
                            <i className="fas fa-times"></i>
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <p className="text-white/60 text-sm">
                    <i className="fas fa-lightbulb text-yellow-400 mr-2"></i>
                    {question.explanation}
                  </p>
                </div>
              )}

              {showResult && (
                <button
                  onClick={handleNext}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
