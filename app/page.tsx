'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2, Share2 } from 'lucide-react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameControls } from '@/components/GameControls';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { SkinSelector } from '@/components/SkinSelector';
import { Leaderboard } from '@/components/Leaderboard';
import { createInitialGameState, moveSnake, changeDirection } from '@/lib/game-engine';
import { GameState, LeaderboardEntry } from '@/lib/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [highScore, setHighScore] = useState(0);
  const [currentSkin, setCurrentSkin] = useState('classic');
  const [unlockedSkins, setUnlockedSkins] = useState(['classic', 'cyber', 'ocean']);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Mock leaderboard data
  const [leaderboardEntries] = useState<LeaderboardEntry[]>([
    { walletAddress: '0x1234...5678', username: 'CryptoSnake', score: 450, rank: 1, timestamp: new Date() },
    { walletAddress: '0x2345...6789', username: 'BlockchainGamer', score: 380, rank: 2, timestamp: new Date() },
    { walletAddress: '0x3456...7890', username: 'DeFiMaster', score: 320, rank: 3, timestamp: new Date() },
    { walletAddress: '0x4567...8901', username: 'NFTCollector', score: 280, rank: 4, timestamp: new Date() },
    { walletAddress: '0x5678...9012', username: 'Web3Dev', score: 250, rank: 5, timestamp: new Date() },
  ]);

  const startGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleDirectionChange = useCallback((newDirection: GameState['direction']) => {
    setGameState(prev => ({
      ...prev,
      direction: changeDirection(prev.direction, newDirection),
    }));
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = moveSnake(prev);
        if (newState.isGameOver && newState.score > highScore) {
          setHighScore(newState.score);
        }
        return newState;
      });
    }, gameState.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.speed, gameState.isGameOver, gameState.isPaused, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleDirectionChange('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isGameOver, handleDirectionChange, togglePause]);

  // Touch swipe controls
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState.isGameOver) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) handleDirectionChange('RIGHT');
        else if (deltaX < -30) handleDirectionChange('LEFT');
      } else {
        if (deltaY > 30) handleDirectionChange('DOWN');
        else if (deltaY < -30) handleDirectionChange('UP');
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState.isGameOver, handleDirectionChange]);

  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-accent" style={{ textShadow: 'var(--shadow-glow)' }}>
            SnakeFi
          </h1>
          <p className="text-text-muted">Earn while you slither</p>
        </div>

        {/* Score Display */}
        <ScoreDisplay
          score={gameState.score}
          level={gameState.level}
          highScore={highScore}
          variant={gameState.isGameOver ? 'gameOver' : 'inGame'}
        />

        {/* Game Canvas */}
        <GameCanvas gameState={gameState} currentSkin={currentSkin} />

        {/* Controls */}
        {!gameState.isGameOver && (
          <GameControls
            onDirectionChange={handleDirectionChange}
            disabled={gameState.isGameOver}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {gameState.isGameOver ? (
            <button
              onClick={startGame}
              className="flex-1 cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Play className="w-5 h-5" />
              Play Again
            </button>
          ) : (
            <button
              onClick={togglePause}
              className="flex-1 cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              {gameState.isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-4 px-6 rounded-lg transition-all duration-200"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-4 px-6 rounded-lg transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="glass-card p-4 rounded-lg space-y-4 animate-in fade-in duration-200">
            <SkinSelector
              currentSkin={currentSkin}
              unlockedSkins={unlockedSkins}
              onSelectSkin={setCurrentSkin}
            />
          </div>
        )}

        {/* Leaderboard Panel */}
        {showLeaderboard && (
          <div className="glass-card p-4 rounded-lg animate-in fade-in duration-200">
            <Leaderboard entries={leaderboardEntries} />
          </div>
        )}

        {/* Instructions */}
        <div className="glass-card p-4 rounded-lg text-sm text-text-muted space-y-2">
          <p className="font-semibold text-fg">How to Play:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use arrow keys or swipe to move</li>
            <li>Collect yellow food to grow and score</li>
            <li>Avoid walls and your own tail</li>
            <li>Speed increases every 100 points</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
