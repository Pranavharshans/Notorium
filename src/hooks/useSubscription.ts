import { useState, useEffect } from 'react';
// import { getFirestore, doc, onSnapshot, Firestore } from 'firebase/firestore'; // Commented out getFirestore - @typescript-eslint/no-unused-vars
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import { Auth, User } from 'firebase/auth';
// import { getFirebaseInstance, type FirebaseInstances } from '@/lib/firebase'; // Commented out FirebaseInstances - @typescript-eslint/no-unused-vars
import { getFirebaseInstance } from '@/lib/firebase';

interface SubscriptionData {
  customer_id: string;
  subscription_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'on_hold';
  next_billing_date?: string;
}

interface FirebaseState {
  auth: Auth | null;
  db: Firestore | null;
  initialized: boolean;
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [firebase, setFirebase] = useState<FirebaseState>({
    auth: null,
    db: null,
    initialized: false
  });

  // Initialize Firebase first
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const instances = await getFirebaseInstance();
        setFirebase({
          auth: instances.auth,
          db: instances.db,
          initialized: true
        });
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  // Set up auth state listener after Firebase is initialized
  useEffect(() => {
    if (!firebase.initialized || !firebase.auth) return;

    const authUnsubscribe = firebase.auth.onAuthStateChanged((currentUser: User | null) => {
      setUser(currentUser);
    });

    return () => authUnsubscribe();
  }, [firebase.initialized, firebase.auth]);

  // Handle subscription data after user is authenticated and Firebase is initialized
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      if (!user || !firebase.db || !firebase.initialized) {
        setSubscriptionData(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Setting up subscription listener for user:', user.uid);

        const userDocRef = doc(firebase.db, 'users', user.uid);
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
  }, [user, firebase.db, firebase.initialized]);

  const isSubscriptionActive = subscriptionData?.status === 'active';

  return {
    subscriptionData,
    loading,
    error,
    isSubscriptionActive,
    user
  };
}