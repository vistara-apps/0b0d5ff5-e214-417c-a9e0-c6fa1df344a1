'use client';

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  disabled?: boolean;
}

export function GameControls({ onDirectionChange, disabled }: GameControlsProps) {
  const buttonClass = `
    w-16 h-16 rounded-full bg-surface hover:bg-surface-hover
    flex items-center justify-center
    transition-all duration-200
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    border-2 border-accent/30 hover:border-accent
  `;

  return (
    <div className="grid grid-cols-3 gap-4 w-48 mx-auto">
      <div className="col-start-2">
        <button
          onClick={() => onDirectionChange('UP')}
          disabled={disabled}
          className={buttonClass}
          aria-label="Move up"
        >
          <ArrowUp className="w-8 h-8 text-accent" />
        </button>
      </div>
      
      <button
        onClick={() => onDirectionChange('LEFT')}
        disabled={disabled}
        className={buttonClass}
        aria-label="Move left"
      >
        <ArrowLeft className="w-8 h-8 text-accent" />
      </button>
      
      <div />
      
      <button
        onClick={() => onDirectionChange('RIGHT')}
        disabled={disabled}
        className={buttonClass}
        aria-label="Move right"
      >
        <ArrowRight className="w-8 h-8 text-accent" />
      </button>
      
      <div className="col-start-2">
        <button
          onClick={() => onDirectionChange('DOWN')}
          disabled={disabled}
          className={buttonClass}
          aria-label="Move down"
        >
          <ArrowDown className="w-8 h-8 text-accent" />
        </button>
      </div>
    </div>
  );
}
