'use client';

import { useState, useEffect, useRef } from 'react';

interface Submission {
  id: string;
  userName: string;
  userAvatar: string;
  movieTitle: string;
  prompt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  usedIngredients: string[];
}

interface JudgeScore {
  score: number;
  feedback: string;
  highlights: string;
}

interface JudgingResult {
  odId: string;
  odName: string;
  cinematographer: JudgeScore;
  linguist: JudgeScore;
  audience: JudgeScore;
  totalScore: number;
  rank?: number;
  prize?: number;
}

interface JudgingShowModalProps {
  contestId: string;
  contestTitle: string;
  prizePool: number;
  submissions: Submission[];
  onClose: () => void;
  onJudgingComplete?: (results: JudgingResult[]) => void;
}

type ShowPhase =
  | 'intro'
  | 'meet-judges'
  | 'reviewing'
  | 'judge-cinematographer'
  | 'judge-linguist'
  | 'judge-audience'
  | 'deliberation'
  | 'reveal-3rd'
  | 'reveal-2nd'
  | 'reveal-1st'
  | 'celebration';

const JUDGES = {
  cinematographer: {
    id: 'cinematographer',
    name: 'Le Cinéaste',
    title: 'Legendary Film Director',
    emoji: '🎬',
    avatar: '👨‍🎨',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    personality: 'Exacting perfectionist with an eye for visual poetry',
    catchphrase: 'The camera never lies, but it can dream...',
  },
  linguist: {
    id: 'linguist',
    name: 'Le Linguiste',
    title: 'Académie Française Member',
    emoji: '🗣️',
    avatar: '👩‍🏫',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    personality: 'Passionate guardian of the French language',
    catchphrase: 'Each word is a brushstroke on the canvas of meaning.',
  },
  audience: {
    id: 'audience',
    name: 'Le Public',
    title: 'Festival Enthusiast',
    emoji: '🎭',
    avatar: '🧑‍🤝‍🧑',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    personality: 'Loves being surprised, moved, and entertained',
    catchphrase: 'Cinema is meant to make you FEEL something!',
  },
};

