import { getFirebaseInstance } from './firebase';
// import { User } from 'firebase/auth'; // Commented out - @typescript-eslint/no-unused-vars
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
  Firestore,
} from 'firebase/firestore';

// Custom Error Classes for Quota Exhaustion
export class RecordingQuotaExhaustedError extends Error {
  constructor(message = "Recording quota exhausted") {
    super(message);
    this.name = "RecordingQuotaExhaustedError";
    // Add a property that can be used to identify this as a handled error
    // This is for debugging purposes but won't affect the browser UI
    Object.defineProperty(this, 'isExpectedError', { value: true });
  }
}

export class EnhanceQuotaExhaustedError extends Error {
  constructor(message = "Enhance notes quota exhausted") {
    super(message);
    this.name = "EnhanceQuotaExhaustedError";
  }
}

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

export const QUOTA_LIMITS: Record<SubscriptionTier, QuotaLimits> = {
  trial: {
    recordingMinutes: 20,
    enhanceNotes: 5,
  },
  paid: {
    recordingMinutes: 1200, // 20 hours
    enhanceNotes: 100,
  },
};

export class QuotaService {
  private static instance: QuotaService;
  private quotaCache: Map<string, UserQuota> = new Map();
  private db: Firestore | null = null;

  private constructor() {
    // Initialize Firestore
    if (typeof window !== 'undefined') {
      getFirebaseInstance().then(({ db }) => {
        this.db = db;
      }).catch(console.error);
    }
  }

  static getInstance(): QuotaService {
    if (!QuotaService.instance) {
      QuotaService.instance = new QuotaService();
    }
    return QuotaService.instance;
  }

  private async getDB(): Promise<Firestore> {
    if (!this.db) {
      const { db } = await getFirebaseInstance();
      this.db = db;
    }
    return this.db;
  }

  private async initializeQuota(userId: string): Promise<UserQuota> {
    const db = await this.getDB();

    // Check subscription status from users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    const subscriptionStatus: SubscriptionTier =
      userDoc.exists() && userDoc.data()?.status === 'active' ? 'paid' : 'trial';

    const initialQuota: UserQuota = {
      recordingMinutesUsed: 0,
      enhanceNotesUsed: 0,
      subscriptionStatus,
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
    if (this.quotaCache.has(userId)) {
      return this.quotaCache.get(userId)!;
    }

    const db = await this.getDB();
    const quotaRef = doc(collection(db, 'quotas'), userId);
    const quotaDoc = await getDoc(quotaRef);
    
    if (!quotaDoc.exists()) {
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
    minutesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: SubscriptionTier;
    isExhausted?: boolean;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].recordingMinutes;
    const remaining = limit - quota.recordingMinutesUsed;

    if (remaining <= 0) {
      // Return with isExhausted flag instead of throwing error
      return {
        minutesRemaining: 0,
        percentageUsed: 100,
        subscriptionStatus: quota.subscriptionStatus,
        isExhausted: true
      };
      // throw new RecordingQuotaExhaustedError();
    }

    const percentageUsed = (quota.recordingMinutesUsed / limit) * 100;

    return {
      minutesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
      isExhausted: false
    };
  }

  async checkEnhanceQuota(userId: string): Promise<{
    enhancesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: SubscriptionTier;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].enhanceNotes;
    const remaining = limit - quota.enhanceNotesUsed;

    if (remaining <= 0) {
      throw new EnhanceQuotaExhaustedError();
    }

    const percentageUsed = (quota.enhanceNotesUsed / limit) * 100;

    return {
      enhancesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
    };
  }

