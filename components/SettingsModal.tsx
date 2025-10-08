'use client';

import { useState } from 'react';
import { SkinSelector } from './SkinSelector';
import { MapSelector } from './MapSelector';
import { X, Palette, Map, Volume2, VolumeX } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkin: string;
  unlockedSkins: string[];
  currentMap: string;
  unlockedMaps: string[];
  userLevel: number;
  soundEnabled: boolean;
  onSelectSkin: (skinId: string) => void;
  onSelectMap: (mapId: string) => void;
  onToggleSound: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentSkin,
  unlockedSkins,
  currentMap,
  unlockedMaps,
  userLevel,
  soundEnabled,
  onSelectSkin,
  onSelectMap,
  onToggleSound,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'skins' | 'maps' | 'audio'>('skins');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-fg">Settings</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-fg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1">
          <button
            onClick={() => setActiveTab('skins')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'skins'
                ? 'bg-accent text-bg'
                : 'text-fg hover:bg-surface-hover'
            }`}
          >
            <Palette className="w-4 h-4" />
            Skins
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'maps'
                ? 'bg-accent text-bg'
                : 'text-fg hover:bg-surface-hover'
            }`}
          >
            <Map className="w-4 h-4" />
            Maps
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-accent text-bg'
                : 'text-fg hover:bg-surface-hover'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Audio
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'skins' && (
            <SkinSelector
              currentSkin={currentSkin}
              unlockedSkins={unlockedSkins}
              onSelectSkin={onSelectSkin}
            />
          )}

          {activeTab === 'maps' && (
            <MapSelector
              currentMap={currentMap}
              unlockedMaps={unlockedMaps}
              userLevel={userLevel}
              onSelectMap={onSelectMap}
            />
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-fg text-center">Audio Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-fg">Sound Effects</div>
                    <div className="text-sm text-text-muted">Game sounds and UI feedback</div>
                  </div>
                  <button
                    onClick={onToggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      soundEnabled ? 'bg-accent' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="glass-card p-4 rounded-lg">
                  <div className="text-sm text-text-muted space-y-2">
                    <p>• Eating food sound effects</p>
                    <p>• Power-up activation sounds</p>
                    <p>• Game over notifications</p>
                    <p>• Achievement celebrations</p>
                  </div>
                </div>

                {soundEnabled && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-success text-sm">
                      <Volume2 className="w-4 h-4" />
                      Audio enabled
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-surface">
          <button
            onClick={onClose}
            className="w-full cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-3 px-6 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

