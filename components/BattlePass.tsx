'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Gift } from 'lucide-react';
import { BattlePass as BattlePassType } from '@/lib/types';

interface BattlePassProps {
  battlePass: BattlePassType;
  userTier: number;
  userProgress: number;
  isPremium: boolean;
  onUpgrade?: () => void;
  onClaimReward?: (tier: number) => void;
}

export function BattlePass({
  battlePass,
  userTier,
  userProgress,
  isPremium,
  onUpgrade,
  onClaimReward
}: BattlePassProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const progressPercentage = (userProgress / 100) * 100; // Assuming 100 points per tier

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-fg">{battlePass.name}</h2>
        </div>
        <p className="text-text-muted">
          {new Date(battlePass.startDate).toLocaleDateString()} - {new Date(battlePass.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Current Progress */}
      <div className="glass-card p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-warning" />
            <span className="font-semibold text-fg">Current Tier: {userTier}</span>
          </div>
          <div className="text-sm text-text-muted">
            {userProgress}/100 XP
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface rounded-full h-3">
          <div
            className="bg-accent h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-center text-sm text-text-muted">
          {100 - userProgress} XP to next tier
        </div>
      </div>

      {/* Premium Upgrade Banner */}
      {!isPremium && (
        <div className="glass-card p-4 rounded-lg border-2 border-warning/50 bg-warning/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-warning" />
              <div>
                <h3 className="font-bold text-fg">Upgrade to Premium</h3>
                <p className="text-sm text-text-muted">Unlock all rewards instantly</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="cyberpunk-btn bg-warning hover:bg-warning/90 text-bg font-bold py-2 px-4 rounded-lg"
            >
              $4.99
            </button>
          </div>
        </div>
      )}

      {/* Reward Tracks */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-fg text-center">Reward Tracks</h3>

        {/* Free Track */}
        <div className="space-y-2">
          <h4 className="font-semibold text-fg flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Free Track
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {battlePass.freeTierRewards.map((reward, index) => {
              const tier = reward.tier;
              const isUnlocked = userTier >= tier;
              const isClaimed = userTier > tier;

              return (
                <div
                  key={tier}
                  className={`glass-card p-3 rounded-lg text-center cursor-pointer transition-all ${
                    isUnlocked && !isClaimed ? 'border-2 border-accent bg-accent/10' : ''
                  } ${isClaimed ? 'opacity-50' : ''}`}
                  onClick={() => isUnlocked && !isClaimed && onClaimReward?.(tier)}
                >
                  <div className="text-2xl mb-1">{reward.reward === 'skin' ? '🎨' : '⚡'}</div>
                  <div className="text-xs font-semibold text-fg">Tier {tier}</div>
                  <div className="text-xs text-text-muted">
                    {reward.reward.replace('_', ' ')}
                  </div>
                  {isUnlocked && !isClaimed && (
                    <div className="text-xs text-accent font-bold mt-1">Claim!</div>
                  )}
                  {isClaimed && (
                    <div className="text-xs text-success font-bold mt-1">Claimed</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Track */}
        <div className="space-y-2">
          <h4 className="font-semibold text-fg flex items-center gap-2">
            <Crown className="w-4 h-4 text-warning" />
            Premium Track
            {!isPremium && <span className="text-xs text-text-muted">(Locked)</span>}
          </h4>
          <div className={`grid grid-cols-5 gap-2 ${!isPremium ? 'opacity-50' : ''}`}>
            {battlePass.premiumTierRewards.map((reward, index) => {
              const tier = reward.tier;
              const isUnlocked = isPremium || userTier >= tier;
              const isClaimed = isPremium && userTier >= tier;

              return (
                <div
                  key={tier}
                  className={`glass-card p-3 rounded-lg text-center cursor-pointer transition-all ${
                    isUnlocked && !isClaimed ? 'border-2 border-warning bg-warning/10' : ''
                  } ${isClaimed ? 'opacity-50' : ''}`}
                  onClick={() => isUnlocked && !isClaimed && onClaimReward?.(tier)}
                >
                  <div className="text-2xl mb-1">{reward.reward === 'skin' ? '🎨' : '⚡'}</div>
                  <div className="text-xs font-semibold text-fg">Tier {tier}</div>
                  <div className="text-xs text-text-muted">
                    {reward.reward.replace('_', ' ')}
                  </div>
                  {isUnlocked && !isClaimed && (
                    <div className="text-xs text-warning font-bold mt-1">Claim!</div>
                  )}
                  {isClaimed && (
                    <div className="text-xs text-success font-bold mt-1">Claimed</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-fg text-center">Daily Challenges</h3>
        <div className="space-y-2">
          {battlePass.challenges.map((challenge, index) => (
            <div key={index} className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-fg">{challenge.objective}</div>
                  <div className="text-sm text-text-muted">+{challenge.points} XP</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-accent">Tier {challenge.tier}</div>
                  <div className="text-xs text-text-muted">Reward</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

