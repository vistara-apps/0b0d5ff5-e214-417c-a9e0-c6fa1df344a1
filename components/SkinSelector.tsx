'use client';

import { SKINS } from '@/lib/game-engine';
import { Check } from 'lucide-react';

interface SkinSelectorProps {
  currentSkin: string;
  unlockedSkins: string[];
  onSelectSkin: (skinId: string) => void;
}

export function SkinSelector({ currentSkin, unlockedSkins, onSelectSkin }: SkinSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fg">Select Skin</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(SKINS).map(([id, skin]) => {
          const isUnlocked = unlockedSkins.includes(id);
          const isSelected = currentSkin === id;
          
          return (
            <button
              key={id}
              onClick={() => isUnlocked && onSelectSkin(id)}
              disabled={!isUnlocked}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected ? 'border-accent bg-accent/10' : 'border-gray-700 bg-surface'}
                ${isUnlocked ? 'hover:border-accent/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div
                className="w-full h-12 rounded"
                style={{
                  backgroundColor: skin.color,
                  boxShadow: isUnlocked ? `0 0 20px ${skin.glowColor}` : 'none',
                }}
              />
              
              <div className="mt-2 text-sm font-medium text-fg">{skin.name}</div>
              <div className="text-xs text-text-muted capitalize">{skin.rarity}</div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-bg" />
                </div>
              )}
              
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-xs font-bold text-fg">Locked</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
