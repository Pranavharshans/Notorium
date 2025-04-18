import { db } from './firebase';
import { 
  doc, 
  collection, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  Timestamp,
  increment,
  query,
  orderBy,
  limit 
} from 'firebase/firestore';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from './subscription-config';

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  type: 'subscription' | 'one_time';
  createdAt: Date;
  metadata?: Record<string, string | number | boolean | null>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'failed';
  createdAt: Date;
  paymentMethod?: string;
  errorMessage?: string;
}

interface UserSubscription {
  tier: SubscriptionTier;
  subscriptionId: string | null;
  startDate: Date;
  endDate: Date | null;
  status: 'pending' | 'active' | 'on_hold' | 'paused' | 'cancelled' | 'failed' | 'expired';
  metadata?: Record<string, string | number | boolean | null>;
}

interface UserUsage {
  recordingTimeUsed: number;
  aiActionsUsed: number;
  lastResetDate: Date;
}

export class SubscriptionDBService {
  private static instance: SubscriptionDBService;
  
  private constructor() {}

  public static getInstance(): SubscriptionDBService {
    if (!SubscriptionDBService.instance) {
      SubscriptionDBService.instance = new SubscriptionDBService();
    }
    return SubscriptionDBService.instance;
  }

  /**
   * Create or update user subscription
   */
  public async updateSubscription(userId: string, subscription: Partial<UserSubscription>): Promise<void> {
    const docRef = doc(db, 'subscriptions', userId);
    const now = new Date();

    try {
      const existingDoc = await getDoc(docRef);
      if (!existingDoc.exists()) {
        // Create new subscription record
        await setDoc(docRef, {
          tier: 'free',
          subscriptionId: null,
          startDate: now,
          endDate: null,
          status: 'active',
          createdAt: now,
          updatedAt: now,
          ...subscription
        });
      } else {
        // Update existing subscription
        await updateDoc(docRef, {
          ...subscription,
          updatedAt: now
        });
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Get user's subscription details
   */
  public async getSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Return default free tier if no subscription exists
        return {
          tier: 'free',
          subscriptionId: null,
          startDate: new Date(),
          endDate: null,
          status: 'active'
        };
      }

      return docSnap.data() as UserSubscription;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  /**
   * Initialize or reset usage tracking
   */
  public async initializeUsage(userId: string): Promise<void> {
    const docRef = doc(db, 'usage', userId);
    const now = new Date();

    try {
      await setDoc(docRef, {
        recordingTimeUsed: 0,
        aiActionsUsed: 0,
        lastResetDate: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Failed to initialize usage:', error);
      throw new Error('Failed to initialize usage');
    }
  }

  /**
   * Get user's current usage
   */
  public async getUsage(userId: string): Promise<UserUsage> {
    try {
      const docRef = doc(db, 'usage', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await this.initializeUsage(userId);
        return {
          recordingTimeUsed: 0,
          aiActionsUsed: 0,
          lastResetDate: new Date()
        };
      }

      return docSnap.data() as UserUsage;
    } catch (error) {
      console.error('Failed to get usage:', error);
      throw new Error('Failed to get usage');
    }
  }

  /**
   * Update recording time usage
   */
  public async incrementRecordingTime(userId: string, minutes: number): Promise<void> {
    try {
      const docRef = doc(db, 'usage', userId);
      await updateDoc(docRef, {
        recordingTimeUsed: increment(minutes),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to update recording time:', error);
      throw new Error('Failed to update recording time');
    }
  }

  /**
   * Increment AI actions count
   */
  public async incrementAiActions(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'usage', userId);
      await updateDoc(docRef, {
        aiActionsUsed: increment(1),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to increment AI actions:', error);
      throw new Error('Failed to increment AI actions');
    }
  }

  /**
   * Reset monthly usage counts
   */
  public async resetUsage(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'usage', userId);
      await updateDoc(docRef, {
        recordingTimeUsed: 0,
        aiActionsUsed: 0,
        lastResetDate: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to reset usage:', error);
      throw new Error('Failed to reset usage');
    }
  }

  /**
   * Record a new payment in history
   */
  public async addPaymentHistory(
    userId: string,
    payment: Omit<PaymentHistoryItem, 'createdAt'>
  ): Promise<void> {
    try {
      const docRef = doc(collection(db, 'payments', userId, 'history'), payment.id);
      await setDoc(docRef, {
        ...payment,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to record payment history:', error);
      throw new Error('Failed to record payment history');
    }
  }

  /**
   * Get user's payment history
   */
  public async getPaymentHistory(userId: string): Promise<PaymentHistoryItem[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'payments', userId, 'history'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      );

      return querySnapshot.docs.map(doc => doc.data() as PaymentHistoryItem);
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw new Error('Failed to get payment history');
    }
  }

  /**
   * Create a new payment intent
   */
  public async createPaymentIntent(
    userId: string,
    intent: Omit<PaymentIntent, 'createdAt'>
  ): Promise<void> {
    try {
      const docRef = doc(collection(db, 'payments', userId, 'intents'), intent.id);
      await setDoc(docRef, {
        ...intent,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Update payment intent status
   */
  public async updatePaymentIntentStatus(
    userId: string,
    intentId: string,
    status: PaymentIntent['status'],
    errorMessage?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'payments', userId, 'intents', intentId);
      await updateDoc(docRef, {
        status,
        ...(errorMessage && { errorMessage }),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to update payment intent:', error);
      throw new Error('Failed to update payment intent');
    }
  }
}

export default SubscriptionDBService;