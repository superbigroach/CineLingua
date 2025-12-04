// User Store - Supabase + LocalStorage hybrid
// Uses Supabase for cloud storage, falls back to localStorage

import { supabase, dbHelpers, getLevelTitle, DbUser } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  wordsLearned: number;
  moviesWatched: number;
  quizzesTaken: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
}

// XP rewards
export const XP_REWARDS = {
  WATCH_TRAILER: 10,
  COMPLETE_QUIZ: 25,
  QUIZ_PERFECT: 50,
  LEARN_WORD: 5,
  DAILY_STREAK: 15,
  INVITE_FRIEND: 100,
  FRIEND_JOINED: 200,
};

// Level thresholds
export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Débutant' },
  { level: 2, xpRequired: 100, title: 'Novice' },
  { level: 3, xpRequired: 300, title: 'Apprenti' },
  { level: 4, xpRequired: 600, title: 'Intermédiaire' },
  { level: 5, xpRequired: 1000, title: 'Avancé' },
  { level: 6, xpRequired: 1500, title: 'Expert' },
  { level: 7, xpRequired: 2100, title: 'Maître' },
  { level: 8, xpRequired: 2800, title: 'Grand Maître' },
  { level: 9, xpRequired: 3600, title: 'Virtuose' },
  { level: 10, xpRequired: 5000, title: 'Francophile' },
];

// Generate avatar from name
export function generateAvatar(name: string): string {
  const colors = ['F87171', 'FB923C', 'FBBF24', '34D399', '22D3EE', '818CF8', 'F472B6'];
  const color = colors[name.length % colors.length];
  const initial = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=fff&bold=true`;
}

// Get level info from XP
export function getLevelFromXP(xp: number): { level: number; title: string; progress: number; nextLevelXP: number } {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const progress = nextLevel.level === currentLevel.level
    ? 100
    : ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress: Math.min(progress, 100),
    nextLevelXP: nextLevel.xpRequired,
  };
}

// Storage keys for local cache
const CURRENT_USER_KEY = 'cinelingua_current_user';
const USER_CACHE_KEY = 'cinelingua_user_cache';

// Convert DB user to app user
function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatar: generateAvatar(dbUser.name),
    xp: dbUser.xp,
    level: dbUser.level,
    streak: dbUser.streak,
    lastActiveDate: dbUser.last_active,
    wordsLearned: dbUser.words_learned,
    moviesWatched: dbUser.movies_watched,
    quizzesTaken: dbUser.quizzes_completed,
    createdAt: dbUser.created_at,
  };
}

// Cache user locally
function cacheUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  }
}

// Get cached user
function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(USER_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

// Get current user (from cache first, then Supabase)
export function getCurrentUser(): User | null {
  return getCachedUser();
}

// Get current user async (refreshes from Supabase)
export async function getCurrentUserAsync(): Promise<User | null> {
  const cached = getCachedUser();
  if (!cached) return null;

  try {
    const dbUser = await dbHelpers.getUser(cached.email);
    if (dbUser) {
      const user = dbUserToUser(dbUser);
      cacheUser(user);
      return user;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  return cached;
}

// Create or login user
export async function loginUser(email: string, name: string): Promise<User> {
  try {
    // Try to get existing user from Supabase
    let dbUser = await dbHelpers.getUser(email);

    if (!dbUser) {
      // Create new user in Supabase
      dbUser = await dbHelpers.createUser(email, name);

      // Check if they were invited
      const invite = await dbHelpers.checkInvite(email);
      if (invite) {
        await dbHelpers.acceptInvite(invite.id, invite.inviter_id);
      }
    }

    if (dbUser) {
      // Update last active
      await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', dbUser.id);

      const user = dbUserToUser(dbUser);
      cacheUser(user);
      return user;
    }
  } catch (error) {
    console.error('Supabase login error:', error);
  }

  // Fallback to local-only user
  const localUser: User = {
    id: `local_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    avatar: generateAvatar(name),
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: new Date().toISOString(),
    wordsLearned: 0,
    moviesWatched: 0,
    quizzesTaken: 0,
    createdAt: new Date().toISOString(),
  };
  cacheUser(localUser);
  return localUser;
}

