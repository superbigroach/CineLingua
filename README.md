# CineLingua - Learn Languages Through Cinema

**Built for Agentics TV5 Hackathon 2025**

An AI-powered language learning platform that helps users discover popular movies from different Francophone regions and learn French while watching.

## Sponsor Integrations

| Sponsor | Integration | Status |
|---------|-------------|--------|
| **TV5 Monde** | French content from Francophone regions (France, Belgium, Canada, Senegal, etc.) via TMDB | ✅ Complete |
| **Google AI** | Gemini-powered language tutor agents (vocabulary, phrases, quizzes) | ✅ Complete |
| **Kaltura** | Video player with interactive learning features | 🔶 Placeholder |

## Features

- 🌍 **Regional Discovery**: Explore popular movies from 8+ Francophone regions
- 🤖 **AI Language Tutor**: Gemini generates vocabulary, phrases, and cultural context
- 📚 **Adaptive Learning**: Content difficulty based on user level
- 🎬 **Interactive Video**: (Coming) Dual subtitles with clickable vocabulary
- ❓ **Comprehension Quizzes**: AI-generated questions to test understanding

## Quick Start (100% FREE)

### 1. Get Free API Keys

1. **TMDB** (Movie Database - FREE):
   - Go to https://www.themoviedb.org/signup
   - Create account → Settings → API → Request API key
   - Copy the "API Key (v3 auth)"

2. **Google Gemini** (AI - FREE tier: 60 req/min):
   - Go to https://aistudio.google.com/apikey
   - Sign in with Google
   - Click "Create API key"

### 2. Setup Project

```bash
cd /mnt/e/cinelingua

# Edit .env.local with your keys
nano .env.local
```

Add your keys:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
cinelingua/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   └── api/
│   │       ├── movies/       # TMDB integration
│   │       └── learn/        # Gemini AI agents
│   └── lib/
│       ├── tmdb.ts           # Movie API client
│       └── gemini.ts         # AI language tutor agents
├── .env.local                # API keys (not committed)
└── README.md
```

## AI Agents (Gemini-powered)

1. **Discovery Agent** - Recommends movies based on learning level & interests
2. **Tutor Agent** - Explains vocabulary with translations, pronunciation, examples
3. **Quiz Agent** - Generates comprehension questions
4. **Cultural Agent** - Provides cultural context for films

## Deploy Free

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```
Add env vars in Vercel dashboard.

### Option B: Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash
- **Data**: TMDB API (French movies)
- **Hosting**: Vercel / Firebase (free tier)

## License

MIT - Built for Agentics TV5 Hackathon 2025
