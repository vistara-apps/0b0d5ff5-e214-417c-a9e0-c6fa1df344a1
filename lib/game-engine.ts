import { Position, GameState, PowerUp } from './types';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 10;

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

export function generateFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  
  return food;
}

export function moveSnake(state: GameState): GameState {
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
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, isGameOver: true };
  }

  const newSnake = [newHead, ...state.snake];

  // Check food collision
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    const newScore = state.score + 10;
    const newLevel = Math.floor(newScore / 100) + 1;
    const newSpeed = Math.max(50, INITIAL_SPEED - (newLevel - 1) * SPEED_INCREMENT);
    
    return {
      ...state,
      snake: newSnake,
      food: generateFood(newSnake),
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
