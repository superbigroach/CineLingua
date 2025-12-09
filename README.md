# CineLingua - Learn Languages Through Cinema & AI Video Creation

**Built for Google AI Hackathon 2025**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cine--lingua.vercel.app-cyan)](https://cine-lingua.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Google Veo 3.1](https://img.shields.io/badge/Google-Veo%203.1-blue)](https://cloud.google.com/vertex-ai)
[![Gemini 2.5](https://img.shields.io/badge/Google-Gemini%202.5-purple)](https://ai.google.dev)
[![Base](https://img.shields.io/badge/Base-Sepolia-0052FF)](https://base.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com)

An AI-powered language learning platform that combines cinema, AI video generation, and Web3 contests. Watch trailers, learn vocabulary, create AI-generated movie scenes with **Google Veo 3.1**, compete in weekly contests, win **USDC prizes**, and earn **NFT awards** on Base blockchain!

## Live Demo

**Try it now:** [https://cine-lingua.vercel.app](https://cine-lingua.vercel.app)

---

## What Makes CineLingua Special

| Feature | Technology | Description |
|---------|------------|-------------|
| **AI Video Generation** | Google Veo 3.1 | Create stunning 1080p cinematic scenes from text prompts |
| **Smart Vocabulary** | Google Gemini 2.5 | AI-generated vocabulary, quizzes, and tutoring |
| **Weekly Contests** | Base Blockchain | Compete for USDC prize pools with smart contracts |
| **AI Judges** | Gemini 2.5 Flash | Three AI judges score with video analysis |
| **NFT Awards** | On-chain SVG | Animated NFT trophies for all participants |
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

### 2. Create & Compete (3 Tiers Available)
1. **Take Quiz** → Unlock vocabulary "ingredients"
2. **Write Scene** → Craft a prompt using unlocked words
3. **Choose Tier** → Select Fast ($8), Standard ($20), or Premium ($20) video quality
4. **Generate Video** → Veo 3.1 creates your 1080p scene (24 seconds total)
5. **Submit** → Enter the weekly contest

### 3. Win Prizes + NFT Awards
- **AI Judging** → Three AI judges analyze your video and score (max 30 points)
- **Live Show** → Winners announced in weekly livestream
- **5 Winners**: 1st (50%) | 2nd (20%) | 3rd (10%) | 4th (10%) | 5th (10%)
- **NFT Awards** → Every participant gets an animated on-chain NFT!

---

## Contest Economics

### Entry Tiers

| Tier | Entry Fee | Veo Model | Video Output | Pool Contribution |
|------|-----------|-----------|--------------|-------------------|
| ⚡ **Fast** | $8.00 USDC | Veo 3.1 Fast | 3× 8-sec clips | $4.00 |
| 🎬 **Standard** | $20.00 USDC | Veo 3.1 Standard | 3× 8-sec clips | $10.00 |
| ✨ **Premium** | $20.00 USDC | Veo 3.1 Standard | 1× 24-sec seamless | $10.00 |

**How It Works:**
- Entry fee = Platform fee ($0.40) + Generation cost, then doubled
- Half your entry goes to the prize pool, half covers generation + platform fee
- 5 winners split 100% of the prize pool!

### Prize Distribution (5 Winners)

| Place | Share | Example ($100 pool) |
|-------|-------|---------------------|
| 🥇 **1st** | 50% | $50.00 |
| 🥈 **2nd** | 20% | $20.00 |
| 🥉 **3rd** | 10% | $10.00 |
| 🎬 **4th** | 10% | $10.00 |
| 🎬 **5th** | 10% | $10.00 |

---

## NFT Awards System

Every contest participant earns an animated NFT trophy!

| Tier | Award | Description |
|------|-------|-------------|
| 🥇 **1st Place** | Gold Trophy | Animated gold trophy with score |
| 🥈 **2nd Place** | Silver Trophy | Animated silver trophy with score |
| 🥉 **3rd Place** | Bronze Trophy | Animated bronze trophy with score |
| 🎬 **4th/5th Place** | Film Medal | Animated medal for top 5 finish |
| 🎬 **Participant** | Film Badge | Animated badge for entering |
| 👑 **Grand Champion** | Platinum Crown | Season winner special edition |

**NFT Features:**
- On-chain SVG generation (no external hosting)
- Animated film reel aesthetic with shine effects
- Film grain overlay animation
- Score display showing AI judge ratings
- Movie title and contest theme
- Video thumbnail integration

**NFT Contract:** `0x5E70D149E496eda49Ad2E65ec46d9418f44a7883` ([View on BaseScan](https://sepolia.basescan.org/address/0x5E70D149E496eda49Ad2E65ec46d9418f44a7883))

---

## AI Judges

Three AI personas powered by Gemini 2.5 Flash analyze and score each video:

| Judge | Focus | Criteria |
|-------|-------|----------|
| **Le Cinéaste** 🎬 | Visual Quality | Composition, lighting, camera work, mood |
| **Le Linguiste** 🗣️ | Language Use | Vocabulary integration, cultural authenticity |
| **Le Public** 🎭 | Entertainment | Creativity, emotional impact, memorability |

**Scoring:** Each judge scores 1-10 after analyzing your video. Maximum total: **30 points**.

**Video Analysis:** Judges can watch up to 1 hour of video (2GB max) - your 24-second scenes are perfect!

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ethers.js / viem** - Blockchain interactions

### AI & Video
- **Google Veo 3.1** - AI video generation (1080p, Fast & Standard models)
- **Google Gemini 2.5 Flash** - Vocabulary, quizzes, video judging, chat
- **Vertex AI** - Cloud AI platform
- **Web Speech API** - Text-to-speech pronunciation

### Blockchain
- **Base Sepolia** - Testnet for smart contracts
- **Solidity** - Smart contract language (OpenZeppelin)
- **USDC** - Stablecoin for payments
- **ERC-721** - NFT standard for awards
- **Hardhat** - Contract development & deployment

### Backend & Data
- **Supabase** - PostgreSQL database + Storage
- **TMDB API** - Movie metadata & posters
- **YouTube API** - Trailer embedding
- **Circle** - Wallet infrastructure

---

## Smart Contracts

### CineSceneContest.sol
Main contest contract for entries, scoring, and prize distribution.

| Function | Description |
|----------|-------------|
| `submitEntryWithTier()` | Submit contest entry with tier selection (0=Fast, 1=Standard, 2=Premium) |
| `updateVideoHash()` | Link generated video to entry |
| `submitScores()` | Admin sets AI judge scores |
| `finalizeContest()` | Calculate prizes for 5 winners with tie handling |
| `claimPrize()` | Winners claim their rewards |
| `withdrawPlatformRevenue()` | Platform withdraws accumulated revenue |

**Contract Address:** `0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa`

**View on BaseScan:** [Contract Link](https://sepolia.basescan.org/address/0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa)

### CineSceneNFT.sol
ERC-721 NFT contract for participant awards.

| Function | Description |
|----------|-------------|
| `mintAward()` | Mint single NFT to participant |
| `batchMintParticipants()` | Batch mint for all contestants |
| `tokenURI()` | Returns on-chain SVG metadata |

**Contract Address:** `0x5E70D149E496eda49Ad2E65ec46d9418f44a7883`

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
│   │   └── api/
│   │       ├── video/generate/      # Veo video generation
│   │       ├── judge/               # AI judging endpoint
│   │       ├── nft/mint/            # NFT minting API
│   │       ├── chat/                # AI tutor chatbot
│   │       └── movies/              # TMDB integration
│   ├── components/
│   │   ├── SceneCreatorModal.tsx    # Video prompt builder
│   │   ├── JudgingShowModal.tsx     # Live judging display
│   │   ├── QuizModal.tsx            # Vocabulary quizzes
│   │   └── NavBar.tsx               # Navigation
│   └── lib/
│       ├── veo.ts                   # Google Veo 3 integration
│       ├── aiJudges.ts              # AI judging system
│       ├── contract.ts              # Contest contract helpers
│       ├── nftContract.ts           # NFT contract helpers
│       ├── videoStorage.ts          # Supabase video storage
│       └── supabase.ts              # Database client
├── contracts/
│   ├── contracts/
│   │   ├── CineSceneContest.sol     # Main contest contract
│   │   └── CineSceneNFT.sol         # NFT awards contract
│   ├── scripts/
│   │   ├── deploy.js                # Contest deployment
│   │   └── deploy-nft.js            # NFT deployment
│   └── hardhat.config.js            # Hardhat configuration
└── supabase-schema.sql              # Database schema
```

---

## Environment Variables

```env
# Google Cloud / Vertex AI (Veo 3)
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

# Smart Contracts (Base Sepolia)
NEXT_PUBLIC_CONTEST_CONTRACT=0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa
NEXT_PUBLIC_NFT_CONTRACT=0x5E70D149E496eda49Ad2E65ec46d9418f44a7883
DEPLOYER_PRIVATE_KEY=0x...  # Only for deployment
BASESCAN_API_KEY=your-key   # For verification

# Revenue
REVENUE_WALLET=0x...  # Platform fee recipient
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

### Smart Contracts (Base Sepolia)

```bash
cd contracts
npm install

# Deploy Contest Contract
npx hardhat run scripts/deploy.js --network base-sepolia

# Deploy NFT Contract
npx hardhat run scripts/deploy-nft.js --network base-sepolia
```

---

## Hackathon Submission

### Google AI Hackathon 2025

**Track:** AI Agents / Creative AI

**Google Technologies Used:**
- **Veo 3.1** - AI video generation from text prompts (1080p quality, Fast & Standard models)
- **Gemini 2.5 Flash** - Vocabulary generation, quiz creation, video analysis judging, chatbot
- **Vertex AI** - Cloud AI platform for Veo deployment

**Problem Solved:**
Traditional language learning is boring. CineLingua makes it engaging by:
1. Using cinema as the learning medium
2. Letting users CREATE content, not just consume it
3. Adding competition with real monetary stakes
4. Providing AI tutoring personalized to each learner
5. Awarding collectible NFTs to commemorate achievements

**Innovation:**
- First platform to combine AI video generation with language learning
- AI judges that actually WATCH and analyze generated videos
- Gamified creation contests with blockchain-verified prizes
- On-chain animated NFT awards for all participants
- AI judges provide educational feedback, not just scores

---

## Demo Video

[Link to YouTube demo] - Coming soon

---

## Screenshots

| Learn | Contest | NFT Awards |
|-------|---------|------------|
| Browse movies & vocabulary | Create AI scenes | Earn animated trophies |

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
- **Contest Contract:** https://sepolia.basescan.org/address/0x48368BA4c399bEb9130A7B58D4A2Ce2ce280cafa
- **NFT Contract:** https://sepolia.basescan.org/address/0x5E70D149E496eda49Ad2E65ec46d9418f44a7883

---

**Made with Google AI, Base Network & Supabase**

*Learn Languages. Create Scenes. Win Prizes. Earn NFTs.*
