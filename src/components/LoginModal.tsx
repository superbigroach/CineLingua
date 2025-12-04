'use client';

import { useState } from 'react';
import { loginUser } from '@/lib/userStore';

interface LoginModalProps {
  onLogin: (user: any) => void;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!name.trim() || name.length < 2) {
      setError('Please enter your name');
      return;
    }

    const user = loginUser(email, name);
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(15,15,20,0.98)] rounded-3xl max-w-md w-full border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-user-circle text-cyan-400"></i>
              Start Learning
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-white/60 text-sm">Create an account to track your progress</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean-Pierre"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              <i className="fas fa-rocket mr-2"></i>
              Start Learning French!
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <p className="text-sm font-medium mb-3">Account benefits:</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Track XP and level up
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Compete on leaderboards
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Save vocabulary progress
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                Invite friends & earn XP
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