  async incrementRecordingUsage(userId: string, minutes: number): Promise<void> {
    const db = await this.getDB();
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    const quotaDoc = await getDoc(quotaRef);
    if (!quotaDoc.exists()) {
      await this.initializeQuota(userId);
      return;
    }

    const quotaData = quotaDoc.data();
    console.log("Current quota data:", quotaData);

    await updateDoc(quotaRef, {
      recordingMinutesUsed: increment(minutes)
    });

    // Update cache with incremented value
    const updatedMinutes = quotaData.recordingMinutesUsed + minutes;
    this.quotaCache.set(userId, {
      recordingMinutesUsed: updatedMinutes,
      enhanceNotesUsed: quotaData.enhanceNotesUsed,
      subscriptionStatus: quotaData.subscriptionStatus,
      subscriptionStartDate: new Date(quotaData.subscriptionStartDate)
    });
  }

  async incrementEnhanceUsage(userId: string): Promise<void> {
    const db = await this.getDB();
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
    const db = await this.getDB();
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

  async silentCheckRecordingQuota(userId: string): Promise<{
    hasQuota: boolean;
    minutesRemaining: number;
    percentageUsed: number;
    subscriptionStatus: SubscriptionTier;
    isExhausted?: boolean;
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].recordingMinutes;
    const remaining = limit - quota.recordingMinutesUsed;
    const percentageUsed = (quota.recordingMinutesUsed / limit) * 100;

    return {
      hasQuota: remaining > 0,
      minutesRemaining: Math.max(0, remaining),
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
      isExhausted: remaining <= 0
    };
  }

  async syncQuotaWithSubscription(userId: string): Promise<void> {
    const db = await this.getDB();
    
    // Get user's subscription status
    const userDoc = await getDoc(doc(db, 'users', userId));
    const isActiveSubscription = userDoc.exists() && userDoc.data()?.status === 'active';
    
    // Get current quota
    const quotaRef = doc(collection(db, 'quotas'), userId);
    const quotaDoc = await getDoc(quotaRef);
    
    if (quotaDoc.exists()) {
      const quota = quotaDoc.data();
      const newStatus: SubscriptionTier = isActiveSubscription ? 'paid' : 'trial';
      
      // Only update if status needs to change
      if (quota.subscriptionStatus !== newStatus) {
        await updateDoc(quotaRef, {
          subscriptionStatus: newStatus,
          subscriptionStartDate: new Date().toISOString(),
        });
        
        // Update cache
        if (this.quotaCache.has(userId)) {
          const cachedQuota = this.quotaCache.get(userId)!;
          this.quotaCache.set(userId, {
            ...cachedQuota,
            subscriptionStatus: newStatus,
            subscriptionStartDate: new Date(),
          });
        }
      }
    } else {
      // If no quota exists, initialize one
      await this.initializeQuota(userId);
    }
  }

  /**
   * Resets usage counters when a subscription is renewed
   * This ensures users get fresh quotas with each billing cycle
   */
  async resetQuotaUsage(userId: string): Promise<void> {
    console.log(`Resetting usage quotas for user: ${userId}`);
    
    const db = await this.getDB();
    const quotaRef = doc(collection(db, 'quotas'), userId);
    
    // Get current quota to preserve subscription status
    const quotaDoc = await getDoc(quotaRef);
    if (!quotaDoc.exists()) {
      // If no quota exists, initialize one instead
      await this.initializeQuota(userId);
      return;
    }
    
    const currentData = quotaDoc.data();
    
    // Reset the usage counters to zero
    await updateDoc(quotaRef, {
      recordingMinutesUsed: 0,
      enhanceNotesUsed: 0,
      // Also update subscription start date to current date for tracking purposes
      subscriptionStartDate: new Date().toISOString(),
    });
    
    // Update cache if it exists
    if (this.quotaCache.has(userId)) {
      const cachedQuota = this.quotaCache.get(userId)!;
      this.quotaCache.set(userId, {
        ...cachedQuota,
        recordingMinutesUsed: 0,
        enhanceNotesUsed: 0,
        subscriptionStartDate: new Date(),
      });
    }
    
    console.log(`Successfully reset usage quotas for user: ${userId}`);
  }
}

export const quotaService = QuotaService.getInstance();