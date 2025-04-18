'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PricingCard from '@/components/subscription/PricingCard';
import UsageDisplay from '@/components/subscription/UsageDisplay';
import CancellationModal from '@/components/subscription/CancellationModal';
import { SubscriptionTier } from '@/lib/subscription-config';
import { BillingInfo } from '@/lib/dodo-service';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useToast } from '@/components/ui/toast';
import { useSubscriptionRequest } from '@/hooks/useApiRequest';

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Mock user ID - should come from auth context
  const userId = 'mock-user-id';

  // Use our custom hook for subscription status
  const {
    data: subscriptionData,
    error: subscriptionError,
    loading: subscriptionLoading,
    execute: fetchSubscriptionStatus
  } = useSubscriptionRequest(async () => {
    const response = await fetch(`/api/subscription/upgrade?userId=${userId}`);
    if (!response.ok) throw await response.json();
    return response.json();
  });

  // Use custom hook for upgrade request
  const {
    loading: upgradeLoading,
    execute: executeUpgrade
  } = useSubscriptionRequest(
    async (billingInfo: BillingInfo) => {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          billing: billingInfo,
          customer: {} // Optional customer info
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upgrade subscription');
      }
      const data = await response.json();
      return { checkoutUrl: data.checkoutUrl };
    },
    {
      onSuccess: (data) => {
        window.location.href = data.checkoutUrl;
      },
      onError: (error) => {
        showToast(error.message, 'error');
      }
    }
  );

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    if (subscriptionData) {
      setCurrentTier(subscriptionData.tier);
    }
  }, [subscriptionData]);

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    if (sessionId) {
      showToast('Subscription updated successfully!', 'success');
      setCurrentTier('pro');
    }
  }, [searchParams, showToast]);

  const handleSubscriptionCancelled = () => {
    fetchSubscriptionStatus(); // Refresh subscription status
    setShowCancellationModal(false);
  };

  if (subscriptionError) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Subscription</h2>
            <p className="text-red-600">{subscriptionError.message}</p>
            <button
              onClick={() => fetchSubscriptionStatus()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
const handleUpgrade = async (billingInfo: BillingInfo) => {
  try {
    return await executeUpgrade(billingInfo);
  } catch (error) {
    // Error is handled by the hook
    throw error;
  }
};

  const handleLimitReached = () => {
    showToast('Usage limit reached. Please upgrade to continue.', 'info');
    const pricingSection = document.getElementById('pricing-section');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-4 space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Subscription & Usage</h1>
          
          {/* Current Usage Section */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
            <ErrorBoundary>
              <UsageDisplay
                userId={userId}
                currentTier={currentTier}
                onLimitReached={handleLimitReached}
              />
            </ErrorBoundary>
          </section>

          {/* Pricing Plans Section */}
          <section id="pricing-section">
            <h2 className="text-xl font-semibold mb-4">Pricing Plans</h2>
            <ErrorBoundary>
              <PricingCard
                currentTier={currentTier}
                onUpgrade={handleUpgrade}
              />
            </ErrorBoundary>
          </section>

          {/* Additional Information */}
          <section className="mt-12">
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold mb-2">About Your Subscription</h3>
              <p>
                {currentTier === 'free'
                  ? "You're currently on the Free plan. Upgrade to Pro for additional features and higher usage limits."
                  : "You're on the Pro plan. Thank you for your support!"}
              </p>
              {currentTier === 'pro' && (
                <>
                  <p className="mt-2">
                    Your subscription renews automatically each month. You can cancel anytime.
                  </p>
                  <button
                    onClick={() => setShowCancellationModal(true)}
                    className="mt-4 text-red-600 hover:text-red-700 underline"
                  >
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </section>
          {/* Loading State */}
          {(subscriptionLoading || upgradeLoading) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-lg">
                    {upgradeLoading ? 'Processing payment...' : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Modal */}
          <CancellationModal
            isOpen={showCancellationModal}
            onClose={() => setShowCancellationModal(false)}
            userId={userId}
            onCancelled={handleSubscriptionCancelled}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}