export default function JudgingShowModal({
  contestId,
  contestTitle,
  prizePool,
  submissions,
  onClose,
  onJudgingComplete,
}: JudgingShowModalProps) {
  const [phase, setPhase] = useState<ShowPhase>('intro');
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [judgingResults, setJudgingResults] = useState<JudgingResult[]>([]);
  const [currentJudgeThoughts, setCurrentJudgeThoughts] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [sortedResults, setSortedResults] = useState<JudgingResult[]>([]);
  const [revealedWinners, setRevealedWinners] = useState<JudgingResult[]>([]);

  const thoughtsContainerRef = useRef<HTMLDivElement>(null);

  // Platform takes 20%, winners split 80%
  const winnersPool = prizePool * 0.8;
  const prizes = {
    first: winnersPool * 0.5,
    second: winnersPool * 0.3,
    third: winnersPool * 0.2,
  };

  // Auto-advance phases
  useEffect(() => {
    const timers: { [key: string]: number } = {
      'intro': 4000,
      'meet-judges': 6000,
    };

    if (timers[phase]) {
      const timer = setTimeout(() => {
        if (phase === 'intro') setPhase('meet-judges');
        else if (phase === 'meet-judges') setPhase('reviewing');
      }, timers[phase]);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Start judging when entering reviewing phase
  useEffect(() => {
    if (phase === 'reviewing') {
      startJudging();
    }
  }, [phase]);

  async function startJudging() {
    const results: JudgingResult[] = [];

    for (let i = 0; i < submissions.length; i++) {
      setCurrentSubmissionIndex(i);

      // Judge each submission with all 3 judges
      const submission = submissions[i];
      const result = await judgeSubmissionLive(submission);
      results.push(result);
      setJudgingResults([...results]);
    }

    // Sort by total score
    const sorted = [...results].sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks and prizes
    sorted.forEach((r, idx) => {
      r.rank = idx + 1;
      if (idx === 0) r.prize = prizes.first;
      else if (idx === 1) r.prize = prizes.second;
      else if (idx === 2) r.prize = prizes.third;
      else r.prize = 0;
    });

    setSortedResults(sorted);
    setPhase('deliberation');

    // After deliberation, reveal winners
    setTimeout(() => setPhase('reveal-3rd'), 5000);
  }

  async function judgeSubmissionLive(submission: Submission): Promise<JudgingResult> {
    const result: JudgingResult = {
      odId: submission.id,
      odName: submission.userName,
      cinematographer: { score: 0, feedback: '', highlights: '' },
      linguist: { score: 0, feedback: '', highlights: '' },
      audience: { score: 0, feedback: '', highlights: '' },
      totalScore: 0,
    };

    // Judge 1: Le Cinéaste
    setPhase('judge-cinematographer');
    await simulateJudgeThinking('cinematographer', submission);
    result.cinematographer = await getJudgeScore('cinematographer', submission);

    // Judge 2: Le Linguiste
    setPhase('judge-linguist');
    await simulateJudgeThinking('linguist', submission);
    result.linguist = await getJudgeScore('linguist', submission);

    // Judge 3: Le Public
    setPhase('judge-audience');
    await simulateJudgeThinking('audience', submission);
    result.audience = await getJudgeScore('audience', submission);

    result.totalScore =
      result.cinematographer.score +
      result.linguist.score +
      result.audience.score;

    return result;
  }

  async function simulateJudgeThinking(judgeId: string, submission: Submission) {
    const thoughts = getJudgeThoughts(judgeId, submission);
    setCurrentJudgeThoughts([]);
    setShowScore(false);

    for (const thought of thoughts) {
      setIsTyping(true);
      await sleep(500);
      setCurrentJudgeThoughts(prev => [...prev, thought]);
      setIsTyping(false);
      await sleep(1500);

      // Auto-scroll
      if (thoughtsContainerRef.current) {
        thoughtsContainerRef.current.scrollTop = thoughtsContainerRef.current.scrollHeight;
      }
    }

    await sleep(1000);
  }

  function getJudgeThoughts(judgeId: string, submission: Submission): string[] {
    const judge = JUDGES[judgeId as keyof typeof JUDGES];

    const thoughtsPool = {
      cinematographer: [
        `*adjusts monocle* Hmm, let me examine the visual composition...`,
        `The lighting choices here are... ${Math.random() > 0.5 ? 'quite bold' : 'intriguing'}`,
        `I see influences of ${['Truffaut', 'Godard', 'Varda', 'Demy'][Math.floor(Math.random() * 4)]}...`,
        `The camera movement ${Math.random() > 0.5 ? 'tells a story' : 'creates tension'}`,
        `*strokes chin* The mise-en-scène is ${['evocative', 'atmospheric', 'compelling'][Math.floor(Math.random() * 3)]}`,
      ],
      linguist: [
        `*opens notebook* Analyzing the linguistic authenticity...`,
        `The word "${submission.usedIngredients[0] || 'mystérieux'}" is used ${Math.random() > 0.5 ? 'naturally' : 'with flair'}`,
        `I appreciate the ${['idiomatic expression', 'cultural reference', 'regional flavor'][Math.floor(Math.random() * 3)]}`,
        `The dialogue feels ${Math.random() > 0.5 ? 'authentically French' : 'wonderfully expressive'}`,
        `*nods approvingly* C'est ${['magnifique', 'très bien', 'impressionnant'][Math.floor(Math.random() * 3)]}!`,
      ],
      audience: [
        `*leans forward excitedly* Oh, this is ${Math.random() > 0.5 ? 'interesting' : 'captivating'}!`,
        `I felt ${['moved', 'intrigued', 'delighted', 'surprised'][Math.floor(Math.random() * 4)]} watching this`,
        `The creativity here is ${Math.random() > 0.5 ? 'refreshing' : 'inspiring'}!`,
        `This scene made me want to ${['see more', 'watch the whole film', 'applaud'][Math.floor(Math.random() * 3)]}`,
        `*applauds* ${['Bravo!', 'Wonderful!', 'I loved it!'][Math.floor(Math.random() * 3)]}`,
      ],
    };

    return thoughtsPool[judgeId as keyof typeof thoughtsPool] || [];
  }

  async function getJudgeScore(judgeId: string, submission: Submission): Promise<JudgeScore> {
    // In production, this would call the API
    // For now, generate realistic scores
    const baseScore = 6 + Math.random() * 3; // 6-9 range
    const score = Math.round(baseScore * 10) / 10;

    setCurrentScore(score);
    setShowScore(true);
    await sleep(2000);

    return {
      score,
      feedback: `Excellent work on "${submission.movieTitle}"`,
      highlights: `Creative use of ${submission.usedIngredients.join(', ')}`,
    };
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Phase transitions for winner reveals
  useEffect(() => {
    if (phase === 'reveal-3rd' && sortedResults.length >= 3) {
      setRevealedWinners([sortedResults[2]]);
      setTimeout(() => setPhase('reveal-2nd'), 4000);
    } else if (phase === 'reveal-2nd' && sortedResults.length >= 2) {
      setRevealedWinners([sortedResults[2], sortedResults[1]]);
      setTimeout(() => setPhase('reveal-1st'), 4000);
    } else if (phase === 'reveal-1st' && sortedResults.length >= 1) {
      setRevealedWinners([sortedResults[2], sortedResults[1], sortedResults[0]]);
      setTimeout(() => setPhase('celebration'), 3000);
    }
  }, [phase, sortedResults]);

  // Notify when complete
  useEffect(() => {
    if (phase === 'celebration' && onJudgingComplete) {
      onJudgingComplete(sortedResults);
    }
  }, [phase]);

  const currentSubmission = submissions[currentSubmissionIndex];
  const currentJudge = phase.startsWith('judge-')
    ? JUDGES[phase.replace('judge-', '') as keyof typeof JUDGES]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-blue-900/50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-5xl mx-auto p-6">

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6 animate-bounce">🎬</div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              CinéScene Finals
            </h1>
            <p className="text-2xl text-white/80 mb-2">{contestTitle}</p>
            <div className="text-4xl font-bold text-green-400 animate-pulse">
              ${prizePool.toFixed(2)} Prize Pool
            </div>
            <p className="text-white/50 mt-4">The judges are taking their seats...</p>
          </div>
        )}

        {/* MEET THE JUDGES */}
        {phase === 'meet-judges' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Meet Your Judges
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {Object.values(JUDGES).map((judge, idx) => (
                <div
                  key={judge.id}
                  className={`p-6 rounded-2xl border ${judge.borderColor} ${judge.bgColor} transform transition-all duration-500 animate-slide-up`}
                  style={{ animationDelay: `${idx * 300}ms` }}
                >
                  <div className="text-5xl text-center mb-3">{judge.avatar}</div>
                  <h3 className="text-xl font-bold text-center">{judge.name}</h3>
                  <p className="text-white/60 text-sm text-center">{judge.title}</p>
                  <p className="text-white/40 text-xs text-center mt-2 italic">
                    "{judge.catchphrase}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JUDGING IN PROGRESS */}
        {(phase === 'reviewing' || phase.startsWith('judge-')) && currentSubmission && (
          <div className="grid grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Current Submission */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white/60">Now Reviewing:</h3>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xl">
                    {currentSubmission.userName[0]}
                  </div>
                  <div>
                    <p className="font-bold">{currentSubmission.userName}</p>
                    <p className="text-white/50 text-sm">{currentSubmission.movieTitle}</p>
                  </div>
                </div>

                {/* Video/Thumbnail placeholder */}
                <div className="aspect-video bg-black/50 rounded-xl mb-4 flex items-center justify-center">
                  {currentSubmission.thumbnailUrl ? (
                    <img src={currentSubmission.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-4xl">🎬</div>
                  )}
                </div>

                <p className="text-white/70 text-sm line-clamp-2">{currentSubmission.prompt}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {currentSubmission.usedIngredients.map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="text-center text-white/50 text-sm">
                Submission {currentSubmissionIndex + 1} of {submissions.length}
              </div>
            </div>

            {/* Right: Judge Panel */}
            <div className="space-y-4">
              {currentJudge && (
                <div className={`p-6 rounded-2xl border-2 ${currentJudge.borderColor} ${currentJudge.bgColor} animate-pulse-slow`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{currentJudge.avatar}</div>
                    <div>
                      <h3 className="text-2xl font-bold">{currentJudge.name}</h3>
                      <p className="text-white/60">{currentJudge.title}</p>
                    </div>
                  </div>

                  {/* Thoughts */}
                  <div
                    ref={thoughtsContainerRef}
                    className="h-48 overflow-y-auto space-y-2 mb-4 pr-2"
                  >
                    {currentJudgeThoughts.map((thought, i) => (
                      <div
                        key={i}
                        className="p-3 bg-black/30 rounded-lg text-white/80 text-sm animate-fade-in"
                      >
                        {thought}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="p-3 bg-black/30 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Reveal */}
                  {showScore && (
                    <div className="text-center animate-scale-in">
                      <div className="text-6xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        {currentScore.toFixed(1)}
                      </div>
                      <p className="text-white/50">out of 10</p>
                    </div>
                  )}
                </div>
              )}

              {/* Other judges waiting */}
              <div className="flex gap-3 justify-center">
                {Object.values(JUDGES).map((judge) => (
                  <div
                    key={judge.id}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      currentJudge?.id === judge.id
                        ? 'ring-2 ring-white scale-110'
                        : 'opacity-50'
                    }`}
                  >
                    {judge.avatar}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DELIBERATION */}
        {phase === 'deliberation' && (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">The Judges Are Deliberating...</h2>
            <div className="flex justify-center gap-8 mb-8">
              {Object.values(JUDGES).map((judge, i) => (
                <div key={judge.id} className="text-center animate-bounce" style={{ animationDelay: `${i * 200}ms` }}>
                  <div className="text-5xl mb-2">{judge.avatar}</div>
                  <div className={`w-3 h-3 mx-auto rounded-full bg-gradient-to-r ${judge.color} animate-pulse`}></div>
                </div>
              ))}
            </div>
            <p className="text-white/60">Calculating final scores and rankings...</p>
          </div>
        )}

        {/* WINNER REVEALS */}
        {(phase === 'reveal-3rd' || phase === 'reveal-2nd' || phase === 'reveal-1st') && (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">
              {phase === 'reveal-3rd' && '🥉 Third Place'}
              {phase === 'reveal-2nd' && '🥈 Second Place'}
              {phase === 'reveal-1st' && '🥇 First Place'}
            </h2>

            {revealedWinners.length > 0 && (
              <div className="flex justify-center gap-6">
                {revealedWinners.map((winner, idx) => {
                  const isNew = idx === revealedWinners.length - 1;
                  const placeEmoji = ['🥉', '🥈', '🥇'][idx];
                  return (
                    <div
                      key={winner.odId}
                      className={`p-6 rounded-2xl border transition-all duration-500 ${
                        isNew
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 scale-110 animate-scale-in'
                          : 'bg-white/5 border-white/10 scale-90 opacity-70'
                      }`}
                    >
                      <div className="text-4xl mb-2">{placeEmoji}</div>
                      <div className="text-xl font-bold">{winner.odName}</div>
                      <div className="text-3xl font-black text-amber-400 mt-2">
                        {winner.totalScore.toFixed(1)}/30
                      </div>
                      {winner.prize && winner.prize > 0 && (
                        <div className="text-green-400 font-bold mt-2">
                          +${winner.prize.toFixed(2)} USDC
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CELEBRATION */}
        {phase === 'celebration' && sortedResults[0] && (
          <div className="text-center animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Congratulations!
            </h1>
            <p className="text-2xl text-white/80 mb-8">
              {sortedResults[0].odName} wins with {sortedResults[0].totalScore.toFixed(1)} points!
            </p>

            {/* Final Standings */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {sortedResults.slice(0, 3).map((result, idx) => (
                <div
                  key={result.odId}
                  className={`p-4 rounded-xl border ${
                    idx === 0
                      ? 'bg-amber-500/20 border-amber-500/50'
                      : idx === 1
                        ? 'bg-gray-400/20 border-gray-400/50'
                        : 'bg-orange-700/20 border-orange-700/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{['🥇', '🥈', '🥉'][idx]}</div>
                  <div className="font-bold">{result.odName}</div>
                  <div className="text-white/60 text-sm">{result.totalScore.toFixed(1)} pts</div>
                  <div className="text-green-400 font-bold">${result.prize?.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Claim Your Prize
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <span className="text-xl">×</span>
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; opacity: 0; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
