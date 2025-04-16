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

export type SubscriptionTier = 'trial' | 'paid';

interface QuotaLimits {
  recordingMinutes: number;
  enhanceNotes: number;
}

interface UserQuota {
  recordingMinutesUsed: number;
  enhanceNotesUsed: number;
  subscriptionStatus: SubscriptionTier;
  subscriptionStartDate: Date;
}

const QUOTA_LIMITS: Record<SubscriptionTier, QuotaLimits> = {
  trial: {
    recordingMinutes: 10,
    enhanceNotes: 3,
  },
  paid: {
    recordingMinutes: 1200, // 20 hours
    enhanceNotes: 50,
  },
};

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

  private async initializeQuota(userId: string): Promise<UserQuota> {
    const initialQuota: UserQuota = {
      recordingMinutesUsed: 0,
      enhanceNotesUsed: 0,
      subscriptionStatus: 'trial',
      subscriptionStartDate: new Date(),
    };

    const quotaRef = doc(collection(db, 'quotas'), userId);
    const dataToWrite = {
      ...initialQuota,
      subscriptionStartDate: initialQuota.subscriptionStartDate.toISOString(),
    };
    console.log("Initializing quota with data:", dataToWrite);
    await setDoc(quotaRef, dataToWrite);
    
    this.quotaCache.set(userId, initialQuota);
    return initialQuota;
  }

  async getUserQuota(userId: string): Promise<UserQuota> {
    // Check cache first
    if (this.quotaCache.has(userId)) {
      return this.quotaCache.get(userId)!;
    }

    const quotaRef = doc(collection(db, 'quotas'), userId);
    const quotaDoc = await getDoc(quotaRef);
    
    if (!quotaDoc.exists()) {
      // If quota doesn't exist, initialize it
      return this.initializeQuota(userId);
    }

    const data = quotaDoc.data();
    const quota: UserQuota = {
      ...data,
      subscriptionStartDate: new Date(data.subscriptionStartDate),
    } as UserQuota;
    
    this.quotaCache.set(userId, quota);
    return quota;
  }

  async checkRecordingQuota(userId: string): Promise<{
    hasQuota: boolean;
    minutesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: SubscriptionTier;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].recordingMinutes;
    const remaining = limit - quota.recordingMinutesUsed;
    const percentageUsed = (quota.recordingMinutesUsed / limit) * 100;

    return {
      hasQuota: remaining > 0,
      minutesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
    };
  }

  async checkEnhanceQuota(userId: string): Promise<{
    hasQuota: boolean;
    enhancesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: SubscriptionTier;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].enhanceNotes;
    const remaining = limit - quota.enhanceNotesUsed;
    const percentageUsed = (quota.enhanceNotesUsed / limit) * 100;

    return {
      hasQuota: remaining > 0,
      enhancesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
    };
  }

  async incrementRecordingUsage(userId: string, minutes: number): Promise<void> {
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    await runTransaction(db, async (transaction) => {
      const quotaDoc = await transaction.get(quotaRef);
      if (!quotaDoc.exists()) {
        await this.initializeQuota(userId);
        return;
      }

      const quota = quotaDoc.data() as UserQuota;
      const newMinutes = quota.recordingMinutesUsed + minutes;
      console.log("Updating recording usage:", {
        userId,
        currentMinutesUsed: quota.recordingMinutesUsed,
        incrementBy: minutes,
        newMinutes
      });
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
      const quotaDoc = await transaction.get(quotaRef);
      if (!quotaDoc.exists()) {
        await this.initializeQuota(userId);
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
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    await updateDoc(quotaRef, {
      subscriptionStatus: 'paid' as SubscriptionTier,
      subscriptionStartDate: new Date().toISOString(),
    });

    // Update cache
    const quota = this.quotaCache.get(userId);
    if (quota) {
      this.quotaCache.set(userId, {
        ...quota,
        subscriptionStatus: 'paid',
        subscriptionStartDate: new Date(),
      });
    }
  }

  getQuotaLimits(tier: SubscriptionTier): QuotaLimits {
    return QUOTA_LIMITS[tier];
  }
}

export const quotaService = QuotaService.getInstance();