// Sync login (returns cached or creates new)
export function loginUserSync(email: string, name: string): User {
  // Start async login in background
  loginUser(email, name);

  // Return local user immediately
  const localUser: User = {
    id: `local_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    avatar: generateAvatar(name),
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: new Date().toISOString(),
    wordsLearned: 0,
    moviesWatched: 0,
    quizzesTaken: 0,
    createdAt: new Date().toISOString(),
  };
  cacheUser(localUser);
  return localUser;
}

// Logout user
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
  }
}

// Add XP to user
export async function addXP(userId: string, amount: number, reason: string): Promise<{ newXP: number; leveledUp: boolean; newLevel?: number }> {
  const cached = getCachedUser();
  if (!cached || cached.id !== userId) return { newXP: 0, leveledUp: false };

  const oldLevel = cached.level;
  cached.xp += amount;
  const levelInfo = getLevelFromXP(cached.xp);
  cached.level = levelInfo.level;
  cacheUser(cached);

  // Update in Supabase (non-blocking)
  if (!userId.startsWith('local_')) {
    dbHelpers.addXp(userId, amount).catch(console.error);
  }

  return {
    newXP: cached.xp,
    leveledUp: levelInfo.level > oldLevel,
    newLevel: levelInfo.level > oldLevel ? levelInfo.level : undefined,
  };
}

// Record movie watched
export async function recordMovieWatched(userId: string, movieId: string): Promise<void> {
  const cached = getCachedUser();
  if (!cached || cached.id !== userId) return;

  cached.moviesWatched += 1;
  await addXP(userId, XP_REWARDS.WATCH_TRAILER, 'Watched trailer');
  cacheUser(cached);

  // Update in Supabase
  if (!userId.startsWith('local_')) {
    supabase.rpc('increment_movies', { user_id: userId }).catch(console.error);
  }
}

// Record word learned
export async function recordWordLearned(
  userId: string,
  french: string,
  english: string,
  movieId?: number,
  movieTitle?: string
): Promise<void> {
  const cached = getCachedUser();
  if (!cached || cached.id !== userId) return;

  cached.wordsLearned += 1;
  await addXP(userId, XP_REWARDS.LEARN_WORD, 'Learned word');
  cacheUser(cached);

  // Save to Supabase
  if (!userId.startsWith('local_')) {
    dbHelpers.addLearnedWord(userId, french, english, movieId, movieTitle).catch(console.error);
  }
}

// Record quiz result
export async function recordQuizResult(
  userId: string,
  correct: number,
  total: number,
  movieId?: number,
  movieTitle?: string
): Promise<{ xpEarned: number; perfect: boolean }> {
  const cached = getCachedUser();
  if (!cached || cached.id !== userId) return { xpEarned: 0, perfect: false };

  cached.quizzesTaken += 1;
  const perfect = correct === total;
  const xpEarned = perfect ? XP_REWARDS.QUIZ_PERFECT : XP_REWARDS.COMPLETE_QUIZ;
  await addXP(userId, xpEarned, perfect ? 'Perfect quiz!' : 'Quiz completed');
  cacheUser(cached);

  // Save to Supabase
  if (!userId.startsWith('local_') && movieId && movieTitle) {
    dbHelpers.recordQuizResult(userId, movieId, movieTitle, correct, total, xpEarned).catch(console.error);
  }

  return { xpEarned, perfect };
}

// Send friend invite
export async function sendFriendInvite(userId: string, friendEmail: string): Promise<boolean> {
  await addXP(userId, XP_REWARDS.INVITE_FRIEND, 'Invited friend');

  // Save to Supabase
  if (!userId.startsWith('local_')) {
    await dbHelpers.sendInvite(userId, friendEmail);
  }

  return true;
}

// Get leaderboard from Supabase
export async function getLeaderboard(period: 'all' | 'monthly' | 'weekly' | 'daily' = 'all'): Promise<LeaderboardEntry[]> {
  try {
    const periodMap = {
      all: 'all-time' as const,
      monthly: 'monthly' as const,
      weekly: 'weekly' as const,
      daily: 'daily' as const,
    };

    const dbUsers = await dbHelpers.getLeaderboard(periodMap[period], 20);

    return dbUsers.map(u => ({
      id: u.id,
      name: u.name,
      avatar: generateAvatar(u.name),
      xp: u.xp,
      level: u.level,
      streak: u.streak,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    // Return demo data on error
    return getDemoLeaderboard(period);
  }
}

// Fallback demo leaderboard
function getDemoLeaderboard(period: string): LeaderboardEntry[] {
  const demoUsers: LeaderboardEntry[] = [
    { id: 'demo1', name: 'Marie Dupont', avatar: generateAvatar('Marie'), xp: 4250, level: 8, streak: 15 },
    { id: 'demo2', name: 'Pierre Martin', avatar: generateAvatar('Pierre'), xp: 3890, level: 7, streak: 12 },
    { id: 'demo3', name: 'Sophie Laurent', avatar: generateAvatar('Sophie'), xp: 3420, level: 7, streak: 8 },
    { id: 'demo4', name: 'Jean-Luc Bernard', avatar: generateAvatar('Jean'), xp: 2980, level: 6, streak: 22 },
    { id: 'demo5', name: 'Claire Moreau', avatar: generateAvatar('Claire'), xp: 2650, level: 6, streak: 5 },
    { id: 'demo6', name: 'Antoine Petit', avatar: generateAvatar('Antoine'), xp: 2340, level: 5, streak: 9 },
    { id: 'demo7', name: 'Emma Richard', avatar: generateAvatar('Emma'), xp: 1890, level: 5, streak: 3 },
    { id: 'demo8', name: 'Lucas Thomas', avatar: generateAvatar('Lucas'), xp: 1560, level: 4, streak: 7 },
  ];

  const multiplier = period === 'daily' ? 0.05 : period === 'weekly' ? 0.2 : period === 'monthly' ? 0.5 : 1;
  return demoUsers.map(u => ({ ...u, xp: Math.floor(u.xp * multiplier) }));
}

// Get user's quiz history
export async function getUserQuizHistory(userId: string) {
  if (userId.startsWith('local_')) return [];
  return await dbHelpers.getUserQuizResults(userId);
}

// Get user's learned words
export async function getUserWords(userId: string) {
  if (userId.startsWith('local_')) return [];
  return await dbHelpers.getUserWords(userId);
}
