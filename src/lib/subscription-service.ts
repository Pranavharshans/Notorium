import { verifyWebhookSignature } from '@dodopayments/node';

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionLimits {
  recordingTimeMinutes: number;
  aiActionsPerMonth: number;
  canCreateNotes: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    recordingTimeMinutes: 10,
    aiActionsPerMonth: 3,
    canCreateNotes: false
  },
  pro: {
    recordingTimeMinutes: 1200, // 20 hours
    aiActionsPerMonth: 50,
    canCreateNotes: true
  }
};

export const SUBSCRIPTION_PRICES = {
  pro: {
    amount: 9.99,
    currency: 'USD',
    interval: 'month'
  }
};

export class SubscriptionService {
  private static instance: SubscriptionService;
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  private constructor() {
    this.apiKey = process.env.DODO_PAYMENTS_API_KEY || '';
    this.webhookSecret = process.env.DODO_WEBHOOK_SECRET || '';
    
    if (!this.apiKey || !this.webhookSecret) {
      throw new Error('Missing required environment variables for Dodo Payments');
    }
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public async createSubscription(userId: string): Promise<any> {
    try {
      // TODO: Implement Dodo Payments subscription creation
      const subscription = {
        // Will be implemented with Dodo SDK
      };
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  public async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      // TODO: Implement Dodo Payments subscription cancellation
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  public async getSubscriptionStatus(userId: string): Promise<SubscriptionTier> {
    try {
      // TODO: Implement subscription status check
      return 'free';
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return 'free';
    }
  }

  public verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      verifyWebhookSignature({
        payload,
        signature,
        secret: this.webhookSecret
      });
      return true;
    } catch {
      return false;
    }
  }

  public getUserLimits(tier: SubscriptionTier): SubscriptionLimits {
    return SUBSCRIPTION_LIMITS[tier];
  }
}

export default SubscriptionService;