'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { getAuth } from 'firebase/auth';

export function CancelSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [endDate, setEndDate] = useState<string | null>(null);
  const { /* subscriptionData, */ isSubscriptionActive } = useSubscription();
  const auth = getAuth();

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setEndDate(data.end_date);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSubscriptionActive) {
    return null;
  }

  if (endDate) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Your subscription has been cancelled. You will have access until {new Date(endDate).toLocaleDateString()}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Cancel Subscription
        </button>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-4">
            Are you sure you want to cancel your subscription? You&apos;ll continue to have access until your current billing period ends.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300"
            >
              No, Keep Subscription
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}