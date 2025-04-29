import { getFirebaseInstance } from './firebase';
import { User } from 'firebase/auth';
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
    const initialQuota: UserQuota = {
      recordingMinutesUsed: 0,
      enhanceNotesUsed: 0,
      subscriptionStatus: 'trial',
      subscriptionStartDate: new Date(),
    };

    const db = await this.getDB();
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
  }> {
    const quota = await this.getUserQuota(userId);
    const limit = QUOTA_LIMITS[quota.subscriptionStatus].recordingMinutes;
    const remaining = limit - quota.recordingMinutesUsed;

    if (remaining <= 0) {
      throw new RecordingQuotaExhaustedError();
    }

    const percentageUsed = (quota.recordingMinutesUsed / limit) * 100;

    return {
      minutesRemaining: remaining,
      percentageUsed,
      subscriptionStatus: quota.subscriptionStatus,
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
}

export const quotaService = QuotaService.getInstance();