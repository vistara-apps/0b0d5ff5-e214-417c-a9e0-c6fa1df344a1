import { MiniKit } from '@coinbase/minikit-js';

export interface NotificationData {
  title: string;
  body: string;
  deepLink?: string;
  scheduledTime?: Date;
}

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async sendNotification(walletAddress: string, notification: NotificationData): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Notifications can only be sent on client side');
      }

      if (!MiniKit.isInstalled()) {
        return false;
      }

      const result = await MiniKit.notifications.send({
        address: walletAddress,
        title: notification.title,
        body: notification.body,
        deepLink: notification.deepLink,
      });

      return result.success;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }

  async scheduleFriendBeatScore(walletAddress: string, friendName: string): Promise<void> {
    await this.sendNotification(walletAddress, {
      title: 'Score Beaten! 🐍',
      body: `${friendName} just beat your high score! Time to reclaim the throne.`,
      deepLink: '/play',
    });
  }

  async scheduleDailyChallenge(walletAddress: string): Promise<void> {
    await this.sendNotification(walletAddress, {
      title: 'Daily Challenge Ready 🎯',
      body: 'New daily challenge available! Score 500+ to unlock Ocean Skin 🌊',
      deepLink: '/challenges',
    });
  }

  async scheduleBattlePassTierUnlocked(walletAddress: string, tier: number): Promise<void> {
    await this.sendNotification(walletAddress, {
      title: `Tier ${tier} Unlocked! 🎉`,
      body: 'New battle pass rewards available. Tap to claim your prizes!',
      deepLink: '/battlepass',
    });
  }

  async scheduleSubscriptionReminder(walletAddress: string, daysLeft: number): Promise<void> {
    await this.sendNotification(walletAddress, {
      title: 'Zen Mode Renewal ⏰',
      body: `Your Zen Mode subscription renews in ${daysLeft} days. Stay calm and collected! 🧘`,
      deepLink: '/subscription',
    });
  }

  // Batch notification scheduling for efficiency
  async scheduleUserNotifications(walletAddress: string, events: Array<{
    type: 'friend_beat' | 'daily_challenge' | 'battle_pass' | 'subscription';
    data?: any;
  }>): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case 'friend_beat':
          await this.scheduleFriendBeatScore(walletAddress, event.data.friendName);
          break;
        case 'daily_challenge':
          await this.scheduleDailyChallenge(walletAddress);
          break;
        case 'battle_pass':
          await this.scheduleBattlePassTierUnlocked(walletAddress, event.data.tier);
          break;
        case 'subscription':
          await this.scheduleSubscriptionReminder(walletAddress, event.data.daysLeft);
          break;
      }

      // Small delay to avoid overwhelming the notification system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export const notificationManager = NotificationManager.getInstance();

