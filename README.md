# CineLingua - Learn French Through Cinema

**Built for Agentics TV5 Hackathon 2025**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cine--lingua.vercel.app-purple)](https://cine-lingua.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-blue)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com)

An AI-powered language learning platform that helps users discover popular movies from Francophone regions worldwide and learn French through cinema. Watch trailers, learn vocabulary, take quizzes, compete on leaderboards, and immerse yourself in French culture!

## Live Demo

**Try it now:** [https://cine-lingua.vercel.app](https://cine-lingua.vercel.app)

---

## How to Use CineLingua (Step-by-Step Guide)

### Getting Started

1. **Visit the App** - Go to [cine-lingua.vercel.app](https://cine-lingua.vercel.app)
2. **Create Account** (Optional but recommended)
   - Click the **"Login"** button in the top-right corner
   - Enter your name and email
   - Click **"Start Learning French!"**
   - Your progress will now be tracked and saved

### Browsing Movies

1. **View Movie Grid** - You'll see 16 popular French movies displayed as posters
2. **Filter by Region** - Click any flag button to see movies from specific Francophone regions:
   - 🇫🇷 France | 🇧🇪 Belgium | 🇨🇦 Canada | 🇨🇭 Switzerland
   - 🇸🇳 Senegal | 🇲🇦 Morocco | 🇹🇳 Tunisia | 🇨🇮 Ivory Coast
3. **Click "All French"** to see movies from all regions

### Learning from a Movie

1. **Click any movie poster** - This triggers the learning experience:
   - ✅ YouTube trailer loads automatically (with French captions)
   - ✅ AI generates vocabulary and phrases
   - ✅ You earn **+10 XP** for exploring
   - ✅ Side-by-side French/English title appears

2. **Watch the Trailer** - Listen to authentic French dialogue with captions enabled

3. **Study Vocabulary** (Right panel on desktop, below trailer on mobile)
   - See 6+ vocabulary words with translations
   - Each word shows difficulty level (beginner/intermediate/advanced)
   - **Click the speaker icon** 🔊 to hear pronunciation

4. **Read Useful Phrases** - Common expressions from the movie with meanings

### Interactive Features

#### Take a Quiz
1. Click the **"Quiz"** button (purple brain icon)
2. Answer multiple-choice questions about the vocabulary
3. See instant feedback - green for correct, red for wrong
4. Get explanations after each question
5. Earn **+25 XP** for completing, **+50 XP** for perfect score!

#### Practice with Flashcards
1. Click the **"Flashcards"** button (cyan cards icon)
2. See a French word on the card
3. **Click the card** to flip and reveal the English translation
4. **Swipe right** or click ✓ if you know it (earns +5 XP)
5. **Swipe left** or click ✗ to keep practicing
6. Click 🔊 to hear pronunciation

#### Chat with AI Tutor
1. Click the **"Ask AI"** button (green robot icon)
2. Type any question about French language or the movie
3. Use quick suggestions like "Explain the grammar" or "More vocabulary"
4. Have a conversation - the AI remembers context!

### Gamification Features

#### XP & Leveling
- **Watch trailer**: +10 XP
- **Learn a word**: +5 XP
- **Complete quiz**: +25 XP
- **Perfect quiz**: +50 XP
- **Daily streak**: +15 XP
- **Invite friend**: +100 XP

#### 10 Levels to Achieve
| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Débutant | 0 |
| 2 | Novice | 100 |
| 3 | Apprenti | 300 |
| 4 | Intermédiaire | 600 |
| 5 | Avancé | 1,000 |
| 6 | Expert | 1,500 |
| 7 | Maître | 2,100 |
| 8 | Grand Maître | 2,800 |
| 9 | Virtuose | 3,600 |
| 10 | Francophile | 5,000 |

#### Leaderboard
1. Click the **trophy icon** 🏆 in the navbar
2. View rankings for: Daily | Weekly | Monthly | All-Time
3. See your position among all learners
4. Top 3 get gold, silver, bronze medals!

#### Invite Friends
1. Click the **invite icon** 👤+ in the navbar
2. Enter friend's email to send invite (+100 XP)
3. Or share via Twitter, WhatsApp, LinkedIn
4. Copy the link to share anywhere

### Navbar Features (When Logged In)
- **⭐ XP Counter** - Your total experience points
- **🔥 Streak** - Days in a row you've learned
- **🏆 Trophy** - Open leaderboard
- **👤+ Invite** - Invite friends
- **Avatar** - Your profile with level title

---

## Features Summary

### Core Learning
- Regional movie discovery from 8+ Francophone countries
- AI-generated vocabulary with difficulty levels
- YouTube trailers with French captions
- Useful phrases with contextual meanings
- Side-by-side English/French translation
- Text-to-speech pronunciation (Web Speech API)

### Gamification
- XP rewards for all learning activities
- 10-level progression system with French titles
- Daily streak tracking
- Interactive quizzes with instant feedback
- Swipeable flashcard learning
- AI chatbot tutor (powered by Gemini)

### Social
- Global leaderboard (daily/weekly/monthly/all-time)
- Friend invites via email
- Social sharing (Twitter, WhatsApp, LinkedIn)
- Cloud-synced progress (Supabase)

---

## Quick Start (For Developers)

### Prerequisites
- Node.js 18+
- Free API keys (instructions below)

### 1. Clone & Install

```bash
git clone https://github.com/superbigroach/CineLingua.git
cd CineLingua
npm install
```

### 2. Get API Keys

**TMDB** (Movie Database - FREE):
1. Sign up at https://www.themoviedb.org/signup
2. Go to Settings → API → Request API key
3. Copy "API Key (v3 auth)"

**Google Gemini** (AI - FREE tier):
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google → Create API key

**Supabase** (Database - FREE tier):
1. Go to https://supabase.com
2. Create new project
3. Copy Project URL and anon key from Settings → API

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-schema.sql`
3. Run the query

### 5. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
cinelingua/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app with all features
│   │   └── api/
│   │       ├── movies/route.ts   # TMDB movie fetching
│   │       ├── learn/route.ts    # Gemini AI vocabulary/quiz
│   │       ├── chat/route.ts     # AI chatbot
│   │       └── trailer/route.ts  # YouTube trailer
│   ├── components/
│   │   ├── LoginModal.tsx        # User registration
│   │   ├── QuizModal.tsx         # Interactive quiz
│   │   ├── FlashcardModal.tsx    # Swipeable cards
│   │   ├── ChatbotModal.tsx      # AI conversation
│   │   ├── LeaderboardModal.tsx  # Rankings
│   │   └── InviteFriendModal.tsx # Social sharing
│   └── lib/
│       ├── supabase.ts           # Database client
│       ├── userStore.ts          # User/XP management
│       ├── tmdb.ts               # Movie API
│       └── gemini.ts             # AI agents
├── supabase-schema.sql           # Database tables
└── README.md
```

---

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash
- **Database**: Supabase (PostgreSQL)
- **APIs**: TMDB (movies), YouTube (trailers)
- **Speech**: Web Speech API
- **Hosting**: Vercel

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_TMDB_API_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## Sponsor Integrations

| Sponsor | Integration |
|---------|-------------|
| **TV5 Monde** | French content from 8 Francophone regions |
| **Google AI** | Gemini powers vocabulary, quizzes, chatbot |
| **YouTube** | Trailer player with French captions |
| **Supabase** | Cloud database for user progress |

---

## License

MIT License - Built for Agentics TV5 Hackathon 2025

---

**Made with ❤️ for the Agentics TV5 Hackathon 2025**

*Learn French. Watch Movies. Compete. Level Up!*
