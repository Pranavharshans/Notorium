import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirebaseInstance } from '@/lib/firebase';

interface SubscriptionData {
  customer_id: string;
  subscription_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'on_hold';
  next_billing_date?: string;
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize Firebase and set up auth state listener
  useEffect(() => {
    let authUnsubscribe: (() => void) | undefined;

    const initializeFirebase = async () => {
      try {
        const { auth } = await getFirebaseInstance();
        // Use the auth instance directly instead of useAuthState
        authUnsubscribe = auth.onAuthStateChanged((currentUser: User | null) => {
          setUser(currentUser);
        });
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setError(error as Error);
        setLoading(false);
      }
    };
    
    initializeFirebase();

    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  // Handle subscription data
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      if (!user) {
        setSubscriptionData(null);
        setLoading(false);
        return;
      }

      try {
        const { db } = await getFirebaseInstance();
        console.log('Setting up subscription listener for user:', user.uid);

        const userDocRef = doc(db, 'users', user.uid);
        unsubscribe = onSnapshot(
          userDocRef,
          (doc) => {
            console.log('Subscription data updated:', doc.data());
            if (doc.exists()) {
              setSubscriptionData(doc.data() as SubscriptionData);
            } else {
              setSubscriptionData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching subscription:', error);
            setError(error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up subscription:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up subscription listener');
        unsubscribe();
      }
    };
  }, [user]); // Depend on user to re-run when auth state changes

  const isSubscriptionActive = subscriptionData?.status === 'active';

  return {
    subscriptionData,
    loading,
    error,
    isSubscriptionActive,
    user
  };
}