'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, Position } from '@/lib/types';
import { GRID_SIZE, CELL_SIZE, SKINS } from '@/lib/game-engine';
import { Play, Pause, SkipForward } from 'lucide-react';

interface GhostReplayProps {
  replayData: Position[][];
  skinId: string;
  onClose: () => void;
}

export function GhostReplay({ replayData, skinId, onClose }: GhostReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = replayData.length;
  const skin = SKINS[skinId] || SKINS.classic;

  useEffect(() => {
    if (isPlaying && currentFrame < totalFrames - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentFrame(prev => prev + 1);
      }, 100 / speed); // Base speed of 100ms per frame
    } else if (currentFrame >= totalFrames - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentFrame, totalFrames, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw ghost snake
    if (replayData[currentFrame]) {
      const snake = replayData[currentFrame];
      ctx.fillStyle = skin.color;
      ctx.globalAlpha = 0.7; // Semi-transparent for ghost effect

      snake.forEach((segment, index) => {
        const isHead = index === 0;
        const alpha = 1 - (index / snake.length) * 0.3;

        ctx.globalAlpha = alpha * 0.7;

        if (isHead) {
          ctx.shadowBlur = 15;
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
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.9;
          const eyeSize = cellSize / 6;

          ctx.fillRect(
            segment.x * cellSize + cellSize / 4,
            segment.y * cellSize + cellSize / 4,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * cellSize + cellSize - cellSize / 4 - eyeSize,
            segment.y * cellSize + cellSize / 4,
            eyeSize,
            eyeSize
          );
        }
      });

      ctx.globalAlpha = 1;
    }
  }, [currentFrame, skin]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const skipToEnd = () => {
    setCurrentFrame(totalFrames - 1);
    setIsPlaying(false);
  };

  const reset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const progress = (currentFrame / (totalFrames - 1)) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-lg p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-fg">Ghost Replay</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-fg"
          >
            ✕
          </button>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="w-full border border-accent/20 rounded"
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>Frame {currentFrame + 1}/{totalFrames}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg p-2 rounded"
          >
            ↺
          </button>

          <button
            onClick={togglePlay}
            className="cyberpunk-btn bg-accent hover:bg-accent/90 text-bg p-3 rounded-lg"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <button
            onClick={skipToEnd}
            className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg p-2 rounded"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-text-muted">Speed:</span>
          {[0.5, 1, 1.5, 2].map((speedOption) => (
            <button
              key={speedOption}
              onClick={() => setSpeed(speedOption)}
              className={`px-2 py-1 rounded text-xs ${
                speed === speedOption
                  ? 'bg-accent text-bg'
                  : 'bg-surface hover:bg-surface-hover text-fg'
              }`}
            >
              {speedOption}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

