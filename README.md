# CineLingua - Learn French Through Cinema

**Built for Agentics TV5 Hackathon 2025**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cine--lingua.vercel.app-purple)](https://cine-lingua.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-blue)](https://ai.google.dev)

An AI-powered language learning platform that helps users discover popular movies from Francophone regions worldwide and learn French through cinema. Watch trailers, learn vocabulary, and immerse yourself in French culture!

## Live Demo

**Try it now:** [https://cine-lingua.vercel.app](https://cine-lingua.vercel.app)

## How It Works

CineLingua is a **movie discovery and language preparation tool**. Here's the learning flow:

1. **Browse Movies** - Explore popular French films from 8+ Francophone regions (France, Belgium, Canada, Senegal, Morocco, etc.)
2. **Watch Trailers** - Preview movies with embedded YouTube trailers featuring authentic French dialogue
3. **Learn Vocabulary** - AI generates key words, phrases, and cultural context specific to each film
4. **Watch & Understand** - Use your new knowledge to enjoy the full movie with better comprehension!

## Sponsor Integrations

| Sponsor | Integration | How It's Used |
|---------|-------------|---------------|
| **TV5 Monde** | French content from Francophone regions | Movies from France, Belgium, Canada, Senegal, Morocco, Tunisia, Ivory Coast, Switzerland via TMDB API |
| **Google AI** | Gemini-powered language tutor | Generates vocabulary, phrases, cultural context, and practice questions for each movie |
| **YouTube** | Video player for trailers | Embedded trailer player with French closed captions enabled |

## Features

- **Regional Discovery** - Explore popular movies from 8 Francophone regions with flags and filters
- **AI Language Tutor** - Gemini generates vocabulary with difficulty levels (beginner/intermediate/advanced)
- **YouTube Trailer Player** - Watch trailers with French captions to hear authentic pronunciation
- **Useful Phrases** - Learn common expressions and idioms used in each film
- **Cultural Context** - Understand the cultural significance and themes of French cinema
- **Practice Questions** - AI-generated comprehension questions to test your understanding
- **Beautiful UI** - Modern dark theme with purple accents, responsive design

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Free API keys (instructions below)

### 1. Clone the Repository

```bash
git clone https://github.com/superbigroach/CineLingua.git
cd CineLingua
```

### 2. Get Free API Keys

**TMDB** (Movie Database - 100% FREE):
1. Go to https://www.themoviedb.org/signup
2. Create account → Settings → API → Request API key
3. Copy the "API Key (v3 auth)"

**Google Gemini** (AI - FREE tier: 60 requests/minute):
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API key"

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cinelingua/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI with movie grid, trailer player, AI tutor
│   │   ├── layout.tsx            # App layout with metadata
│   │   └── api/
│   │       ├── movies/route.ts   # TMDB API - fetches French movies by region
│   │       ├── learn/route.ts    # Gemini AI - generates learning content
│   │       └── trailer/route.ts  # YouTube trailer - fetches video IDs
│   └── lib/
│       ├── tmdb.ts               # TMDB client - French movies, regions, trailers
│       └── gemini.ts             # Gemini AI agents - vocab, phrases, cultural context
├── .env.local                    # API keys (create this file, not in git)
├── package.json
└── README.md
```

## AI Agents (Gemini-powered)

CineLingua uses Google's Gemini AI to power intelligent language tutoring:

| Agent | Function |
|-------|----------|
| **Movie Content Agent** | Analyzes film synopsis to extract vocabulary and phrases |
| **Vocabulary Agent** | Provides word definitions, translations, pronunciation guides |
| **Cultural Agent** | Explains French cultural context and film themes |
| **Quiz Agent** | Generates comprehension questions for practice |

## Francophone Regions

Explore content from around the French-speaking world:

| Region | Flag | Description |
|--------|------|-------------|
| France | 🇫🇷 | Metropolitan French cinema |
| Belgium | 🇧🇪 | Belgian French films |
| Canada (Quebec) | 🇨🇦 | Quebecois cinema |
| Switzerland | 🇨🇭 | Swiss French content |
| Senegal | 🇸🇳 | West African Francophone cinema |
| Morocco | 🇲🇦 | North African French films |
| Tunisia | 🇹🇳 | Tunisian French cinema |
| Ivory Coast | 🇨🇮 | Ivorian French content |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom purple/gray theme
- **AI**: Google Gemini 1.5 Flash (generative AI for language tutoring)
- **Movie Data**: TMDB API (The Movie Database)
- **Video**: YouTube embedded player (trailers with captions)
- **Hosting**: Vercel (auto-deploys from GitHub)

## Deployment

### Vercel (Recommended - FREE)

The easiest way to deploy:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_TMDB_API_KEY`
   - `GEMINI_API_KEY`
5. Deploy! Auto-redeploys on every push to main.

### Manual Deploy

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/movies?type=french` | GET | Get popular French movies |
| `/api/movies?region=CA` | GET | Get movies by region (FR, CA, BE, etc.) |
| `/api/trailer?movieId=123` | GET | Get YouTube trailer for a movie |
| `/api/learn` | POST | Generate AI learning content |

### Example: Generate Learning Content

```bash
curl -X POST http://localhost:3000/api/learn \
  -H "Content-Type: application/json" \
  -d '{
    "action": "movie-content",
    "title": "Amélie",
    "overview": "Amelie is a story about a girl..."
  }'
```

## Screenshots

### Movie Discovery
Browse popular French movies from different regions with poster grid and ratings.

### AI Language Tutor
Click any movie to see AI-generated vocabulary, phrases, and cultural context.

### YouTube Trailer Player
Watch trailers with French captions enabled for listening practice.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - Built for Agentics TV5 Hackathon 2025

## Acknowledgments

- **TV5 Monde** - Inspiration for Francophone content discovery
- **Google AI** - Gemini API for intelligent language tutoring
- **TMDB** - Free movie database API
- **YouTube** - Trailer embedding with captions
- **Vercel** - Free hosting platform

---

**Made with love for the Agentics TV5 Hackathon 2025**

Learn French. Watch Movies. Immerse Yourself.
