'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardEntry, getCurrentUser } from '@/lib/userStore';

interface LeaderboardModalProps {
  onClose: () => void;
}

type Period = 'all' | 'monthly' | 'weekly' | 'daily';

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [period, setPeriod] = useState<Period>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getLeaderboard(period);
      setLeaderboard(data);
      setCurrentUser(getCurrentUser());
    }
    loadData();
  }, [period]);

  const periods: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <i className="fas fa-crown text-yellow-400"></i>;
    if (rank === 2) return <i className="fas fa-medal text-gray-300"></i>;
    if (rank === 3) return <i className="fas fa-medal text-amber-600"></i>;
    return <span className="text-white/50">{rank}</span>;
  };

  const userRank = currentUser ? leaderboard.findIndex(u => u.id === currentUser.id) + 1 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(15,15,20,0.98)] rounded-3xl max-w-lg w-full border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-trophy text-yellow-400"></i>
              Leaderboard
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Period tabs */}
          <div className="flex gap-2">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : rank <= 3
                        ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                        : 'bg-white/5'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center text-lg font-bold">
                    {getMedalIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      {isCurrentUser && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <span>Level {user.level}</span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-fire text-orange-400"></i>
                        {user.streak} day streak
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">{user.xp.toLocaleString()}</div>
                    <div className="text-xs text-white/50">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current user summary (if not in top 20) */}
        {currentUser && userRank === 0 && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-xs text-white/50">Keep learning to climb the ranks!</p>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold">{currentUser.xp} XP</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
