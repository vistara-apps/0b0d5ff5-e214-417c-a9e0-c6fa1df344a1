'use client';

import { useState } from 'react';
import { Share2, Twitter, MessageCircle } from 'lucide-react';

interface ShareCardProps {
  type: 'death' | 'achievement' | 'highscore';
  score?: number;
  level?: number;
  skin?: string;
  achievement?: string;
  onShare: (platform: 'farcaster' | 'twitter') => void;
  onClose: () => void;
}

export function ShareCard({
  type,
  score,
  level,
  skin,
  achievement,
  onShare,
  onClose
}: ShareCardProps) {
  const [isSharing, setIsSharing] = useState(false);

  const getShareContent = () => {
    switch (type) {
      case 'death':
        return {
          title: 'Game Over! 💀',
          message: `Just scored ${score} points in SnakeFi! Can you beat my high score? 🐍`,
          emoji: '💀',
        };
      case 'achievement':
        return {
          title: `${achievement} Unlocked! 🏆`,
          message: `Unlocked "${achievement}" in SnakeFi! Level ${level} reached! 🎮`,
          emoji: '🏆',
        };
      case 'highscore':
        return {
          title: 'New High Score! 🔥',
          message: `New personal best: ${score} points in SnakeFi! Who's next? 🐍`,
          emoji: '🔥',
        };
      default:
        return {
          title: 'SnakeFi Achievement!',
          message: 'Playing SnakeFi on Base!',
          emoji: '🐍',
        };
    }
  };

  const content = getShareContent();

  const handleShare = async (platform: 'farcaster' | 'twitter') => {
    setIsSharing(true);
    try {
      await onShare(platform);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-lg p-6 max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{content.emoji}</div>
          <h2 className="text-xl font-bold text-fg">{content.title}</h2>
          <p className="text-text-muted mt-2">{content.message}</p>
        </div>

        {/* Share Preview Card */}
        <div className="glass-card p-4 rounded-lg mb-6">
          <div className="text-center space-y-2">
            <div className="text-2xl">🐍</div>
            <div className="font-bold text-fg">SnakeFi</div>
            {score && <div className="text-accent font-bold text-lg">{score} pts</div>}
            {level && <div className="text-text-muted text-sm">Level {level}</div>}
            {skin && <div className="text-text-muted text-sm">{skin} skin</div>}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleShare('farcaster')}
            disabled={isSharing}
            className="w-full cyberpunk-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5" />
            Share on Farcaster
          </button>

          <button
            onClick={() => handleShare('twitter')}
            disabled={isSharing}
            className="w-full cyberpunk-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Twitter className="w-5 h-5" />
            Share on Twitter
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-2 px-4 rounded-lg"
          >
            Skip
          </button>
          <button
            onClick={() => handleShare('farcaster')}
            disabled={isSharing}
            className="flex-1 cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

