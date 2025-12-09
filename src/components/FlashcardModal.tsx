'use client';

import { useState } from 'react';

interface VocabItem {
  word: string;
  translation: string;
  difficulty: string;
}

interface FlashcardModalProps {
  vocabulary: VocabItem[];
  movieTitle: string;
  language?: string;
  speechCode?: string;
  onWordLearned: (word: string, translation: string) => void;
  onClose: () => void;
}

export default function FlashcardModal({ vocabulary, movieTitle, language = 'French', speechCode = 'fr-FR', onWordLearned, onClose }: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [learningWords, setLearningWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = vocabulary[currentIndex];
  const progress = ((knownWords.length + learningWords.length) / vocabulary.length) * 100;

  const speak = (text: string, lang?: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || speechCode;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const word = currentCard.word;

    if (direction === 'right') {
      // Known
      setKnownWords(prev => [...prev, word]);
      onWordLearned(word, currentCard.translation);
    } else {
      // Still learning
      setLearningWords(prev => [...prev, word]);
    }

    setIsFlipped(false);

    if (currentIndex < vocabulary.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      setIsComplete(true);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-[28px] blur-xl opacity-60" />

        <div className="relative bg-[#0c0c14] rounded-[24px] border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/[0.08] via-blue-500/[0.08] to-purple-500/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Flashcards</h2>
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
            {!isComplete && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Card {currentIndex + 1} of {vocabulary.length}</span>
                  <span className="flex gap-3">
                    <span className="text-emerald-400">{knownWords.length} known</span>
                    <span className="text-amber-400">{learningWords.length} learning</span>
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {isComplete ? (
              // Results
              <div className="text-center py-6">
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
                  knownWords.length === vocabulary.length
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30'
                }`}>
                  {knownWords.length === vocabulary.length ? (
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                  )}
                </div>

                <h3 className="text-2xl font-bold mb-2 text-white">
                  {knownWords.length === vocabulary.length ? 'Perfect Score!' : 'Session Complete!'}
                </h3>
                <p className="text-white/50 text-sm mb-8">
                  Great job reviewing vocabulary
                </p>

                <div className="flex justify-center gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">{knownWords.length}</div>
                    <div className="text-sm text-white/50">Known</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">{learningWords.length}</div>
                    <div className="text-sm text-white/50">Learning</div>
                  </div>
                </div>

                <div className="mx-auto max-w-xs p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-6">
                  <p className="text-emerald-400 text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    +{knownWords.length * 5} XP earned!
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  Continue Learning
                </button>
              </div>
            ) : (
              // Flashcard
              <>
                {/* Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="relative h-64 cursor-pointer perspective-1000 mb-6"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl transition-all duration-500 transform-style-preserve-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/[0.08] p-6 flex flex-col items-center justify-center backface-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className={`text-[10px] px-3 py-1 rounded-full border mb-4 font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                        {currentCard.difficulty}
                      </span>
                      <h3 className="text-3xl font-bold text-white mb-4">{currentCard.word}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
                        className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all border border-white/[0.08]"
                      >
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                      <p className="text-white/30 text-xs mt-4">Tap to reveal translation</p>
                    </div>

                    {/* Back */}
                    <div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/[0.08] p-6 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Translation</p>
                      <h3 className="text-2xl font-bold text-white mb-4">{currentCard.translation}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(currentCard.translation, 'en-US'); }}
                        className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-all border border-white/[0.08]"
                      >
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Swipe buttons */}
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/25 transition-all group"
                  >
                    <svg className="w-7 h-7 text-rose-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/25 transition-all group"
                  >
                    <svg className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <p className="text-center text-white/30 text-xs mt-4">
                  <span className="text-rose-400/80">✗</span> Still Learning
                  <span className="mx-3 text-white/10">|</span>
                  <span className="text-emerald-400/80">✓</span> I Know This
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
