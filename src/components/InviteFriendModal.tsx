'use client';

import { useState } from 'react';
import { sendFriendInvite, getCurrentUser } from '@/lib/userStore';

interface InviteFriendModalProps {
  onClose: () => void;
}

export default function InviteFriendModal({ onClose }: InviteFriendModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!currentUser) {
      setError('Please login first to invite friends');
      return;
    }

    // Send invite
    sendFriendInvite(currentUser.id, email);

    // In production, you'd also send an actual email here via an API
    // For demo, we just record it and show success
    setSent(true);
  };

  const shareLink = typeof window !== 'undefined' ? window.location.origin : 'https://cine-lingua.vercel.app';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Learn French by watching movies with CineLingua! Join me: ' + shareLink)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent('Learn French by watching movies with CineLingua! Join me: ' + shareLink)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[rgba(15,15,20,0.98)] rounded-3xl max-w-md w-full border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/20 to-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-user-plus text-pink-400"></i>
              Invite Friends
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-white/60 text-sm">Earn 100 XP for each friend you invite!</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
                <i className="fas fa-check text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Invitation Sent!</h3>
              <p className="text-white/60 mb-6">
                We've sent an invite to <span className="text-white">{email}</span>
              </p>
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30 mb-6">
                <p className="text-green-400 text-sm">
                  <i className="fas fa-gift mr-2"></i>
                  +100 XP earned for inviting a friend!
                </p>
              </div>
              <button
                onClick={() => { setEmail(''); setSent(false); }}
                className="px-6 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-all mr-3"
              >
                Invite Another
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Email invite */}
              <form onSubmit={handleInvite} className="mb-6">
                <label className="block text-sm text-white/60 mb-2">
                  Invite by email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-white/30 text-sm">or share via</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Social share buttons */}
              <div className="flex justify-center gap-4 mb-6">
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 flex items-center justify-center hover:bg-[#1DA1F2]/30 transition-all"
                >
                  <i className="fab fa-twitter text-[#1DA1F2] text-xl"></i>
                </a>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center hover:bg-[#25D366]/30 transition-all"
                >
                  <i className="fab fa-whatsapp text-[#25D366] text-xl"></i>
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-[#0077B5]/20 border border-[#0077B5]/30 flex items-center justify-center hover:bg-[#0077B5]/30 transition-all"
                >
                  <i className="fab fa-linkedin text-[#0077B5] text-xl"></i>
                </a>
              </div>

              {/* Copy link */}
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-white/40 mb-2">Or copy link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-white/70"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareLink)}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
