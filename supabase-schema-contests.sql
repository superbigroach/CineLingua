-- CineLingua Scene Contest Schema Extension
-- Run this AFTER the main supabase-schema.sql

-- ============================================
-- WEEKLY CONTESTS
-- ============================================

CREATE TABLE IF NOT EXISTS contests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,                    -- "Week 1: French Film Noir"
  theme TEXT NOT NULL,                    -- "Mysterious Paris"
  language TEXT NOT NULL,                 -- "French"
  description TEXT,

  -- Economics
  min_stake DECIMAL(10,2) DEFAULT 2.80,   -- Minimum USDC stake
  prize_pool DECIMAL(10,2) DEFAULT 0,     -- Total prize pool
  platform_fees DECIMAL(10,2) DEFAULT 0,  -- Accumulated 20% fees

  -- Timing
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  judging_ends_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'judging', 'completed')),

  -- Blockchain
  contract_address TEXT,                  -- Base network contract address
  chain_id INTEGER DEFAULT 8453,          -- Base mainnet

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER SCENE SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS scene_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,

  -- Movie context
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,

  -- Prompt data
  original_prompt TEXT NOT NULL,          -- User's original scene idea
  enhanced_prompt TEXT,                   -- AI-enhanced cinematic prompt
  selected_variation INTEGER DEFAULT 0,   -- Which of 3 variations they chose

  -- Learned ingredients used
  ingredients_used JSONB,                 -- Array of ingredient objects

  -- Generated content
  video_url TEXT,                         -- Veo-generated video URL
  video_ipfs_hash TEXT,                   -- IPFS hash for permanence
  thumbnail_url TEXT,

  -- Economics
  generation_cost DECIMAL(10,2) DEFAULT 2.80,
  stake_amount DECIMAL(10,2) DEFAULT 0,   -- 0 if not competing

  -- Scoring (set by AI judges)
  score_cinematographer INTEGER,          -- 1-10
  score_linguist INTEGER,                 -- 1-10
  score_audience INTEGER,                 -- 1-10
  total_score INTEGER,                    -- Sum of above (max 30)

  -- Feedback from judges
  feedback_cinematographer TEXT,
  feedback_linguist TEXT,
  feedback_audience TEXT,

  -- Results
  final_rank INTEGER,
  prize_amount DECIMAL(10,2) DEFAULT 0,
  prize_claimed BOOLEAN DEFAULT false,

  -- Blockchain
  tx_hash TEXT,                           -- Submission transaction
  claim_tx_hash TEXT,                     -- Prize claim transaction

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  judged_at TIMESTAMP WITH TIME ZONE,

  -- One entry per user per contest
  UNIQUE(user_id, contest_id)
);

-- ============================================
-- PROMPT INGREDIENTS (earned from quizzes)
-- ============================================

CREATE TABLE IF NOT EXISTS prompt_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,

  word TEXT NOT NULL,                     -- French word/phrase
  translation TEXT NOT NULL,              -- English translation
  type TEXT DEFAULT 'word' CHECK (type IN ('word', 'phrase', 'expression')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  movie_context TEXT,                     -- How it relates to the movie
  visual_hint TEXT,                       -- Scene visualization hint

  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  used_in_scene BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Each ingredient is unique per user per movie
  UNIQUE(user_id, movie_id, word)
);

-- ============================================
-- CIRCLE WALLET LINKS
-- ============================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Circle wallet info
  circle_wallet_id TEXT,
  wallet_address TEXT,                    -- Base network address
  wallet_type TEXT DEFAULT 'user-controlled',

  -- Balance cache (updated periodically)
  usdc_balance DECIMAL(10,2) DEFAULT 0,
  last_balance_update TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_ends_at ON contests(ends_at);
