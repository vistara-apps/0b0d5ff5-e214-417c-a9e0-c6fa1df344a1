import { Redis } from '@upstash/redis';
import { User, GameSession, LeaderboardEntry, Skin, Map, BattlePass, PowerUpInventory } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// User operations
export async function getUser(walletAddress: string): Promise<User | null> {
  const userData = await redis.get(`user:${walletAddress}`);
  if (!userData) return null;

  return JSON.parse(userData as string);
}

export async function createUser(walletAddress: string, username?: string): Promise<User> {
  const user: User = {
    walletAddress,
    username: username || `Player${walletAddress.slice(-4)}`,
    level: 1,
    totalScore: 0,
    highScore: 0,
    gamesPlayed: 0,
    currentSkin: 'classic',
    unlockedSkins: ['classic'],
    unlockedMaps: ['classic'],
    isPremium: false,
    battlePassTier: 0,
    battlePassProgress: 0,
    createdAt: new Date(),
  };

  await redis.set(`user:${walletAddress}`, JSON.stringify(user));
  return user;
}

export async function updateUser(walletAddress: string, updates: Partial<User>): Promise<User | null> {
  const user = await getUser(walletAddress);
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  await redis.set(`user:${walletAddress}`, JSON.stringify(updatedUser));
  return updatedUser;
}

// Game session operations
export async function saveGameSession(session: GameSession): Promise<void> {
  const sessionKey = `session:${session.sessionId}`;
  await redis.set(sessionKey, JSON.stringify(session));

  // Add to user's sessions list
  await redis.lpush(`user_sessions:${session.walletAddress}`, sessionKey);

  // Keep only last 50 sessions per user
  await redis.ltrim(`user_sessions:${session.walletAddress}`, 0, 49);

  // Update leaderboard if it's a high score
  await updateLeaderboard(session);
}

export async function getUserSessions(walletAddress: string, limit = 10): Promise<GameSession[]> {
  const sessionKeys = await redis.lrange(`user_sessions:${walletAddress}`, 0, limit - 1);
  const sessions: GameSession[] = [];

  for (const key of sessionKeys) {
    const sessionData = await redis.get(key);
    if (sessionData) {
      sessions.push(JSON.parse(sessionData as string));
    }
  }

  return sessions;
}

// Leaderboard operations
export async function getLeaderboard(type: 'daily' | 'weekly' | 'allTime' = 'daily', limit = 50): Promise<LeaderboardEntry[]> {
  const key = `leaderboard:${type}`;
  const entries = await redis.zrevrange(key, 0, limit - 1, { withScores: true });

  const leaderboard: LeaderboardEntry[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    const walletAddress = entries[i] as string;
    const score = parseInt(entries[i + 1] as string);

    const user = await getUser(walletAddress);
    if (user) {
      leaderboard.push({
        walletAddress,
        username: user.username,
        score,
        rank: Math.floor(i / 2) + 1,
        timestamp: new Date(),
      });
    }
  }

  return leaderboard;
}

async function updateLeaderboard(session: GameSession): Promise<void> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];

  // Update daily leaderboard
  await redis.zadd(`leaderboard:daily`, { score: session.score, member: session.walletAddress });

  // Update weekly leaderboard
  await redis.zadd(`leaderboard:weekly`, { score: session.score, member: session.walletAddress });

  // Update all-time leaderboard
  await redis.zadd(`leaderboard:allTime`, { score: session.score, member: session.walletAddress });

  // Clean up old daily entries (keep only current day)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await redis.del(`leaderboard:daily:${yesterday}`);

  // Clean up old weekly entries (keep only current week)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await redis.del(`leaderboard:weekly:${lastWeek}`);
}

