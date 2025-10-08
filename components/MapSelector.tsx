'use client';

import { useState } from 'react';
import { Map as GameMap } from '@/lib/types';
import { MAPS } from '@/lib/maps';
import { Lock, Check } from 'lucide-react';

interface MapSelectorProps {
  currentMap: string;
  unlockedMaps: string[];
  userLevel: number;
  onSelectMap: (mapId: string) => void;
}

export function MapSelector({
  currentMap,
  unlockedMaps,
  userLevel,
  onSelectMap
}: MapSelectorProps) {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const availableMaps = Object.values(MAPS).filter(map => map.unlockLevel <= userLevel);

  const handleMapSelect = (mapId: string) => {
    if (unlockedMaps.includes(mapId)) {
      setSelectedMap(mapId);
      onSelectMap(mapId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-fg text-center">Select Map</h3>

      <div className="grid grid-cols-2 gap-3">
        {availableMaps.map((map) => {
          const isUnlocked = unlockedMaps.includes(map.id);
          const isSelected = currentMap === map.id;
          const canUnlock = userLevel >= map.unlockLevel;

          return (
            <button
              key={map.id}
              onClick={() => handleMapSelect(map.id)}
              disabled={!isUnlocked}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-accent bg-accent/10'
                  : isUnlocked
                    ? 'border-accent/50 bg-surface hover:bg-surface-hover hover:border-accent'
                    : 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Map Preview (placeholder) */}
              <div className="w-full h-20 bg-surface rounded mb-2 flex items-center justify-center">
                <span className="text-2xl">
                  {map.id === 'classic' && '🏛️'}
                  {map.id === 'cyber' && '🌆'}
                  {map.id === 'ocean' && '🌊'}
                  {map.id === 'fire' && '🔥'}
                  {map.id === 'zen' && '🧘'}
                </span>
              </div>

              {/* Map Info */}
              <div className="text-center">
                <div className="font-semibold text-fg text-sm">{map.name}</div>
                <div className="text-xs text-text-muted">
                  Difficulty: {map.difficulty}/5
                </div>
              </div>

              {/* Status Indicators */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-accent rounded-full p-1">
                  <Check className="w-3 h-3 text-bg" />
                </div>
              )}

              {!isUnlocked && canUnlock && (
                <div className="absolute top-2 right-2 bg-warning rounded-full p-1">
                  <Lock className="w-3 h-3 text-bg" />
                </div>
              )}

              {!canUnlock && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">
                      Level {map.unlockLevel}
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Map Description */}
      {selectedMap && (
        <div className="glass-card p-4 rounded-lg">
          <h4 className="font-semibold text-fg mb-2">
            {MAPS[selectedMap]?.name}
          </h4>
          <p className="text-sm text-text-muted">
            {selectedMap === 'classic' && 'The classic SnakeFi arena. Perfect for beginners.'}
            {selectedMap === 'cyber' && 'Navigate through neon-lit obstacles in this cyberpunk maze.'}
            {selectedMap === 'ocean' && 'Swim through underwater challenges with moving obstacles.'}
            {selectedMap === 'fire' && 'Survive the volcanic chambers with intense difficulty.'}
            {selectedMap === 'zen' && 'A peaceful garden for mindful gameplay.'}
          </p>
        </div>
      )}
    </div>
  );
}

