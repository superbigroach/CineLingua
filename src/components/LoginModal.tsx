'use client';

import { useState } from 'react';
import { loginUserSync } from '@/lib/userStore';

interface LoginModalProps {
  onLogin: (user: any) => void;
  onClose: () => void;
  language?: string;
}

const translations: Record<string, { title: string; subtitle: string; name: string; email: string; button: string }> = {
  fr: { title: 'Bienvenue', subtitle: 'Connectez-vous pour commencer', name: 'Nom', email: 'Email', button: 'Continuer' },
  es: { title: 'Bienvenido', subtitle: 'Inicia sesión para comenzar', name: 'Nombre', email: 'Email', button: 'Continuar' },
  de: { title: 'Willkommen', subtitle: 'Melden Sie sich an', name: 'Name', email: 'Email', button: 'Weiter' },
  it: { title: 'Benvenuto', subtitle: 'Accedi per iniziare', name: 'Nome', email: 'Email', button: 'Continua' },
  pt: { title: 'Bem-vindo', subtitle: 'Entre para começar', name: 'Nome', email: 'Email', button: 'Continuar' },
  ja: { title: 'ようこそ', subtitle: 'ログインして始める', name: '名前', email: 'メール', button: '続ける' },
  ko: { title: '환영합니다', subtitle: '로그인하여 시작', name: '이름', email: '이메일', button: '계속' },
  zh: { title: '欢迎', subtitle: '登录开始', name: '姓名', email: '邮箱', button: '继续' },
  hi: { title: 'स्वागत है', subtitle: 'शुरू करने के लिए लॉगिन करें', name: 'नाम', email: 'ईमेल', button: 'जारी रखें' },
  ar: { title: 'مرحبا', subtitle: 'سجل الدخول للبدء', name: 'الاسم', email: 'البريد', button: 'متابعة' },
  ru: { title: 'Добро пожаловать', subtitle: 'Войдите, чтобы начать', name: 'Имя', email: 'Email', button: 'Продолжить' },
  tr: { title: 'Hoş geldiniz', subtitle: 'Başlamak için giriş yapın', name: 'İsim', email: 'Email', button: 'Devam' },
};

export default function LoginModal({ onLogin, onClose, language = 'fr' }: LoginModalProps) {
  const t = translations[language] || translations.fr;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    const user = loginUserSync(email, name);
    setTimeout(() => {
      onLogin(user);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-[28px] blur-xl opacity-60" />

        <div className="relative bg-[#0c0c14] rounded-[24px] border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
          >
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">{t.title}</h2>
            <p className="text-white/40 text-sm mt-1.5">{t.subtitle}</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider pl-1">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-[15px] placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider pl-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white text-[15px] placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-semibold text-[15px] text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{t.button}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '⭐', label: 'Track XP' },
                  { icon: '🏆', label: 'Compete' },
                  { icon: '📚', label: 'Save Progress' },
                  { icon: '🎬', label: 'Create Scenes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.02] rounded-lg">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-white/50 text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
