'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserAddress?: string;
}

export function Leaderboard({ entries, currentUserAddress }: LeaderboardProps) {
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
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fg flex items-center gap-2">
        <Trophy className="w-6 h-6 text-accent" />
        Daily Leaderboard
      </h3>
      
      <div className="space-y-2">
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
              
              <div className="text-right">
                <div className="text-xl font-bold text-accent tabular-nums">{entry.score}</div>
                <div className="text-xs text-text-muted">points</div>
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
    </div>
  );
}
