import { Position, GameState, PowerUp, Map as GameMap } from './types';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 10;

// Power-up definitions
export const POWER_UPS = {
  shield: { name: 'Shield', duration: 5000, color: '#00ff41' },
  speed: { name: 'Speed Boost', duration: 3000, color: '#ff4500' },
  multiplier: { name: 'Score Multiplier', duration: 10000, color: '#ffd700' },
  magnet: { name: 'Magnet', duration: 8000, color: '#00d4ff' },
} as const;

export function createInitialGameState(): GameState {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  
  return {
    snake: [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ],
    direction: 'RIGHT',
    food: generateFood([{ x: centerX, y: centerY }]),
    score: 0,
    level: 1,
    isGameOver: false,
    isPaused: false,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[], currentMap?: GameMap): Position {
  let food: Position;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (
    attempts < maxAttempts && (
      snake.some(segment => segment.x === food.x && segment.y === food.y) ||
      currentMap?.obstacles?.some(obstacle =>
        obstacle.coordinates.some(coord => coord[0] === food.x && coord[1] === food.y)
      )
    )
  );

  return food;
}

// Power-up management
export function activatePowerUp(state: GameState, powerUpType: keyof typeof POWER_UPS): GameState {
  const powerUp = POWER_UPS[powerUpType];
  const newPowerUp: PowerUp = {
    type: powerUpType,
    duration: powerUp.duration,
    active: true,
  };

  const existingIndex = state.activePowerUps?.findIndex(p => p.type === powerUpType) ?? -1;

  if (existingIndex >= 0) {
    // Extend duration of existing power-up
    const updatedPowerUps = [...(state.activePowerUps || [])];
    updatedPowerUps[existingIndex] = {
      ...updatedPowerUps[existingIndex],
      duration: Math.min(updatedPowerUps[existingIndex].duration + powerUp.duration, powerUp.duration * 2),
    };

    return {
      ...state,
      activePowerUps: updatedPowerUps,
    };
  } else {
    // Add new power-up
    return {
      ...state,
      activePowerUps: [...(state.activePowerUps || []), newPowerUp],
    };
  }
}

export function updatePowerUps(state: GameState, deltaTime: number): GameState {
  if (!state.activePowerUps || state.activePowerUps.length === 0) {
    return state;
  }

  const updatedPowerUps = state.activePowerUps
    .map(powerUp => ({
      ...powerUp,
      duration: Math.max(0, powerUp.duration - deltaTime),
    }))
    .filter(powerUp => powerUp.duration > 0 || !powerUp.active);

  // Deactivate expired power-ups
  updatedPowerUps.forEach(powerUp => {
    if (powerUp.duration <= 0) {
      powerUp.active = false;
    }
  });

  return {
    ...state,
    activePowerUps: updatedPowerUps,
  };
}

// Speed boost effect
export function getEffectiveSpeed(baseSpeed: number, activePowerUps: PowerUp[]): number {
  if (activePowerUps?.some(p => p.type === 'speed' && p.active)) {
    return Math.max(30, baseSpeed * 0.6); // 40% faster, minimum 30ms
  }
  return baseSpeed;
}

export function moveSnake(state: GameState, currentMap?: GameMap): GameState {
  if (state.isGameOver || state.isPaused) return state;

  const head = state.snake[0];
  let newHead: Position;

  switch (state.direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Check wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y < 0 ||
    newHead.y >= GRID_SIZE
  ) {
    // Check if shield is active
    if (state.activePowerUps?.some(p => p.type === 'shield' && p.active)) {
      // Bounce back instead of game over
      return state;
    }
    return { ...state, isGameOver: true };
  }

  // Check obstacle collision (if map has obstacles)
  if (currentMap?.obstacles) {
    const hitObstacle = currentMap.obstacles.some(obstacle =>
      obstacle.coordinates.some(coord => coord[0] === newHead.x && coord[1] === newHead.y)
    );

    if (hitObstacle) {
      // Check if shield is active
      if (state.activePowerUps?.some(p => p.type === 'shield' && p.active)) {
        // Bounce back instead of game over
        return state;
      }
      return { ...state, isGameOver: true };
    }
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    // Check if shield is active
    if (state.activePowerUps?.some(p => p.type === 'shield' && p.active)) {
      // Bounce back instead of game over
      return state;
    }
    return { ...state, isGameOver: true };
  }

  const newSnake = [newHead, ...state.snake];

  // Check food collision
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    let scoreIncrease = 10;

    // Apply score multiplier if active
    if (state.activePowerUps?.some(p => p.type === 'multiplier' && p.active)) {
      scoreIncrease *= 2;
    }

    const newScore = state.score + scoreIncrease;
    const newLevel = Math.floor(newScore / 100) + 1;
    const newSpeed = Math.max(50, INITIAL_SPEED - (newLevel - 1) * SPEED_INCREMENT);

    return {
      ...state,
      snake: newSnake,
      food: generateFood(newSnake, currentMap),
      score: newScore,
      level: newLevel,
      speed: newSpeed,
    };
  }

  // Remove tail if no food eaten
  newSnake.pop();

  return {
    ...state,
    snake: newSnake,
  };
}

export function changeDirection(
  currentDirection: GameState['direction'],
  newDirection: GameState['direction']
): GameState['direction'] {
  // Prevent 180-degree turns
  const opposites: Record<string, string> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  if (opposites[currentDirection] === newDirection) {
    return currentDirection;
  }

  return newDirection;
}

export const SKINS: Record<string, { name: string; color: string; glowColor: string; rarity: string }> = {
  classic: { name: 'Classic', color: '#00ff41', glowColor: '#00ff41', rarity: 'common' },
  cyber: { name: 'Cyberpunk', color: '#ff00ff', glowColor: '#ff00ff', rarity: 'rare' },
  ocean: { name: 'Ocean', color: '#00d4ff', glowColor: '#00d4ff', rarity: 'rare' },
  fire: { name: 'Fire', color: '#ff4500', glowColor: '#ff4500', rarity: 'epic' },
  gold: { name: 'Golden', color: '#ffd700', glowColor: '#ffd700', rarity: 'legendary' },
  zen: { name: 'Zen Flow', color: '#b19cd9', glowColor: '#b19cd9', rarity: 'legendary' },
};
