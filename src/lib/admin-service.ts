import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  doc, 
  getDoc, 
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { SubscriptionTier } from './subscription-config';

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  subscription: {
    tier: SubscriptionTier;
    status: 'active' | 'cancelled' | 'expired';
    subscriptionId: string | null;
    endDate: Date | null;
  };
  usage: {
    recordingTimeUsed: number;
    aiActionsUsed: number;
    lastResetDate: Date;
  };
}

interface FirestoreSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  subscriptionId: string | null;
  endDate: Timestamp;
}

interface FirestoreUsage {
  recordingTimeUsed: number;
  aiActionsUsed: number;
  lastResetDate: Timestamp;
}

export interface UserListFilters {
  tier?: SubscriptionTier;
  status?: string;
  searchQuery?: string;
}

export class AdminService {
  private static instance: AdminService;

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Get list of all users with their subscription and usage data
   */
  async getUsers(filters?: UserListFilters): Promise<UserData[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(query(usersRef));
      
      let users: UserData[] = [];

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        
        // Get subscription data
        const subscriptionDocRef = doc(db, 'subscriptions', userDoc.id);
        const subscriptionSnapshot = await getDoc(subscriptionDocRef);
        const subscriptionData = subscriptionSnapshot.data() as FirestoreSubscription | undefined;

        // Get usage data
        const usageDocRef = doc(db, 'usage', userDoc.id);
        const usageSnapshot = await getDoc(usageDocRef);
        const usageData = usageSnapshot.data() as FirestoreUsage | undefined;

        const user: UserData = {
          id: userDoc.id,
          email: userData.email,
          name: userData.name || 'Unknown',
          createdAt: userData.createdAt?.toDate() || new Date(),
          subscription: {
            tier: subscriptionData?.tier || 'free',
            status: subscriptionData?.status || 'active',
            subscriptionId: subscriptionData?.subscriptionId || null,
            endDate: subscriptionData?.endDate?.toDate() || null
          },
          usage: {
            recordingTimeUsed: usageData?.recordingTimeUsed || 0,
            aiActionsUsed: usageData?.aiActionsUsed || 0,
            lastResetDate: usageData?.lastResetDate?.toDate() || new Date()
          }
        };

        // Apply filters
        if (filters) {
          if (filters.tier && user.subscription.tier !== filters.tier) {
            continue;
          }
          if (filters.status && user.subscription.status !== filters.status) {
            continue;
          }
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (!user.email.toLowerCase().includes(query) &&
                !user.name.toLowerCase().includes(query)) {
              continue;
            }
          }
        }

        users.push(user);
      }

      // Sort by creation date (newest first)
      users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return users;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Get detailed data for a single user
   */
  async getUserDetails(userId: string): Promise<UserData | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        return null;
      }

      const userData = userSnapshot.data();
      
      const subscriptionDocRef = doc(db, 'subscriptions', userId);
      const subscriptionSnapshot = await getDoc(subscriptionDocRef);
      const subscriptionData = subscriptionSnapshot.data() as FirestoreSubscription | undefined;

      const usageDocRef = doc(db, 'usage', userId);
      const usageSnapshot = await getDoc(usageDocRef);
      const usageData = usageSnapshot.data() as FirestoreUsage | undefined;

      return {
        id: userSnapshot.id,
        email: userData.email,
        name: userData.name || 'Unknown',
        createdAt: userData.createdAt?.toDate() || new Date(),
        subscription: {
          tier: subscriptionData?.tier || 'free',
          status: subscriptionData?.status || 'active',
          subscriptionId: subscriptionData?.subscriptionId || null,
          endDate: subscriptionData?.endDate?.toDate() || null
        },
        usage: {
          recordingTimeUsed: usageData?.recordingTimeUsed || 0,
          aiActionsUsed: usageData?.aiActionsUsed || 0,
          lastResetDate: usageData?.lastResetDate?.toDate() || new Date()
        }
      };
    } catch (error) {
      console.error('Failed to get user details:', error);
      throw error;
    }
  }

  /**
   * Get basic statistics about users and subscriptions
   */
  async getStats() {
    try {
      const users = await this.getUsers();
      
      return {
        totalUsers: users.length,
        proUsers: users.filter(u => u.subscription.tier === 'pro').length,
        activeSubscriptions: users.filter(
          u => u.subscription.tier === 'pro' && u.subscription.status === 'active'
        ).length,
        totalRecordingTimeUsed: users.reduce(
          (total, user) => total + user.usage.recordingTimeUsed, 
          0
        ),
        totalAiActionsUsed: users.reduce(
          (total, user) => total + user.usage.aiActionsUsed, 
          0
        )
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }
}

export default AdminService;