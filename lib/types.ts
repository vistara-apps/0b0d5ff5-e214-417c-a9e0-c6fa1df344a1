export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  food: Position;
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
  speed: number;
}

export interface User {
  walletAddress: string;
  username: string;
  level: number;
  totalScore: number;
  highScore: number;
  gamesPlayed: number;
  currentSkin: string;
  unlockedSkins: string[];
  unlockedMaps: string[];
  isPremium: boolean;
  subscriptionExpiry?: Date;
  battlePassTier: number;
  battlePassProgress: number;
  createdAt: Date;
}

export interface GameSession {
  sessionId: string;
  walletAddress: string;
  score: number;
  level: number;
  duration: number;
  mapUsed: string;
  skinUsed: string;
  powerUpsUsed: string[];
  replayData: Position[][];
  timestamp: Date;
  isPersonalBest: boolean;
}

export interface LeaderboardEntry {
  walletAddress: string;
  username: string;
  score: number;
  rank: number;
  timestamp: Date;
}

export interface Skin {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: 'level' | 'purchase' | 'battlepass';
  price?: number;
  isZenExclusive: boolean;
  color: string;
  glowColor?: string;
}

export interface PowerUp {
  type: 'shield' | 'speed' | 'multiplier' | 'magnet';
  duration: number;
  active: boolean;
}
