'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import JudgingShowModal from '@/components/JudgingShowModal';

// Mock data - in production, fetch from Supabase/smart contract
const MOCK_CONTEST = {
  id: '1',
  title: 'Week 1: Parisian Dreams',
  theme: 'Romantic Paris at twilight',
  language: 'French',
  prizePool: 48.00,
  startTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
  judgingStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min after end
  status: 'active' as const,
  entryCount: 12,
};

const MOCK_SUBMISSIONS = [
  {
    id: '1',
    userName: 'Marie D.',
    userAvatar: '',
    movieTitle: 'Amélie',
    prompt: 'A mysterious stranger watches from a rain-soaked café window...',
    usedIngredients: ['mystérieux', 'café', 'pluie'],
    score: 24.5,
    rank: 2,
  },
  {
    id: '2',
    userName: 'Pierre M.',
    userAvatar: '',
    movieTitle: 'The Intouchables',
    prompt: 'Two friends share a moment of joy on the Champs-Élysées...',
    usedIngredients: ['amitié', 'joie', 'liberté'],
    score: 26.2,
    rank: 1,
  },
  {
    id: '3',
    userName: 'Sophie L.',
    userAvatar: '',
    movieTitle: 'La Haine',
    prompt: 'Urban tension in the suburbs, youth searching for hope...',
    usedIngredients: ['banlieue', 'espoir', 'colère'],
    score: 22.1,
    rank: 3,
  },
];

type ContestStatus = 'upcoming' | 'active' | 'awaiting_judging' | 'judging' | 'completed';

