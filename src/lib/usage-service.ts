import { SubscriptionTier, SUBSCRIPTION_TIERS } from './subscription-config';
import SubscriptionDBService from './subscription-db-service';
import NotificationService from './notification-service';

export interface UsageStats {
  recordingTimeUsed: number;
  aiActionsUsed: number;
  recordingTimeRemaining: number;
  aiActionsRemaining: number;
}

export class UsageService {
  private static instance: UsageService;
  private dbService: SubscriptionDBService;
  private notificationService: NotificationService;

  private constructor() {
    this.dbService = SubscriptionDBService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService();
    }
    return UsageService.instance;
  }

  /**
   * Track recording time usage and check limits
   */
  async trackRecordingTime(userId: string, minutes: number): Promise<boolean> {
    try {
      const usage = await this.getUserUsage(userId);
      const subscription = await this.dbService.getSubscription(userId);
      const limits = SUBSCRIPTION_TIERS[subscription?.tier || 'free'].limits;

      // Check if adding these minutes would exceed the limit
      if (usage.recordingTimeUsed + minutes > limits.recordingTimeMinutes) {
        return false;
      }

      // Track the usage
      await this.dbService.incrementRecordingTime(userId, minutes);

      // Check if we need to send notifications
      const updatedUsage = usage.recordingTimeUsed + minutes;
      await this.notificationService.checkUsageLimits(
        userId,
        subscription?.tier || 'free',
        updatedUsage,
        usage.aiActionsUsed
      );

      return true;
    } catch (error) {
      console.error('Failed to track recording time:', error);
      return false;
    }
  }

  /**
   * Track AI action usage and check limits
   */
  async trackAiAction(userId: string): Promise<boolean> {
    try {
      const usage = await this.getUserUsage(userId);
      const subscription = await this.dbService.getSubscription(userId);
      const limits = SUBSCRIPTION_TIERS[subscription?.tier || 'free'].limits;

      // Check if adding an action would exceed the limit
      if (usage.aiActionsUsed >= limits.aiActionsPerMonth) {
        return false;
      }

      // Track the usage
      await this.dbService.incrementAiActions(userId);

      // Check if we need to send notifications
      const updatedUsage = usage.aiActionsUsed + 1;
      await this.notificationService.checkUsageLimits(
        userId,
        subscription?.tier || 'free',
        usage.recordingTimeUsed,
        updatedUsage
      );

      return true;
    } catch (error) {
      console.error('Failed to track AI action:', error);
      return false;
    }
  }

  /**
   * Get current usage statistics for a user
   */
  async getUserUsage(userId: string): Promise<UsageStats> {
    try {
      const usage = await this.dbService.getUsage(userId);
      const subscription = await this.dbService.getSubscription(userId);
      const limits = SUBSCRIPTION_TIERS[subscription?.tier || 'free'].limits;

      return {
        recordingTimeUsed: usage.recordingTimeUsed,
        aiActionsUsed: usage.aiActionsUsed,
        recordingTimeRemaining: Math.max(0, limits.recordingTimeMinutes - usage.recordingTimeUsed),
        aiActionsRemaining: Math.max(0, limits.aiActionsPerMonth - usage.aiActionsUsed)
      };
    } catch (error) {
      console.error('Failed to get user usage:', error);
      throw error;
    }
  }

  /**
   * Check if user has exceeded their tier limits
   */
  async checkUsageLimits(userId: string, tier: SubscriptionTier): Promise<boolean> {
    try {
      const usage = await this.dbService.getUsage(userId);
      const limits = SUBSCRIPTION_TIERS[tier].limits;
      
      return usage.recordingTimeUsed <= limits.recordingTimeMinutes &&
             usage.aiActionsUsed <= limits.aiActionsPerMonth;
    } catch (error) {
      console.error('Failed to check usage limits:', error);
      return false;
    }
  }

  /**
   * Reset monthly usage counts
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    try {
      await this.dbService.resetUsage(userId);
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
      throw error;
    }
  }

  /**
   * Calculate percentage of limits used
   */
  calculateUsagePercentage(used: number, limit: number): number {
    return Math.min(Math.round((used / limit) * 100), 100);
  }
}

export default UsageService;