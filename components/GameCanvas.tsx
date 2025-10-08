'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, Position } from '@/lib/types';
import { GRID_SIZE, CELL_SIZE, SKINS } from '@/lib/game-engine';

interface GameCanvasProps {
  gameState: GameState;
  currentSkin: string;
}

export function GameCanvas({ gameState, currentSkin }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 420);
      const size = Math.floor(maxWidth / GRID_SIZE) * GRID_SIZE;
      setDimensions({ width: size, height: size });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = dimensions.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, dimensions.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(dimensions.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    const food = gameState.food;
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    const skin = SKINS[currentSkin] || SKINS.classic;
    gameState.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const alpha = 1 - (index / gameState.snake.length) * 0.3;
      
      ctx.fillStyle = skin.color;
      ctx.globalAlpha = alpha;
      
      if (isHead) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = skin.glowColor;
      }
      
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
      
      if (isHead) {
        ctx.shadowBlur = 0;
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 1;
        const eyeSize = cellSize / 6;
        const eyeOffset = cellSize / 4;
        
        if (gameState.direction === 'RIGHT' || gameState.direction === 'LEFT') {
          ctx.fillRect(
            segment.x * cellSize + eyeOffset,
            segment.y * cellSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * cellSize + eyeOffset,
            segment.y * cellSize + cellSize - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        } else {
          ctx.fillRect(
            segment.x * cellSize + eyeOffset,
            segment.y * cellSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * cellSize + cellSize - eyeOffset - eyeSize,
            segment.y * cellSize + eyeOffset,
            eyeSize,
            eyeSize
          );
        }
      }
    });
    
    ctx.globalAlpha = 1;
  }, [gameState, dimensions, currentSkin]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="neon-border rounded-sm"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