export default function ContestPage() {
  const [contest, setContest] = useState(MOCK_CONTEST);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showJudgingModal, setShowJudgingModal] = useState(false);
  const [contestStatus, setContestStatus] = useState<ContestStatus>('active');

  // Update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let targetTime: Date;
      let label: string;

      if (now < contest.endTime) {
        targetTime = contest.endTime;
        label = 'Contest ends in';
        setContestStatus('active');
      } else if (now < contest.judgingStartTime) {
        targetTime = contest.judgingStartTime;
        label = 'Judging show starts in';
        setContestStatus('awaiting_judging');
      } else {
        setContestStatus('judging');
        setTimeRemaining('Judging in progress!');
        return;
      }

      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining('Starting soon...');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${label}: ${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${label}: ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${label}: ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const winnersPool = contest.prizePool * 0.8;
  const prizes = {
    first: winnersPool * 0.5,
    second: winnersPool * 0.3,
    third: winnersPool * 0.2,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="p-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
              CL
            </div>
            <span className="text-lg font-bold">
              <span className="text-white">Cine</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Lingua</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/wallet" className="text-white/60 hover:text-white text-sm">
              <i className="fas fa-wallet mr-2"></i>Wallet
            </Link>
            <Link href="/" className="text-white/60 hover:text-white text-sm">
              ← Back to Learning
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Contest Header */}
        <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏆</span>
                <h1 className="text-3xl font-black">{contest.title}</h1>
              </div>
              <p className="text-white/60 mb-4">{contest.theme} • {contest.language}</p>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                contestStatus === 'active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : contestStatus === 'awaiting_judging'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : contestStatus === 'judging'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse'
                      : 'bg-white/10 text-white/60 border border-white/20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  contestStatus === 'active' ? 'bg-green-400' :
                  contestStatus === 'awaiting_judging' ? 'bg-amber-400' :
                  contestStatus === 'judging' ? 'bg-purple-400 animate-pulse' :
                  'bg-white/40'
                }`}></div>
                {contestStatus === 'active' && 'Contest Active'}
                {contestStatus === 'awaiting_judging' && 'Awaiting Judging Show'}
                {contestStatus === 'judging' && 'Live Judging!'}
                {contestStatus === 'completed' && 'Completed'}
              </div>
            </div>

            {/* Prize Pool */}
            <div className="text-center lg:text-right">
              <p className="text-white/50 text-sm mb-1">Prize Pool</p>
              <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                ${contest.prizePool.toFixed(2)}
              </div>
              <p className="text-white/40 text-xs mt-1">{contest.entryCount} entries</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="mt-6 p-4 bg-black/30 rounded-xl text-center">
            <p className="text-xl font-bold text-white">
              {timeRemaining}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {contestStatus === 'active' && (
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <i className="fas fa-film mr-2"></i>
                Enter Contest
              </Link>
            )}

            {(contestStatus === 'awaiting_judging' || contestStatus === 'judging') && (
              <button
                onClick={() => setShowJudgingModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all animate-pulse"
              >
                <i className="fas fa-play mr-2"></i>
                Watch Judging Show
              </button>
            )}

            <Link
              href="/wallet"
              className="px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              <i className="fas fa-wallet mr-2"></i>
              Connect Wallet
            </Link>
          </div>
        </div>

        {/* Prize Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 border border-amber-500/30 text-center">
            <div className="text-4xl mb-2">🥇</div>
            <p className="text-amber-400 font-bold text-2xl">${prizes.first.toFixed(2)}</p>
            <p className="text-white/50 text-sm">1st Place (50%)</p>
          </div>
          <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-2xl p-6 border border-gray-400/30 text-center">
            <div className="text-4xl mb-2">🥈</div>
            <p className="text-gray-300 font-bold text-2xl">${prizes.second.toFixed(2)}</p>
            <p className="text-white/50 text-sm">2nd Place (30%)</p>
          </div>
          <div className="bg-gradient-to-br from-orange-700/20 to-orange-600/20 rounded-2xl p-6 border border-orange-700/30 text-center">
            <div className="text-4xl mb-2">🥉</div>
            <p className="text-orange-400 font-bold text-2xl">${prizes.third.toFixed(2)}</p>
            <p className="text-white/50 text-sm">3rd Place (20%)</p>
          </div>
        </div>

        {/* Submissions / Leaderboard */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-list-ol text-purple-400"></i>
              {contestStatus === 'completed' ? 'Final Results' : 'Current Submissions'}
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {submissions
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((submission, idx) => (
                <div
                  key={submission.id}
                  className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-all ${
                    idx < 3 ? 'bg-gradient-to-r from-transparent to-transparent' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx === 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : idx === 1
                        ? 'bg-gray-400/20 text-gray-300'
                        : idx === 2
                          ? 'bg-orange-700/20 text-orange-400'
                          : 'bg-white/10 text-white/50'
                  }`}>
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{submission.userName}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-sm">{submission.movieTitle}</span>
                    </div>
                    <p className="text-white/50 text-sm truncate">{submission.prompt}</p>
                    <div className="flex gap-2 mt-1">
                      {submission.usedIngredients.map((word, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  {submission.score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{submission.score.toFixed(1)}</div>
                      <div className="text-white/40 text-xs">/30 pts</div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📖</span> How The Contest Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-purple-300 mb-2">Entry Requirements</h4>
              <ul className="text-white/60 text-sm space-y-1">
                <li>• Watch a movie trailer & learn vocabulary</li>
                <li>• Pass quizzes to unlock 3+ prompt ingredients</li>
                <li>• Write a scene using your unlocked words</li>
                <li>• Pay $0.80 for video generation (Veo 3.1 Fast)</li>
                <li>• Stake $1.60 to enter the contest</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-purple-300 mb-2">Judging & Prizes</h4>
              <ul className="text-white/60 text-sm space-y-1">
                <li>• 30 minutes after contest ends, judging show begins</li>
                <li>• 3 AI judges score each scene (max 30 points)</li>
                <li>• Platform takes 20% of prize pool</li>
                <li>• Top 3 split remaining 80% (50/30/20)</li>
                <li>• Winners claim USDC via smart contract</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Judging Show Modal */}
      {showJudgingModal && (
        <JudgingShowModal
          contestId={contest.id}
          contestTitle={contest.title}
          prizePool={contest.prizePool}
          submissions={submissions.map(s => ({
            id: s.id,
            userName: s.userName,
            userAvatar: s.userAvatar,
            movieTitle: s.movieTitle,
            prompt: s.prompt,
            usedIngredients: s.usedIngredients,
          }))}
          onClose={() => setShowJudgingModal(false)}
          onJudgingComplete={(results) => {
            console.log('Judging complete:', results);
            // Update submissions with final scores
            setContestStatus('completed');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/40 text-xs">
            Smart Contract on Base Network • Powered by Google Veo 3.1 & Gemini AI
          </p>
        </div>
      </footer>
    </main>
  );
}
