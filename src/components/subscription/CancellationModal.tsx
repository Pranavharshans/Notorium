'use client';

import React from 'react';
import { useToast } from '@/components/ui/toast';
import { useSubscriptionRequest } from '@/hooks/useApiRequest';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCancelled: () => void;
}

export default function CancellationModal({
  isOpen,
  onClose,
  userId,
  onCancelled
}: CancellationModalProps) {
  const { showToast } = useToast();
  const [gracePeriodEnd, setGracePeriodEnd] = React.useState<Date | null>(null);

  const {
    loading,
    execute: cancelSubscription
  } = useSubscriptionRequest(
    async () => {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) throw await response.json();
      return response.json();
    },
    {
      onSuccess: (data) => {
        setGracePeriodEnd(new Date(data.gracePeriodEnd));
        showToast('Subscription cancelled successfully', 'success');
        onCancelled();
      },
      onError: (error) => {
        showToast(error.message, 'error');
      }
    }
  );

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          Cancel Pro Subscription
        </h2>

        <div className="space-y-4">
          {!gracePeriodEnd ? (
            <>
              <p className="text-gray-600">
                Are you sure you want to cancel your Pro subscription? You'll lose access to:
              </p>
              
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>20 hours of recording time</li>
                <li>50 AI actions per month</li>
                <li>Note creation capability</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                <p className="text-sm text-yellow-800">
                  Your subscription will remain active until the end of your current billing period.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => cancelSubscription()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  Your subscription has been cancelled successfully.
                </p>
                <p className="text-sm text-green-700 mt-2">
                  You'll have access to Pro features until {formatDate(gracePeriodEnd)}.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}