'use client';

import { useState } from 'react';
import { paymentManager } from '@/lib/payments';
import { POWER_UP_PACKS, getPowerUpDefinition } from '@/lib/powerups';
import { getAllSkins } from '@/lib/database';
import { X, ShoppingCart, Zap, Crown } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'skin' | 'powerup' | 'subscription' | 'battlepass';
  itemId?: string;
  onPurchaseSuccess: (type: string, itemId: string) => void;
}

export function PurchaseModal({
  isOpen,
  onClose,
  type,
  itemId,
  onPurchaseSuccess
}: PurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!itemId) return;

    setIsProcessing(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'skin':
          const skins = await getAllSkins();
          const skin = skins.find(s => s.id === itemId);
          if (!skin) throw new Error('Skin not found');

          result = await paymentManager.purchaseSkin(itemId, skin.price || 0);
          break;

        case 'powerup':
          const pack = POWER_UP_PACKS[itemId];
          if (!pack) throw new Error('Power-up pack not found');

          result = await paymentManager.purchasePowerUpPack(itemId, pack.price);
          break;

        case 'subscription':
          result = await paymentManager.subscribeToZenMode();
          break;

        case 'battlepass':
          result = await paymentManager.upgradeBattlePass();
          break;

        default:
          throw new Error('Invalid purchase type');
      }

      if (result.success) {
        onPurchaseSuccess(type, itemId);
        onClose();
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPurchaseDetails = () => {
    switch (type) {
      case 'skin':
        const skins = getAllSkins();
        const skin = skins.find(s => s.id === itemId);
        return {
          title: 'Purchase Skin',
          icon: '🎨',
          name: skin?.name || 'Unknown Skin',
          price: skin?.price ? `${skin.price} ETH` : 'Free',
          description: `Unlock the ${skin?.name} skin for your snake!`,
        };

      case 'powerup':
        const pack = POWER_UP_PACKS[itemId || ''];
        return {
          title: 'Purchase Power-ups',
          icon: '⚡',
          name: pack?.name || 'Unknown Pack',
          price: pack ? `${pack.price} ETH` : 'Unknown',
          description: pack?.description || '',
        };

      case 'subscription':
        return {
          title: 'Subscribe to Zen Mode',
          icon: '🧘',
          name: 'Zen Mode Subscription',
          price: '$2.99/month',
          description: 'Ad-free experience with exclusive skins and ambient soundscapes',
        };

      case 'battlepass':
        return {
          title: 'Upgrade Battle Pass',
          icon: '👑',
          name: 'Premium Battle Pass',
          price: '$4.99',
          description: 'Unlock all rewards instantly and get exclusive premium content',
        };

      default:
        return {
          title: 'Purchase',
          icon: '🛒',
          name: 'Unknown Item',
          price: 'Unknown',
          description: '',
        };
    }
  };

  const details = getPurchaseDetails();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-lg p-6 max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-fg">{details.title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-fg p-1"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Purchase Details */}
        <div className="text-center space-y-4 mb-6">
          <div className="text-4xl">{details.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-fg">{details.name}</h3>
            <p className="text-2xl font-bold text-accent">{details.price}</p>
          </div>
          <p className="text-text-muted text-sm">{details.description}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger/20 border border-danger/50 rounded-lg p-3 mb-4">
            <p className="text-danger text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full cyberpunk-btn bg-accent hover:bg-accent/90 text-bg font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg"></div>
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Purchase
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full cyberpunk-btn bg-surface hover:bg-surface-hover text-fg font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {/* Terms */}
        <div className="mt-4 text-center">
          <p className="text-xs text-text-muted">
            All purchases are processed via Base Wallet.
            No refunds available.
          </p>
        </div>
      </div>
    </div>
  );
}

