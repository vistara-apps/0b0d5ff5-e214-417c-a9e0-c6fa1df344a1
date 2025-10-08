'use client';

import { useState } from 'react';
import { PowerUp } from '@/lib/types';
import { POWER_UPS } from '@/lib/game-engine';

interface PowerUpButtonProps {
  type: keyof typeof POWER_UPS;
  quantity: number;
  active: boolean;
  disabled?: boolean;
  onActivate: (type: keyof typeof POWER_UPS) => void;
}

export function PowerUpButton({
  type,
  quantity,
  active,
  disabled = false,
  onActivate
}: PowerUpButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const powerUp = POWER_UPS[type];

  const handleClick = () => {
    if (quantity > 0 && !active && !disabled) {
      setIsPressed(true);
      onActivate(type);
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const isDepleted = quantity === 0;
  const isUnavailable = disabled || isDepleted;

  return (
    <button
      onClick={handleClick}
      disabled={isUnavailable}
      className={`
        relative flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200
        ${active
          ? 'border-accent bg-accent/20 shadow-lg shadow-accent/50'
          : isUnavailable
            ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
            : 'border-accent/50 bg-surface hover:bg-surface-hover hover:border-accent'
        }
        ${isPressed ? 'scale-95' : 'scale-100'}
      `}
    >
      {/* Icon */}
      <span className="text-lg">{powerUp.icon || '⚡'}</span>

      {/* Quantity Badge */}
      {quantity > 0 && (
        <div className="absolute -top-2 -right-2 bg-accent text-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {quantity}
        </div>
      )}

      {/* Active Indicator */}
      {active && (
        <div className="absolute inset-0 rounded-lg border-2 border-accent animate-pulse" />
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg border border-accent/50 rounded text-xs text-fg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {powerUp.name}
        {quantity > 0 && ` (${quantity})`}
      </div>
    </button>
  );
}

