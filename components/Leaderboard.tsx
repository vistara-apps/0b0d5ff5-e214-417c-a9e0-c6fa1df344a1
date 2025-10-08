'use client';

import { Trophy, Medal, Award, Play, X } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isOpen: boolean;
  onClose: () => void;
  onWatchReplay: (replayData: any[]) => void;
  currentUserAddress?: string;
}

export function Leaderboard({ entries, isOpen, onClose, onWatchReplay, currentUserAddress }: LeaderboardProps) {
  if (!isOpen) return null;
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-warning" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-text-muted font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-fg flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Daily Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-fg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard Entries */}
        <div className="space-y-2 mb-6">
          {entries.map((entry) => {
            const isCurrentUser = entry.walletAddress === currentUserAddress;

            return (
              <div
                key={entry.walletAddress}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  transition-all duration-200
                  ${isCurrentUser ? 'bg-accent/10 border-2 border-accent' : 'bg-surface hover:bg-surface-hover'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div>
                    <div className="font-medium text-fg">
                      {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                    </div>
                    {isCurrentUser && (
                      <div className="text-xs text-accent">You</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-xl font-bold text-accent tabular-nums">{entry.score}</div>
                    <div className="text-xs text-text-muted">points</div>
                  </div>

                  {/* Watch Replay Button (mock for now) */}
                  <button
                    onClick={() => onWatchReplay([])} // TODO: Pass actual replay data
                    className="cyberpunk-btn bg-surface hover:bg-surface-hover text-fg p-2 rounded"
                    title="Watch replay"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No scores yet. Be the first!</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-surface">
          <button
            onClick={onClose}
            className="w-full cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-3 px-6 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
