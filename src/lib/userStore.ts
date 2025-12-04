// User Store - LocalStorage based (upgrade to Supabase for production)
// Manages users, XP, streaks, leaderboards, and friend invites

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  wordsLearned: string[];
  moviesWatched: string[];
  quizzesTaken: number;
  quizzesCorrect: number;
  createdAt: string;
  friends: string[]; // user IDs
  pendingInvites: string[]; // emails
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
  { level: 2, xpRequired: 100, title: 'Apprenti' },
  { level: 3, xpRequired: 300, title: 'Étudiant' },
  { level: 4, xpRequired: 600, title: 'Intermédiaire' },
  { level: 5, xpRequired: 1000, title: 'Avancé' },
  { level: 6, xpRequired: 1500, title: 'Expert' },
  { level: 7, xpRequired: 2500, title: 'Maître' },
  { level: 8, xpRequired: 4000, title: 'Virtuose' },
  { level: 9, xpRequired: 6000, title: 'Polyglotte' },
  { level: 10, xpRequired: 10000, title: 'Francophile' },
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

// Storage keys
const USERS_KEY = 'cinelingua_users';
const CURRENT_USER_KEY = 'cinelingua_current_user';
const DEMO_LEADERBOARD_KEY = 'cinelingua_demo_leaderboard';

// Initialize demo leaderboard with fake users
function initDemoLeaderboard(): LeaderboardEntry[] {
  const demoUsers: LeaderboardEntry[] = [
    { id: 'demo1', name: 'Marie Claire', avatar: generateAvatar('Marie'), xp: 4520, level: 8, streak: 45 },
    { id: 'demo2', name: 'Jean-Pierre', avatar: generateAvatar('Jean'), xp: 3200, level: 7, streak: 30 },
    { id: 'demo3', name: 'Sophie Martin', avatar: generateAvatar('Sophie'), xp: 2800, level: 6, streak: 22 },
    { id: 'demo4', name: 'Lucas Dubois', avatar: generateAvatar('Lucas'), xp: 2100, level: 5, streak: 18 },
    { id: 'demo5', name: 'Emma Bernard', avatar: generateAvatar('Emma'), xp: 1650, level: 5, streak: 14 },
    { id: 'demo6', name: 'Hugo Petit', avatar: generateAvatar('Hugo'), xp: 1200, level: 4, streak: 10 },
    { id: 'demo7', name: 'Léa Moreau', avatar: generateAvatar('Léa'), xp: 850, level: 3, streak: 7 },
    { id: 'demo8', name: 'Thomas Garcia', avatar: generateAvatar('Thomas'), xp: 500, level: 2, streak: 5 },
  ];

  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_LEADERBOARD_KEY, JSON.stringify(demoUsers));
  }
  return demoUsers;
}

// Get all users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save users
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

// Create or login user
export function loginUser(email: string, name: string): User {
  const users = getUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Create new user
    user = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      name,
      avatar: generateAvatar(name),
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      wordsLearned: [],
      moviesWatched: [],
      quizzesTaken: 0,
      quizzesCorrect: 0,
      createdAt: new Date().toISOString(),
      friends: [],
      pendingInvites: [],
    };
    users.push(user);
    saveUsers(users);
  }

  // Set current user
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  }

  // Check/update streak
  updateStreak(user.id);

  return user;
}

// Logout user
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Update streak
function updateStreak(userId: string): void {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (user.lastActiveDate === today) {
    // Already active today
    return;
  } else if (user.lastActiveDate === yesterday) {
    // Continue streak
    user.streak += 1;
    user.xp += XP_REWARDS.DAILY_STREAK;
    user.level = getLevelFromXP(user.xp).level;
  } else {
    // Streak broken
    user.streak = 1;
  }

  user.lastActiveDate = today;
  saveUsers(users);
}

// Add XP to user
export function addXP(userId: string, amount: number, reason: string): { newXP: number; leveledUp: boolean; newLevel?: number } {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { newXP: 0, leveledUp: false };

  const oldLevel = user.level;
  user.xp += amount;
  const levelInfo = getLevelFromXP(user.xp);
  user.level = levelInfo.level;

  saveUsers(users);

  return {
    newXP: user.xp,
    leveledUp: levelInfo.level > oldLevel,
    newLevel: levelInfo.level > oldLevel ? levelInfo.level : undefined,
  };
}

// Record movie watched
export function recordMovieWatched(userId: string, movieId: string): void {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  if (!user.moviesWatched.includes(movieId)) {
    user.moviesWatched.push(movieId);
    addXP(userId, XP_REWARDS.WATCH_TRAILER, 'Watched trailer');
  }

  saveUsers(users);
}

// Record word learned
export function recordWordLearned(userId: string, word: string): void {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  if (!user.wordsLearned.includes(word.toLowerCase())) {
    user.wordsLearned.push(word.toLowerCase());
    addXP(userId, XP_REWARDS.LEARN_WORD, 'Learned word');
  }

  saveUsers(users);
}

// Record quiz result
export function recordQuizResult(userId: string, correct: number, total: number): { xpEarned: number; perfect: boolean } {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { xpEarned: 0, perfect: false };

  user.quizzesTaken += 1;
  user.quizzesCorrect += correct;

  const perfect = correct === total;
  const xpEarned = perfect ? XP_REWARDS.QUIZ_PERFECT : XP_REWARDS.COMPLETE_QUIZ;
  addXP(userId, xpEarned, perfect ? 'Perfect quiz!' : 'Quiz completed');

  saveUsers(users);

  return { xpEarned, perfect };
}

// Send friend invite
export function sendFriendInvite(userId: string, friendEmail: string): boolean {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  if (!user.pendingInvites.includes(friendEmail.toLowerCase())) {
    user.pendingInvites.push(friendEmail.toLowerCase());
    addXP(userId, XP_REWARDS.INVITE_FRIEND, 'Invited friend');
    saveUsers(users);
  }

  return true;
}

// Get leaderboard
export function getLeaderboard(period: 'all' | 'monthly' | 'weekly' | 'daily' = 'all'): LeaderboardEntry[] {
  // Get demo leaderboard
  let demoUsers: LeaderboardEntry[] = [];
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(DEMO_LEADERBOARD_KEY);
    demoUsers = stored ? JSON.parse(stored) : initDemoLeaderboard();
  }

  // Get real users
  const users = getUsers();
  const realUserEntries: LeaderboardEntry[] = users.map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
  }));

  // Combine and sort
  const combined = [...demoUsers, ...realUserEntries];

  // For demo purposes, adjust XP based on period
  // In real app, you'd track daily/weekly/monthly XP separately
  const multiplier = period === 'daily' ? 0.05 : period === 'weekly' ? 0.2 : period === 'monthly' ? 0.5 : 1;

  return combined
    .map(u => ({ ...u, xp: Math.floor(u.xp * multiplier) }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20);
}
