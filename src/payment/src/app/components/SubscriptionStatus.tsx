'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { getAuth } from 'firebase/auth';

export function SubscriptionStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscriptionData } = useSubscription();
  const auth = getAuth();

  const handleUpdatePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get management URL');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access billing portal');
      console.error('Payment update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscriptionData) {
    return null;
  }

  const showUpdatePayment = subscriptionData.status === 'on_hold' || subscriptionData.status === 'pending';

  if (!showUpdatePayment) {
    return null;
  }

  return (
    <div className="mt-4">
      {subscriptionData.status === 'pending' ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Your payment is being processed. We'll retry automatically.
          </p>
          <button
            onClick={handleUpdatePayment}
            disabled={isLoading}
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
          >
            {isLoading ? 'Loading...' : 'Update Payment Method'}
          </button>
        </div>
      ) : subscriptionData.status === 'on_hold' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            Your subscription is on hold due to a payment issue.
            Please update your payment method to restore access.
          </p>
          <button
            onClick={handleUpdatePayment}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Update Payment Method'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}