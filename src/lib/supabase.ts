import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client for build time when env vars aren't available
// This prevents the build from failing during static generation
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build that won't actually be used
    console.warn('Supabase environment variables not configured - using mock client');
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

// Types for our database
export interface DbUser {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  last_active: string;
  words_learned: number;
  quizzes_completed: number;
  movies_watched: number;
  created_at: string;
}

export interface DbQuizResult {
  id: string;
  user_id: string;
  movie_id: number;
  movie_title: string;
  correct: number;
  total: number;
  xp_earned: number;
  created_at: string;
}

export interface DbLearnedWord {
  id: string;
  user_id: string;
  french: string;
  english: string;
  movie_id?: number;
  movie_title?: string;
  mastery: number; // 0-100
  created_at: string;
}

export interface DbInvite {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

// Database helper functions
export const dbHelpers = {
  // User functions
  async getUser(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  },

  async createUser(email: string, name: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        xp: 0,
        level: 1,
        streak: 0,
        last_active: new Date().toISOString(),
        words_learned: 0,
        quizzes_completed: 0,
        movies_watched: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  async updateUser(userId: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  },

  async addXp(userId: string, amount: number): Promise<DbUser | null> {
    // First get current user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const newXp = user.xp + amount;
    const newLevel = calculateLevel(newXp);

    const { data, error } = await supabase
      .from('users')
      .update({
        xp: newXp,
        level: newLevel,
        last_active: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) return null;
    return data;
  },

  // Quiz functions
  async recordQuizResult(
    userId: string,
    movieId: number,
    movieTitle: string,
    correct: number,
    total: number,
    xpEarned: number
  ): Promise<DbQuizResult | null> {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        movie_id: movieId,
        movie_title: movieTitle,
        correct,
        total,
        xp_earned: xpEarned,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording quiz:', error);
      return null;
    }

    // Also update user stats
    await supabase.rpc('increment_quizzes', { user_id: userId });

    return data;
  },

  async getUserQuizResults(userId: string): Promise<DbQuizResult[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Leaderboard functions
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time',
    limit: number = 20
  ): Promise<DbUser[]> {
    let query = supabase
      .from('users')
      .select('*')
      .order('xp', { ascending: false })
      .limit(limit);

    // For time-based leaderboards, filter by last_active
    if (period !== 'all-time') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      query = query.gte('last_active', startDate!.toISOString());
    }

    const { data, error } = await query;

    if (error) return [];
    return data || [];
  },

  // Learned words functions
  async addLearnedWord(
    userId: string,
    french: string,
    english: string,
    movieId?: number,
    movieTitle?: string
  ): Promise<DbLearnedWord | null> {
    // Check if word already exists for this user
    const { data: existing } = await supabase
      .from('learned_words')
      .select('id')
      .eq('user_id', userId)
      .eq('french', french)
      .single();

    if (existing) {
      // Update mastery instead
      const { data } = await supabase
        .from('learned_words')
        .update({ mastery: supabase.rpc('increment_mastery') })
        .eq('id', existing.id)
        .select()
        .single();
      return data;
    }

    const { data, error } = await supabase
      .from('learned_words')
      .insert({
        user_id: userId,
        french,
        english,
        movie_id: movieId,
        movie_title: movieTitle,
        mastery: 10,
      })
      .select()
      .single();

    if (error) return null;

    // Update user's word count
    await supabase.rpc('increment_words', { user_id: userId });

    return data;
  },

  async getUserWords(userId: string): Promise<DbLearnedWord[]> {
    const { data, error } = await supabase
      .from('learned_words')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // Invite functions
  async sendInvite(inviterId: string, inviteeEmail: string): Promise<DbInvite | null> {
    const { data, error } = await supabase
      .from('invites')
      .insert({
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return null;
    return data;
  },

  async checkInvite(email: string): Promise<DbInvite | null> {
    const { data } = await supabase
      .from('invites')
      .select('*')
      .eq('invitee_email', email)
      .eq('status', 'pending')
      .single();

    return data;
  },

  async acceptInvite(inviteId: string, inviterId: string): Promise<boolean> {
    // Update invite status
    await supabase
      .from('invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    // Award XP to inviter
    await dbHelpers.addXp(inviterId, 100);

    return true;
  },
};

// Helper function to calculate level from XP
function calculateLevel(xp: number): number {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) return i + 1;
  }
  return 1;
}

// Level titles
export const LEVEL_TITLES = [
  'Débutant',
  'Novice',
  'Apprenti',
  'Intermédiaire',
  'Avancé',
  'Expert',
  'Maître',
  'Grand Maître',
  'Virtuose',
  'Francophile'
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}
