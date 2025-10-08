'use client';

import { Trophy, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  level: number;
  highScore: number;
  variant?: 'inGame' | 'gameOver';
}

export function ScoreDisplay({ score, level, highScore, variant = 'inGame' }: ScoreDisplayProps) {
  if (variant === 'gameOver') {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-text-muted">Game Over</h2>
          <div className="text-6xl font-black tabular-nums text-accent" style={{ textShadow: 'var(--shadow-score-glow)' }}>
            {score}
          </div>
          <p className="text-lg text-text-muted">Final Score</p>
        </div>
        
        {score >= highScore && score > 0 && (
          <div className="flex items-center justify-center gap-2 text-warning animate-pulse">
            <Trophy className="w-6 h-6" />
            <span className="text-xl font-bold">New High Score!</span>
            <Trophy className="w-6 h-6" />
          </div>
        )}
        
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-fg">{level}</div>
            <div className="text-text-muted">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-fg">{highScore}</div>
            <div className="text-text-muted">Best</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 glass-card rounded-lg">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-black tabular-nums text-accent">{score}</div>
          <div className="text-xs text-text-muted">Score</div>
        </div>
        
        <div className="h-8 w-px bg-gray-700" />
        
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          <div>
            <div className="text-xl font-bold text-fg">{level}</div>
            <div className="text-xs text-text-muted">Level</div>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-1 text-text-muted">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">Best</span>
        </div>
        <div className="text-xl font-bold text-fg tabular-nums">{highScore}</div>
      </div>
    </div>
  );
}
