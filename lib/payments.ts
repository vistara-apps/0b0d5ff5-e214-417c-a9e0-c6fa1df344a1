import { MiniKit } from '@coinbase/minikit-js';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class PaymentManager {
  private static instance: PaymentManager;

  private constructor() {}

  static getInstance(): PaymentManager {
    if (!PaymentManager.instance) {
      PaymentManager.instance = new PaymentManager();
    }
    return PaymentManager.instance;
  }

  async purchaseSkin(skinId: string, price: number): Promise<PaymentResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Payments can only be initiated on client side');
      }

      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed. Please install Base Wallet.');
      }

      const result = await MiniKit.pay({
        amount: price,
        currency: 'ETH',
        destination: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x...', // Your payment address
      });

      if (result.success) {
        // Here you would typically verify the transaction on-chain
        // For now, we'll assume success
        return {
          success: true,
          transactionId: result.transactionId,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Payment failed',
        };
      }
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }

  async purchasePowerUpPack(packId: string, price: number): Promise<PaymentResult> {
    return this.purchaseSkin(packId, price); // Same flow for power-up packs
  }

  async subscribeToZenMode(): Promise<PaymentResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Subscriptions can only be initiated on client side');
      }

      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed. Please install Base Wallet.');
      }

      // Zen Mode subscription - $2.99 per month
      const result = await MiniKit.pay({
        amount: 0.00299, // Approximately $2.99 in ETH (price may vary)
        currency: 'ETH',
        destination: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x...',
        recurring: true,
        interval: 'monthly',
      });

      if (result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Subscription failed',
        };
      }
    } catch (error) {
      console.error('Subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown subscription error',
      };
    }
  }

  async upgradeBattlePass(): Promise<PaymentResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Battle pass upgrade can only be initiated on client side');
      }

      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed. Please install Base Wallet.');
      }

      // Battle Pass upgrade - $4.99
      const result = await MiniKit.pay({
        amount: 0.00499, // Approximately $4.99 in ETH
        currency: 'ETH',
        destination: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x...',
      });

      if (result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Battle pass upgrade failed',
        };
      }
    } catch (error) {
      console.error('Battle pass upgrade error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upgrade error',
      };
    }
  }
}

export const paymentManager = PaymentManager.getInstance();

