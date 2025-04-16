import { db } from './firebase';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import SubscriptionDBService from './subscription-db-service';
import { SUBSCRIPTION_TIERS, SubscriptionTier as DBSubscriptionTier } from './subscription-config';

// For backward compatibility
type QuotaTier = 'trial' | 'paid';

interface QuotaLimits {
  recordingMinutes: number;
  enhanceNotes: number;
}

interface UserQuota {
  recordingMinutesUsed: number;
  enhanceNotesUsed: number;
  subscriptionStatus: QuotaTier;
  subscriptionStartDate: Date;
}

// Convert DB subscription tier to quota tier
function mapSubscriptionToQuotaTier(dbTier: DBSubscriptionTier): QuotaTier {
  return dbTier === 'pro' ? 'paid' : 'trial';
}

// Get quota limits from subscription config
function getQuotaLimits(tier: DBSubscriptionTier): QuotaLimits {
  const config = SUBSCRIPTION_TIERS[tier];
  return {
    recordingMinutes: config.limits.recordingTimeMinutes,
    enhanceNotes: config.limits.aiActionsPerMonth,
  };
}

export class QuotaService {
  private static instance: QuotaService;
  private quotaCache: Map<string, UserQuota> = new Map();

  private constructor() {}

  static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }

  private async initializeQuota(userId: string, subscriptionTier: DBSubscriptionTier): Promise<UserQuota> {
    const initialQuota: UserQuota = {
      recordingMinutesUsed: 0,
      enhanceNotesUsed: 0,
      subscriptionStatus: mapSubscriptionToQuotaTier(subscriptionTier),
      subscriptionStartDate: new Date(),
    };

    const quotaRef = doc(collection(db, 'quotas'), userId);
    await setDoc(quotaRef, {
      ...initialQuota,
      subscriptionStartDate: initialQuota.subscriptionStartDate.toISOString(),
    });
    
    this.quotaCache.set(userId, initialQuota);
    return initialQuota;
  }

  async getUserQuota(userId: string): Promise<UserQuota> {
    // Check cache first
    if (this.quotaCache.has(userId)) {
      return this.quotaCache.get(userId)!;
    }

    // Get user's subscription status
    const subscriptionService = SubscriptionDBService.getInstance();
    const subscription = await subscriptionService.getSubscription(userId);
    
    // Get quota usage
    const quotaRef = doc(collection(db, 'quotas'), userId);
    const quotaDoc = await getDoc(quotaRef);
    
    if (!quotaDoc.exists()) {
      // If quota doesn't exist, initialize it with current subscription
      return this.initializeQuota(userId, subscription.tier);
    }

    const data = quotaDoc.data();
    const quota: UserQuota = {
      ...data,
      subscriptionStatus: mapSubscriptionToQuotaTier(subscription.tier),
      subscriptionStartDate: typeof data.subscriptionStartDate === 'string' ? new Date(data.subscriptionStartDate) : new Date(0),
    } as UserQuota;
    
    this.quotaCache.set(userId, quota);
    return quota;
  }

  async checkRecordingQuota(userId: string): Promise<{
    hasQuota: boolean;
    minutesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: DBSubscriptionTier;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = getQuotaLimits(quota.subscriptionStatus === 'paid' ? 'pro' : 'free').recordingMinutes;
    const remaining = limit - quota.recordingMinutesUsed;
    const percentageUsed = (quota.recordingMinutesUsed / limit) * 100;

    return {
      hasQuota: remaining > 0,
      minutesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus === 'paid' ? 'pro' : 'free',
    };
  }

  async checkEnhanceQuota(userId: string): Promise<{
    hasQuota: boolean;
    enhancesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: DBSubscriptionTier;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = getQuotaLimits(quota.subscriptionStatus === 'paid' ? 'pro' : 'free').enhanceNotes;
    const remaining = limit - quota.enhanceNotesUsed;
    const percentageUsed = (quota.enhanceNotesUsed / limit) * 100;

    return {
      hasQuota: remaining > 0,
      enhancesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus === 'paid' ? 'pro' : 'free',
    };
  }

  async incrementRecordingUsage(userId: string, minutes: number): Promise<void> {
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    await runTransaction(db, async (transaction) => {
      const subscriptionService = SubscriptionDBService.getInstance();
      const subscription = await subscriptionService.getSubscription(userId);
      const quotaDoc = await transaction.get(quotaRef);
      if (!quotaDoc.exists()) {
        await this.initializeQuota(userId, subscription.tier);
        return;
      }

      const quota = quotaDoc.data() as UserQuota;
      const newMinutes = quota.recordingMinutesUsed + minutes;
      
      transaction.update(quotaRef, {
        recordingMinutesUsed: newMinutes,
      });

      // Update cache
      this.quotaCache.set(userId, {
        ...quota,
        recordingMinutesUsed: newMinutes,
      });
    });
  }

  async incrementEnhanceUsage(userId: string): Promise<void> {
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    await runTransaction(db, async (transaction) => {
      const subscriptionService = SubscriptionDBService.getInstance();
      const subscription = await subscriptionService.getSubscription(userId);
      const quotaDoc = await transaction.get(quotaRef);
      if (!quotaDoc.exists()) {
        await this.initializeQuota(userId, subscription.tier);
        return;
      }

      const quota = quotaDoc.data() as UserQuota;
      const newEnhances = quota.enhanceNotesUsed + 1;
      
      transaction.update(quotaRef, {
        enhanceNotesUsed: newEnhances,
      });

      // Update cache
      this.quotaCache.set(userId, {
        ...quota,
        enhanceNotesUsed: newEnhances,
      });
    });
  }

  async upgradeSubscription(userId: string): Promise<void> {
    // Clear cache to force fresh data on next request
    this.quotaCache.delete(userId);

    // The actual subscription status is now managed by SubscriptionDBService
    // and this method should not be used directly.
    // Subscription updates should go through the webhook handler
    console.warn('QuotaService.upgradeSubscription is deprecated. Use webhook handler for subscription updates.');
  }

  getQuotaLimits(tier: QuotaTier): QuotaLimits {
    const dbTier: DBSubscriptionTier = tier === 'paid' ? 'pro' : 'free';
    return getQuotaLimits(dbTier);
  }
}

export const quotaService = QuotaService.getInstance();