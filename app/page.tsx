'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, RotateCcw, Settings2, Share2, LogOut, Trophy, Zap } from 'lucide-react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameControls } from '@/components/GameControls';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { SkinSelector } from '@/components/SkinSelector';
import { Leaderboard } from '@/components/Leaderboard';
import { PowerUpButton } from '@/components/PowerUpButton';
import { SettingsModal } from '@/components/SettingsModal';
import { PurchaseModal } from '@/components/PurchaseModal';
import { ShareCard } from '@/components/ShareCard';
import { GhostReplay } from '@/components/GhostReplay';
import { useAuth } from '@/components/AuthProvider';
import { createInitialGameState, moveSnake, changeDirection, activatePowerUp, updatePowerUps, getEffectiveSpeed, POWER_UPS } from '@/lib/game-engine';
import { getMapById } from '@/lib/maps';
import { GameState, LeaderboardEntry, PowerUp } from '@/lib/types';
import { getUser, saveGameSession, getUserPowerUps } from '@/lib/database';

export default function Home() {
  const { authState, logout } = useAuth();
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [highScore, setHighScore] = useState(0);
  const [currentSkin, setCurrentSkin] = useState('classic');
  const [currentMap, setCurrentMap] = useState('classic');
  const [unlockedSkins, setUnlockedSkins] = useState(['classic']);
  const [unlockedMaps, setUnlockedMaps] = useState(['classic']);
  const [userLevel, setUserLevel] = useState(1);
  const [userPowerUps, setUserPowerUps] = useState<Record<string, number>>({
    shield: 3,
    speed: 2,
    multiplier: 1,
    magnet: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showGhostReplay, setShowGhostReplay] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'skin' | 'powerup' | 'subscription' | 'battlepass'>('skin');
  const [purchaseItemId, setPurchaseItemId] = useState<string>('');

  // Game data
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [ghostReplayData, setGhostReplayData] = useState<Position[][]>([]);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState, router]);

  // Load user data
  useEffect(() => {
    if (authState.isAuthenticated && authState.walletAddress) {
      loadUserData();
      loadLeaderboard();
    }
  }, [authState]);

  const loadUserData = async () => {
    if (!authState.walletAddress) return;

    try {
      const user = await getUser(authState.walletAddress);
      if (user) {
        setUserLevel(user.level);
        setHighScore(user.highScore);
        setCurrentSkin(user.currentSkin);
        setUnlockedSkins(user.unlockedSkins);
        setUnlockedMaps(user.unlockedMaps);
      }

      const powerUps = await getUserPowerUps(authState.walletAddress);
      const powerUpMap: Record<string, number> = {};
      powerUps.forEach(pu => {
        powerUpMap[pu.powerUpType] = pu.quantity;
      });
      setUserPowerUps(powerUpMap);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?type=daily&limit=10');
      const data = await response.json();
      setLeaderboardEntries(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

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

  const activatePowerUpHandler = useCallback((powerUpType: keyof typeof POWER_UPS) => {
    if (userPowerUps[powerUpType] > 0) {
      setGameState(prev => activatePowerUp(prev, powerUpType));
      setUserPowerUps(prev => ({
        ...prev,
        [powerUpType]: prev[powerUpType] - 1,
      }));
    }
  }, [userPowerUps]);

  const handlePurchase = useCallback((type: string, itemId: string) => {
    setPurchaseType(type as any);
    setPurchaseItemId(itemId);
    setShowPurchaseModal(true);
  }, []);

  const handlePurchaseSuccess = useCallback(async (type: string, itemId: string) => {
    if (type === 'skin') {
      setUnlockedSkins(prev => [...prev, itemId]);
      setCurrentSkin(itemId);
    }
    // Reload user data
    await loadUserData();
  }, []);

  const handleShare = useCallback(async (platform: 'farcaster' | 'twitter') => {
    // Implement sharing logic
    console.log(`Sharing to ${platform}`);
  }, []);

  const handleWatchReplay = useCallback((replayData: Position[][]) => {
    setGhostReplayData(replayData);
    setShowGhostReplay(true);
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

    const currentMap = getMapById(currentMap);
    const effectiveSpeed = getEffectiveSpeed(gameState.speed, gameState.activePowerUps);

    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const newState = moveSnake(prev, currentMap);
        if (newState.isGameOver) {
          if (newState.score > highScore) {
            setHighScore(newState.score);
          }
          // Save game session
          if (authState.walletAddress) {
            saveGameSession({
              sessionId: `session_${Date.now()}`,
              walletAddress: authState.walletAddress,
              score: newState.score,
              level: newState.level,
              duration: 0, // TODO: track duration
              mapUsed: currentMap,
              skinUsed: currentSkin,
              powerUpsUsed: [], // TODO: track used power-ups
              replayData: [], // TODO: implement replay recording
              timestamp: new Date(),
              isPersonalBest: newState.score > highScore,
            });
          }
        }
        return newState;
      });
    }, effectiveSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.speed, gameState.isGameOver, gameState.isPaused, gameState.activePowerUps, highScore, currentMap, currentSkin, authState.walletAddress]);

  // Power-up update loop
  useEffect(() => {
    if (gameState.activePowerUps && gameState.activePowerUps.length > 0) {
      powerUpUpdateRef.current = setInterval(() => {
        setGameState(prev => updatePowerUps(prev, 100)); // Update every 100ms
      }, 100);
    } else {
      if (powerUpUpdateRef.current) {
        clearInterval(powerUpUpdateRef.current);
        powerUpUpdateRef.current = null;
      }
    }

    return () => {
      if (powerUpUpdateRef.current) {
        clearInterval(powerUpUpdateRef.current);
      }
    };
  }, [gameState.activePowerUps]);

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

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Connecting to Base Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-accent" style={{ textShadow: 'var(--shadow-glow)' }}>
              SnakeFi
            </h1>
            <p className="text-text-muted text-sm">Level {userLevel} • {authState.username}</p>
          </div>
          <button
            onClick={logout}
            className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg p-2 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
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

        {/* Power-ups */}
        {!gameState.isGameOver && (
          <div className="flex justify-center gap-2">
            {Object.entries(POWER_UPS).map(([key, powerUp]) => (
              <PowerUpButton
                key={key}
                type={key as keyof typeof POWER_UPS}
                quantity={userPowerUps[key] || 0}
                active={gameState.activePowerUps?.some(p => p.type === key && p.active) || false}
                onActivate={activatePowerUpHandler}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        {!gameState.isGameOver && (
          <GameControls
            onDirectionChange={handleDirectionChange}
            disabled={gameState.isGameOver}
          />
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {gameState.isGameOver ? (
            <>
              <button
                onClick={startGame}
                className="cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Play className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => setShowShareCard(true)}
                className="cyberpunk-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                Share Score
              </button>
            </>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                {gameState.isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/battlepass')}
                className="cyberpunk-btn bg-warning hover:bg-warning/90 text-bg font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Trophy className="w-4 h-4" />
                Battle Pass
              </button>
            </>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex-1 cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePurchase('powerup', 'starter')}
            className="flex-1 cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="glass-card p-3 rounded-lg text-xs text-text-muted space-y-1">
          <p className="font-semibold text-fg">How to Play:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Swipe or use arrow keys to move</li>
            <li>Collect food to grow and score</li>
            <li>Use power-ups strategically</li>
            <li>Avoid walls and obstacles</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSkin={currentSkin}
        unlockedSkins={unlockedSkins}
        currentMap={currentMap}
        unlockedMaps={unlockedMaps}
        userLevel={userLevel}
        soundEnabled={soundEnabled}
        onSelectSkin={setCurrentSkin}
        onSelectMap={setCurrentMap}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      <Leaderboard
        entries={leaderboardEntries}
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        onWatchReplay={handleWatchReplay}
      />

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        type={purchaseType}
        itemId={purchaseItemId}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <ShareCard
        type="highscore"
        score={gameState.score}
        level={gameState.level}
        onShare={handleShare}
        onClose={() => setShowShareCard(false)}
      />

      <GhostReplay
        replayData={ghostReplayData}
        skinId={currentSkin}
        onClose={() => setShowGhostReplay(false)}
      />
    </main>
  );
}
