-- CineLingua Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jiwcudujcnnhlpjkgirt/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  words_learned INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  movies_watched INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learned words table
CREATE TABLE IF NOT EXISTS learned_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  french TEXT NOT NULL,
  english TEXT NOT NULL,
  movie_id INTEGER,
  movie_title TEXT,
  mastery INTEGER DEFAULT 10, -- 0-100 mastery level
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, french) -- Each user can only have one entry per word
);

-- Invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_learned_words_user_id ON learned_words(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee_email ON invites(invitee_email);

-- Function to increment quizzes completed
CREATE OR REPLACE FUNCTION increment_quizzes(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET quizzes_completed = quizzes_completed + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment words learned
CREATE OR REPLACE FUNCTION increment_words(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET words_learned = words_learned + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment movies watched
CREATE OR REPLACE FUNCTION increment_movies(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET movies_watched = movies_watched + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read/write for this demo
-- In production, you'd use Supabase Auth for more secure policies

-- Users: Anyone can read, anyone can insert/update their own
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own record" ON users FOR UPDATE USING (true);

-- Quiz results: Anyone can read, anyone can insert
CREATE POLICY "Quiz results are viewable by everyone" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quiz results" ON quiz_results FOR INSERT WITH CHECK (true);

-- Learned words: Anyone can read, anyone can insert/update
CREATE POLICY "Learned words are viewable by everyone" ON learned_words FOR SELECT USING (true);
CREATE POLICY "Anyone can insert learned words" ON learned_words FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update learned words" ON learned_words FOR UPDATE USING (true);

-- Invites: Anyone can read, anyone can insert/update
CREATE POLICY "Invites are viewable by everyone" ON invites FOR SELECT USING (true);
CREATE POLICY "Anyone can insert invites" ON invites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update invites" ON invites FOR UPDATE USING (true);

-- Insert some demo users for the leaderboard
INSERT INTO users (email, name, xp, level, streak, words_learned, quizzes_completed, movies_watched) VALUES
  ('marie@example.com', 'Marie Dupont', 4250, 8, 15, 342, 28, 45),
  ('pierre@example.com', 'Pierre Martin', 3890, 7, 12, 298, 24, 38),
  ('sophie@example.com', 'Sophie Laurent', 3420, 7, 8, 256, 21, 32),
  ('jean@example.com', 'Jean-Luc Bernard', 2980, 6, 22, 234, 19, 28),
  ('claire@example.com', 'Claire Moreau', 2650, 6, 5, 198, 16, 25),
  ('antoine@example.com', 'Antoine Petit', 2340, 5, 9, 167, 14, 22),
  ('emma@example.com', 'Emma Richard', 1890, 5, 3, 145, 12, 18),
  ('lucas@example.com', 'Lucas Thomas', 1560, 4, 7, 112, 10, 15),
  ('chloe@example.com', 'Chloé Robert', 1230, 4, 4, 89, 8, 12),
  ('hugo@example.com', 'Hugo Garcia', 890, 3, 2, 67, 6, 9)
ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
