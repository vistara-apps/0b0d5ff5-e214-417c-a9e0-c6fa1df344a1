import { PowerUp } from './types';

export interface PowerUpDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  basePrice: number;
  duration: number;
  effect: string;
  isPremium: boolean;
}

export const POWER_UP_DEFINITIONS: Record<string, PowerUpDefinition> = {
  shield: {
    id: 'shield',
    name: 'Shield',
    description: 'Protects against one collision',
    icon: '🛡️',
    rarity: 'common',
    basePrice: 0.001,
    duration: 5000,
    effect: 'Prevents game over on collision',
    isPremium: false,
  },
  speed: {
    id: 'speed',
    name: 'Speed Boost',
    description: 'Temporarily increases movement speed',
    icon: '⚡',
    rarity: 'rare',
    basePrice: 0.002,
    duration: 3000,
    effect: '40% faster movement',
    isPremium: false,
  },
  multiplier: {
    id: 'multiplier',
    name: 'Score Multiplier',
    description: 'Doubles points from food',
    icon: '✨',
    rarity: 'epic',
    basePrice: 0.005,
    duration: 10000,
    effect: '2x score multiplier',
    isPremium: false,
  },
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    description: 'Attracts food from a distance',
    icon: '🧲',
    rarity: 'legendary',
    basePrice: 0.01,
    duration: 8000,
    effect: 'Food moves toward snake',
    isPremium: true,
  },
};

export function getPowerUpDefinition(powerUpId: string): PowerUpDefinition | undefined {
  return POWER_UP_DEFINITIONS[powerUpId];
}

export function getAvailablePowerUps(): PowerUpDefinition[] {
  return Object.values(POWER_UP_DEFINITIONS);
}

export function calculatePowerUpPrice(definition: PowerUpDefinition, quantity: number): number {
  // Simple pricing: base price with small discount for bulk
  const discount = Math.min(0.1, quantity * 0.01); // Max 10% discount
  return definition.basePrice * quantity * (1 - discount);
}

// Power-up pack definitions
export interface PowerUpPack {
  id: string;
  name: string;
  description: string;
  powerUps: Record<string, number>; // powerUpId -> quantity
  price: number;
  isPremium: boolean;
}

export const POWER_UP_PACKS: Record<string, PowerUpPack> = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Essential power-ups to get started',
    powerUps: { shield: 5, speed: 3 },
    price: 0.008,
    isPremium: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro Pack',
    description: 'Advanced power-ups for serious players',
    powerUps: { shield: 10, speed: 5, multiplier: 3 },
    price: 0.025,
    isPremium: false,
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary Pack',
    description: 'Ultimate power-up collection',
    powerUps: { shield: 15, speed: 10, multiplier: 5, magnet: 3 },
    price: 0.08,
    isPremium: true,
  },
};

export function getPowerUpPack(packId: string): PowerUpPack | undefined {
  return POWER_UP_PACKS[packId];
}

export function getAvailablePacks(): PowerUpPack[] {
  return Object.values(POWER_UP_PACKS);
}

