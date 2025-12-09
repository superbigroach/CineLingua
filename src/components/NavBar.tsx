'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavBarProps {
  user?: {
    name: string;
    avatar: string;
    xp?: number;
    streak?: number;
  } | null;
  onLeaderboard?: () => void;
  onInvite?: () => void;
}

export default function NavBar({ user, onLeaderboard, onInvite }: NavBarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Learn' },
    { href: '/contest', label: 'Contest' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/about', label: 'Info' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1800px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">CL</div>
          <span className="text-base font-semibold tracking-tight hidden sm:block">
            <span className="text-white">Cine</span>
            <span className="text-cyan-400">Lingua</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-cyan-400 font-medium'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Stats */}
              {(user.xp !== undefined || user.streak !== undefined) && (
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                  {user.xp !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-white text-xs font-medium">{user.xp}</span>
                    </div>
                  )}
                  {user.xp !== undefined && user.streak !== undefined && (
                    <div className="w-px h-3 bg-white/10" />
                  )}
                  {user.streak !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-white text-xs font-medium">{user.streak}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard */}
              {onLeaderboard && (
                <button
                  onClick={onLeaderboard}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center hover:bg-white/[0.06] transition-all"
                  title="Leaderboard"
                >
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
              )}

              {/* Invite */}
              {onInvite && (
                <button
                  onClick={onInvite}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center hover:bg-white/[0.06] transition-all"
                  title="Invite"
                >
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
              )}

              {/* Avatar */}
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
            </>
          )}
          {!user && <div className="w-8 h-8" />}
        </div>
      </div>
    </nav>
  );
}
