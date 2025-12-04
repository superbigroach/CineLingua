'use client';

import { useState } from 'react';
import { loginUser, loginUserSync } from '@/lib/userStore';

interface LoginModalProps {
  onLogin: (user: any) => void;
  onClose: () => void;
  language?: string;
}

// Localized strings for different languages
const translations: Record<string, { title: string; subtitle: string; name: string; email: string; button: string; benefits: string }> = {
  fr: { title: 'Commencer', subtitle: 'Créez un compte pour suivre vos progrès', name: 'Votre nom', email: 'Adresse e-mail', button: 'Commencer le français!', benefits: 'Avantages du compte:' },
  es: { title: 'Empezar', subtitle: 'Crea una cuenta para seguir tu progreso', name: 'Tu nombre', email: 'Correo electrónico', button: 'Empezar español!', benefits: 'Beneficios de la cuenta:' },
  de: { title: 'Starten', subtitle: 'Erstelle ein Konto, um deinen Fortschritt zu verfolgen', name: 'Dein Name', email: 'E-Mail-Adresse', button: 'Deutsch lernen!', benefits: 'Kontovorteile:' },
  it: { title: 'Inizia', subtitle: 'Crea un account per monitorare i tuoi progressi', name: 'Il tuo nome', email: 'Indirizzo email', button: 'Inizia italiano!', benefits: 'Vantaggi dell\'account:' },
  pt: { title: 'Começar', subtitle: 'Crie uma conta para acompanhar seu progresso', name: 'Seu nome', email: 'Endereço de e-mail', button: 'Começar português!', benefits: 'Benefícios da conta:' },
  ja: { title: '始める', subtitle: 'アカウントを作成して進捗を追跡', name: 'お名前', email: 'メールアドレス', button: '日本語を始める!', benefits: 'アカウントの特典:' },
  ko: { title: '시작하기', subtitle: '계정을 만들어 진행 상황을 추적하세요', name: '이름', email: '이메일 주소', button: '한국어 시작!', benefits: '계정 혜택:' },
  zh: { title: '开始学习', subtitle: '创建账户以跟踪您的进度', name: '您的姓名', email: '电子邮件地址', button: '开始学中文!', benefits: '账户优势:' },
  hi: { title: 'शुरू करें', subtitle: 'अपनी प्रगति को ट्रैक करने के लिए खाता बनाएं', name: 'आपका नाम', email: 'ईमेल पता', button: 'हिंदी शुरू करें!', benefits: 'खाता लाभ:' },
  ar: { title: 'ابدأ', subtitle: 'أنشئ حسابًا لتتبع تقدمك', name: 'اسمك', email: 'البريد الإلكتروني', button: 'ابدأ العربية!', benefits: 'مزايا الحساب:' },
  ru: { title: 'Начать', subtitle: 'Создайте аккаунт для отслеживания прогресса', name: 'Ваше имя', email: 'Электронная почта', button: 'Начать русский!', benefits: 'Преимущества аккаунта:' },
  tr: { title: 'Başla', subtitle: 'İlerlemenizi takip etmek için hesap oluşturun', name: 'Adınız', email: 'E-posta adresi', button: 'Türkçe başla!', benefits: 'Hesap avantajları:' },
};

export default function LoginModal({ onLogin, onClose, language = 'fr' }: LoginModalProps) {
  const t = translations[language] || translations.fr;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

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

    // Get immediate local user, Supabase syncs in background
    const user = loginUserSync(email, name);
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
              {t.title}
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-white/60 text-sm">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                {t.name}
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
                {t.email}
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
              {t.button}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <p className="text-sm font-medium mb-3">{t.benefits}</p>
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
