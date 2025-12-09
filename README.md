# CineLingua - Learn Languages Through Cinema & AI Video Creation

**Built for Google AI Hackathon 2025**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cine--lingua.vercel.app-cyan)](https://cine-lingua.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Google Veo](https://img.shields.io/badge/Google-Veo%202-blue)](https://cloud.google.com/vertex-ai)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-purple)](https://ai.google.dev)
[![Base](https://img.shields.io/badge/Base-Sepolia-0052FF)](https://base.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com)

An AI-powered language learning platform that combines cinema, AI video generation, and Web3 contests. Watch trailers, learn vocabulary, create AI-generated movie scenes with **Google Veo 2**, compete in weekly contests, and win **USDC prizes** on Base blockchain!

## Live Demo

**Try it now:** [https://cine-lingua.vercel.app](https://cine-lingua.vercel.app)

---

## What Makes CineLingua Special

| Feature | Technology | Description |
|---------|------------|-------------|
| **AI Video Generation** | Google Veo 2 | Create 8-second cinematic scenes from text prompts |
| **Smart Vocabulary** | Google Gemini 2.5 | AI-generated vocabulary, quizzes, and tutoring |
| **Weekly Contests** | Base Blockchain | Compete for USDC prize pools with smart contracts |
| **AI Judges** | Gemini-powered | Three AI judges score submissions: Cinematographer, Linguist, Audience |
| **Crypto Wallet** | Circle & MetaMask | Manage USDC earnings and contest entries |

---

## App Structure

```
CineLingua/
├── Learn      → Browse movies, watch trailers, learn vocabulary
├── Studio     → Manage your AI-generated videos, explore others
├── Contest    → Weekly competitions with real prizes
├── Wallet     → USDC balance, transactions, earnings
└── Info       → About the platform
```

---

## How It Works

### 1. Learn (Free)
1. Browse movies from 8+ Francophone regions
2. Watch YouTube trailers with French captions
3. Study AI-generated vocabulary with pronunciation
4. Take quizzes and practice with flashcards
5. Chat with AI tutor for personalized help

### 2. Create & Compete ($4.80 entry)
1. **Take Quiz** → Unlock vocabulary "ingredients"
2. **Write Scene** → Craft a prompt using unlocked words
3. **Generate Video** → Veo 2 creates your 8-second scene
4. **Submit** → Enter the weekly contest

### 3. Win Prizes
- **AI Judging** → Three judges score your submission (max 30 points)
- **Live Show** → Winners announced in weekly livestream
- **Prize Split**: 1st (50%) | 2nd (30%) | 3rd (20%)

---

## Contest Economics

| Cost Breakdown | Amount |
|----------------|--------|
| Video Generation (Veo 2) | $2.40 |
| Prize Pool Stake | $1.90 |
| Platform Fee | $0.50 |
| **Total Entry** | **$4.80 USDC** |

**Prize Distribution:**
- 80% → Winners pool (split 50/30/20)
- 20% → Platform fee

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ethers.js** - Blockchain interactions

### AI & Video
- **Google Veo 2** - AI video generation (Vertex AI)
- **Google Gemini 2.5 Flash** - Vocabulary, quizzes, judging, chat
- **Web Speech API** - Text-to-speech pronunciation

### Blockchain
- **Base Sepolia** - Testnet for smart contracts
- **Solidity** - Smart contract language
- **USDC** - Stablecoin for payments
- **Hardhat** - Contract development & deployment

### Backend & Data
- **Supabase** - PostgreSQL database
- **TMDB API** - Movie metadata & posters
- **YouTube API** - Trailer embedding
- **Circle** - Wallet infrastructure

---

## Smart Contract

**CineSceneContest.sol** - Deployed on Base Sepolia

| Function | Description |
|----------|-------------|
| `submitEntry()` | Submit contest entry with USDC stake |
| `updateVideoHash()` | Link generated video to entry |
| `setScores()` | Admin sets AI judge scores |
| `claimPrize()` | Winners claim their rewards |
| `withdrawFees()` | Platform withdraws fees |

**Contract Address:** `0x567aFe456ceCA40e108Edf3DF72D8b190C542A0f`

**View on BaseScan:** [Contract Link](https://sepolia.basescan.org/address/0x567aFe456ceCA40e108Edf3DF72D8b190C542A0f)

---

## AI Judges

Three AI personas powered by Gemini score each submission:

| Judge | Focus | Criteria |
|-------|-------|----------|
| **Le Cinéaste** 🎬 | Visual Quality | Composition, lighting, camera work, mood |
| **Le Linguiste** 🗣️ | Language Use | Vocabulary integration, cultural authenticity |
| **Le Public** 🎭 | Entertainment | Creativity, emotional impact, memorability |

Each judge scores 1-10. Maximum total: **30 points**.

---

## Project Structure

```
cinelingua/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Learn - Movie browsing & vocabulary
│   │   ├── studio/page.tsx          # Studio - Video management
│   │   ├── contest/page.tsx         # Contest - Weekly competitions
│   │   ├── wallet/page.tsx          # Wallet - USDC & transactions
│   │   ├── about/page.tsx           # Info - About the platform
│   │   ├── login/page.tsx           # Authentication
│   │   └── api/
│   │       ├── video/generate/      # Veo video generation
│   │       ├── scene-challenge/     # Contest logic & judging
│   │       ├── chat/                # AI tutor chatbot
│   │       ├── learn/               # Vocabulary generation
│   │       ├── movies/              # TMDB integration
│   │       └── wallet/              # Circle wallet API
│   ├── components/
│   │   ├── SceneCreatorModal.tsx    # Video prompt builder
│   │   ├── JudgingShowModal.tsx     # Live judging display
│   │   ├── QuizModal.tsx            # Vocabulary quizzes
│   │   ├── FlashcardModal.tsx       # Swipeable flashcards
│   │   ├── ChatbotModal.tsx         # AI conversation
│   │   └── NavBar.tsx               # Navigation
│   └── lib/
│       ├── veo.ts                   # Google Veo integration
│       ├── contract.ts              # Smart contract helpers
│       ├── sceneChallenge.ts        # Contest logic
│       ├── circle.ts                # Circle wallet
│       ├── supabase.ts              # Database client
│       └── gemini.ts                # AI prompts
├── contracts/
│   ├── CineSceneContest.sol         # Main contest contract
│   ├── scripts/deploy.ts            # Deployment script
│   └── hardhat.config.ts            # Hardhat configuration
├── supabase-schema.sql              # Database schema
└── supabase-schema-contests.sql     # Contest tables
```

---

## Environment Variables

```env
# Google Cloud / Vertex AI (Veo)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
VERTEX_AI_LOCATION=us-central1

# Google Gemini
GEMINI_API_KEY=your-gemini-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-key

# Smart Contract (Base Sepolia)
NEXT_PUBLIC_CONTEST_CONTRACT=0x567aFe456ceCA40e108Edf3DF72D8b190C542A0f
DEPLOYER_PRIVATE_KEY=0x...  # Only for deployment
BASESCAN_API_KEY=your-key   # For verification

# Circle (Wallet)
CIRCLE_TESTNET_API_KEY=your-key
CIRCLE_WALLET_SET_ID=your-wallet-set
NEXT_PUBLIC_CIRCLE_CLIENT_URL=https://...
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud account with Vertex AI enabled
- MetaMask wallet with Base Sepolia testnet

### Installation

```bash
# Clone repository
git clone https://github.com/superbigroach/CineLingua.git
cd CineLingua

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in your API keys

# Run development server
npm run dev
```

### Get Test Tokens

1. **Test ETH** (for gas): https://www.alchemy.com/faucets/base-sepolia
2. **Test USDC**: https://faucet.circle.com (select Base Sepolia)

---

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy!

### Smart Contract (Base Sepolia)

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.ts --network baseSepolia
```

---

## Hackathon Submission

### Google AI Hackathon 2025

**Track:** AI Agents / Creative AI

**Google Technologies Used:**
- **Veo 2** - AI video generation from text prompts
- **Gemini 2.5 Flash** - Vocabulary generation, quiz creation, AI judging, chatbot
- **Vertex AI** - Cloud AI platform for Veo deployment
- **Firebase** - Authentication (optional)

**Problem Solved:**
Traditional language learning is boring. CineLingua makes it engaging by:
1. Using cinema as the learning medium
2. Letting users CREATE content, not just consume it
3. Adding competition and real monetary stakes
4. Providing AI tutoring personalized to each learner

**Innovation:**
- First platform to combine AI video generation with language learning
- Gamified creation contests with blockchain-verified prizes
- AI judges provide educational feedback, not just scores

---

## Demo Video

[Link to YouTube demo] - Coming soon

---

## Screenshots

| Learn | Contest | Studio |
|-------|---------|--------|
| Browse movies & vocabulary | Create AI scenes | Manage your videos |

---

## Team

Built by **Sebastian** for Google AI Hackathon 2025

---

## License

MIT License

---

## Links

- **Live App:** https://cine-lingua.vercel.app
- **GitHub:** https://github.com/superbigroach/CineLingua
- **Contract:** https://sepolia.basescan.org/address/0x567aFe456ceCA40e108Edf3DF72D8b190C542A0f

---

**Made with ❤️ using Google AI**

*Learn Languages. Create Scenes. Win Prizes.*
