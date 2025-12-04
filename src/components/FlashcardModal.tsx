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
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(15,15,20,0.98)] rounded-3xl max-w-md w-full border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-layer-group text-cyan-400"></i>
              Flashcards
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-white/60 text-sm">{movieTitle}</p>

          {/* Progress */}
          {!isComplete && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>Card {currentIndex + 1} of {vocabulary.length}</span>
                <span className="flex gap-3">
                  <span className="text-green-400">{knownWords.length} known</span>
                  <span className="text-amber-400">{learningWords.length} learning</span>
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
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
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6">
                <i className="fas fa-graduation-cap text-4xl text-white"></i>
              </div>

              <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
              <p className="text-white/60 mb-6">Great job reviewing vocabulary</p>

              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{knownWords.length}</div>
                  <div className="text-sm text-white/50">Known</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">{learningWords.length}</div>
                  <div className="text-sm text-white/50">Learning</div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30 mb-4">
                <p className="text-green-400 text-sm">
                  <i className="fas fa-star mr-2"></i>
                  +{knownWords.length * 5} XP earned for {knownWords.length} words learned!
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Done
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
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 p-6 flex flex-col items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className={`text-[10px] px-3 py-1 rounded-full border mb-4 ${getDifficultyColor(currentCard.difficulty)}`}>
                      {currentCard.difficulty}
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-4">{currentCard.word}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
                      className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <i className="fas fa-volume-up text-xl"></i>
                    </button>
                    <p className="text-white/40 text-sm mt-4">Tap to reveal translation</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-white/20 p-6 flex flex-col items-center justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-white/60 text-sm mb-2">Translation</p>
                    <h3 className="text-2xl font-bold text-white mb-4">{currentCard.translation}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(currentCard.translation, 'en-US'); }}
                      className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <i className="fas fa-volume-up text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Swipe buttons */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all group"
                >
                  <i className="fas fa-times text-2xl text-red-400 group-hover:scale-110 transition-transform"></i>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all group"
                >
                  <i className="fas fa-check text-2xl text-green-400 group-hover:scale-110 transition-transform"></i>
                </button>
              </div>

              <p className="text-center text-white/40 text-sm mt-4">
                <i className="fas fa-times text-red-400 mr-1"></i> Still Learning
                <span className="mx-3">|</span>
                <i className="fas fa-check text-green-400 mr-1"></i> I Know This
              </p>
            </>
          )}
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