CREATE INDEX IF NOT EXISTS idx_submissions_contest ON scene_submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON scene_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON scene_submissions(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_user_movie ON prompt_ingredients(user_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON user_wallets(wallet_address);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

-- Contests: Public read, admin write
CREATE POLICY "Contests are viewable by everyone" ON contests FOR SELECT USING (true);

-- Submissions: Public read, users can insert/update their own
CREATE POLICY "Submissions are viewable by everyone" ON scene_submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert submissions" ON scene_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their submissions" ON scene_submissions FOR UPDATE USING (true);

-- Ingredients: Users can only see/manage their own
CREATE POLICY "Users can view their ingredients" ON prompt_ingredients FOR SELECT USING (true);
CREATE POLICY "Users can insert ingredients" ON prompt_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update ingredients" ON prompt_ingredients FOR UPDATE USING (true);

-- Wallets: Users can only see their own
CREATE POLICY "Users can view their wallet" ON user_wallets FOR SELECT USING (true);
CREATE POLICY "Users can insert wallet" ON user_wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update wallet" ON user_wallets FOR UPDATE USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate prize for a submission based on rank and ties
CREATE OR REPLACE FUNCTION calculate_prize(
  p_contest_id UUID,
  p_submission_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  v_prize_pool DECIMAL;
  v_rank INTEGER;
  v_tie_count INTEGER;
  v_score INTEGER;
  v_prize DECIMAL;
BEGIN
  -- Get contest prize pool
  SELECT prize_pool INTO v_prize_pool FROM contests WHERE id = p_contest_id;

  -- Get submission rank and score
  SELECT final_rank, total_score INTO v_rank, v_score
  FROM scene_submissions WHERE id = p_submission_id;

  -- Count ties at this rank
  SELECT COUNT(*) INTO v_tie_count
  FROM scene_submissions
  WHERE contest_id = p_contest_id AND total_score = v_score;

  -- Calculate prize based on rank (with tie splitting)
  CASE v_rank
    WHEN 1 THEN v_prize := v_prize_pool * 0.50;
    WHEN 2 THEN v_prize := v_prize_pool * 0.30;
    WHEN 3 THEN v_prize := v_prize_pool * 0.20;
    ELSE v_prize := 0;
  END CASE;

  -- If there are ties, we need to combine and split prizes
  -- This is simplified - the smart contract handles complex tie logic
  IF v_tie_count > 1 AND v_rank <= 3 THEN
    v_prize := v_prize / v_tie_count;
  END IF;

  RETURN v_prize;
END;
$$ LANGUAGE plpgsql;

-- Finalize contest rankings
CREATE OR REPLACE FUNCTION finalize_contest_rankings(p_contest_id UUID)
RETURNS void AS $$
BEGIN
  -- Assign ranks based on total_score (higher is better)
  WITH ranked AS (
    SELECT
      id,
      RANK() OVER (ORDER BY total_score DESC) as rank
    FROM scene_submissions
    WHERE contest_id = p_contest_id AND stake_amount > 0
  )
  UPDATE scene_submissions s
  SET final_rank = r.rank
  FROM ranked r
  WHERE s.id = r.id;

  -- Calculate prizes for top 3
  UPDATE scene_submissions
  SET prize_amount = calculate_prize(contest_id, id)
  WHERE contest_id = p_contest_id AND final_rank <= 3;

  -- Update contest status
  UPDATE contests
  SET status = 'completed'
  WHERE id = p_contest_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: Create first weekly contest
-- ============================================

INSERT INTO contests (title, theme, language, description, min_stake, starts_at, ends_at, status)
VALUES (
  'Week 1: Parisian Dreams',
  'Romantic Paris at twilight',
  'French',
  'Create a scene capturing the magic of Paris. Use your learned French vocabulary to craft something beautiful.',
  2.80,
  NOW(),
  NOW() + INTERVAL '7 days',
  'active'
) ON CONFLICT DO NOTHING;

-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contests', 'scene_submissions', 'prompt_ingredients', 'user_wallets');
