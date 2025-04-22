import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

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
  const [user] = useAuthState(getAuth());

  useEffect(() => {
    setLoading(true);
    const db = getFirestore();

    if (!user) {
      setSubscriptionData(null);
      setLoading(false);
      return;
    }

    console.log('Setting up subscription listener for user:', user.uid);

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
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

    return () => {
      console.log('Cleaning up subscription listener');
      unsubscribe();
    };
  }, [user]); // Depend on user instead of checking auth.currentUser directly

  const isSubscriptionActive = subscriptionData?.status === 'active';

  return {
    subscriptionData,
    loading,
    error,
    isSubscriptionActive
  };
}