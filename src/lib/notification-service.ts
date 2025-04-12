import { db } from './firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from './subscription-config';

export interface UsageNotification {
  id: string;
  userId: string;
  type: 'recording' | 'ai_actions';
  percentage: number;
  message: string;
  createdAt: Date;
  read: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if user needs to be notified about usage limits
   */
  async checkUsageLimits(
    userId: string,
    tier: SubscriptionTier,
    recordingTimeUsed: number,
    aiActionsUsed: number
  ): Promise<UsageNotification[]> {
    const notifications: UsageNotification[] = [];
    const limits = SUBSCRIPTION_TIERS[tier].limits;
    
    // Notification thresholds (percentage of limit)
    const thresholds = [50, 80, 90, 95];
    
    // Check recording time usage
    const recordingPercentage = (recordingTimeUsed / limits.recordingTimeMinutes) * 100;
    for (const threshold of thresholds) {
      if (recordingPercentage >= threshold) {
        const lastNotification = await this.getLastNotification(userId, 'recording', threshold);
        if (!lastNotification) {
          notifications.push({
            id: `${userId}_recording_${threshold}`,
            userId,
            type: 'recording',
            percentage: threshold,
            message: `You've used ${threshold}% of your recording time limit`,
            createdAt: new Date(),
            read: false
          });
        }
      }
    }

    // Check AI actions usage
    const aiActionsPercentage = (aiActionsUsed / limits.aiActionsPerMonth) * 100;
    for (const threshold of thresholds) {
      if (aiActionsPercentage >= threshold) {
        const lastNotification = await this.getLastNotification(userId, 'ai_actions', threshold);
        if (!lastNotification) {
          notifications.push({
            id: `${userId}_ai_actions_${threshold}`,
            userId,
            type: 'ai_actions',
            percentage: threshold,
            message: `You've used ${threshold}% of your AI actions limit`,
            createdAt: new Date(),
            read: false
          });
        }
      }
    }

    // Save new notifications
    await Promise.all(
      notifications.map(notification => this.saveNotification(notification))
    );

    return notifications;
  }

  /**
   * Get last notification for a specific type and threshold
   */
  private async getLastNotification(
    userId: string,
    type: 'recording' | 'ai_actions',
    threshold: number
  ): Promise<UsageNotification | null> {
    try {
      const notificationId = `${userId}_${type}_${threshold}`;
      const docRef = doc(db, 'notifications', notificationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        type: data.type,
        percentage: data.percentage,
        message: data.message,
        createdAt: data.createdAt.toDate(),
        read: data.read
      };
    } catch (error) {
      console.error('Failed to get last notification:', error);
      return null;
    }
  }

  /**
   * Save a new notification
   */
  private async saveNotification(notification: UsageNotification): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notification.id);
      await setDoc(docRef, {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt)
      });
    } catch (error) {
      console.error('Failed to save notification:', error);
      throw error;
    }
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<UsageNotification[]> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return [];
      }

      const notifications = docSnap.data().notifications || [];
      return notifications
        .filter((n: any) => !n.read)
        .map((n: any) => ({
          ...n,
          createdAt: n.createdAt.toDate()
        }));
    } catch (error) {
      console.error('Failed to get unread notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await setDoc(docRef, { read: true }, { merge: true });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }
}

export default NotificationService;