// Skin operations
export async function getAllSkins(): Promise<Skin[]> {
  const skins: Skin[] = [
    { id: 'classic', name: 'Classic', rarity: 'common', unlockCondition: 'level', price: 0, isZenExclusive: false },
    { id: 'cyber', name: 'Cyberpunk', rarity: 'rare', unlockCondition: 'level', price: 0.001, isZenExclusive: false },
    { id: 'ocean', name: 'Ocean', rarity: 'rare', unlockCondition: 'level', price: 0.001, isZenExclusive: false },
    { id: 'fire', name: 'Fire', rarity: 'epic', unlockCondition: 'purchase', price: 0.005, isZenExclusive: false },
    { id: 'gold', name: 'Golden', rarity: 'legendary', unlockCondition: 'battlepass', price: 0.01, isZenExclusive: false },
    { id: 'zen', name: 'Zen Flow', rarity: 'legendary', unlockCondition: 'purchase', price: 0.01, isZenExclusive: true },
  ];

  return skins;
}

// Map operations
export async function getAllMaps(): Promise<Map[]> {
  const maps: Map[] = [
    {
      id: 'classic',
      name: 'Classic Arena',
      difficulty: 1,
      obstacles: [],
      unlockLevel: 1,
      thumbnailUrl: '/maps/classic.png'
    },
    {
      id: 'cyber',
      name: 'Cyber Maze',
      difficulty: 2,
      obstacles: [
        { type: 'wall', coordinates: [[5, 5], [5, 6], [5, 7], [5, 8], [5, 9]] },
        { type: 'wall', coordinates: [[15, 5], [15, 6], [15, 7], [15, 8], [15, 9]] },
      ],
      unlockLevel: 3,
      thumbnailUrl: '/maps/cyber.png'
    },
    {
      id: 'ocean',
      name: 'Ocean Depths',
      difficulty: 3,
      obstacles: [
        { type: 'wall', coordinates: [[8, 8], [9, 8], [10, 8], [11, 8], [12, 8]] },
        { type: 'wall', coordinates: [[8, 12], [9, 12], [10, 12], [11, 12], [12, 12]] },
      ],
      unlockLevel: 5,
      thumbnailUrl: '/maps/ocean.png'
    },
  ];

  return maps;
}

// Battle Pass operations
export async function getCurrentBattlePass(): Promise<BattlePass> {
  const battlePass: BattlePass = {
    seasonId: 'cyber_season_2024',
    name: 'Cyber Season 2024',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    freeTierRewards: [
      { tier: 5, reward: 'cyber_skin', type: 'skin' },
      { tier: 15, reward: 'speed_boost_pack', type: 'powerup' },
      { tier: 25, reward: 'ocean_map', type: 'map' },
    ],
    premiumTierRewards: [
      { tier: 3, reward: 'gold_skin', type: 'skin' },
      { tier: 10, reward: 'shield_pack', type: 'powerup' },
      { tier: 20, reward: 'fire_skin', type: 'skin' },
      { tier: 30, reward: 'season_nft', type: 'nft' },
    ],
    challenges: [
      { objective: 'Score 500+ points', points: 10, tier: 1 },
      { objective: 'Complete 5 games', points: 15, tier: 2 },
      { objective: 'Reach level 5', points: 20, tier: 3 },
    ],
  };

  return battlePass;
}

// Power-up inventory operations
export async function getUserPowerUps(walletAddress: string): Promise<PowerUpInventory[]> {
  const powerUps: PowerUpInventory[] = [
    { walletAddress, powerUpType: 'shield', quantity: 3 },
    { walletAddress, powerUpType: 'speed', quantity: 2 },
    { walletAddress, powerUpType: 'multiplier', quantity: 1 },
    { walletAddress, powerUpType: 'magnet', quantity: 0 },
  ];

  return powerUps;
}

export async function updatePowerUpQuantity(walletAddress: string, powerUpType: string, quantity: number): Promise<void> {
  const key = `powerups:${walletAddress}:${powerUpType}`;
  await redis.set(key, quantity.toString());
}

// Utility functions
export async function getUserStats(walletAddress: string) {
  const user = await getUser(walletAddress);
  if (!user) return null;

  const sessions = await getUserSessions(walletAddress, 100);
  const totalGames = sessions.length;
  const averageScore = totalGames > 0 ? sessions.reduce((sum, s) => sum + s.score, 0) / totalGames : 0;

  return {
    user,
    stats: {
      totalGames,
      averageScore: Math.round(averageScore),
      bestStreak: 0, // TODO: implement streak tracking
      favoriteSkin: user.currentSkin,
    },
  };
}

