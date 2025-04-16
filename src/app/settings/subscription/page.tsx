'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { useRouter, useSearchParams } from 'next/navigation';
import PricingCard from '@/components/subscription/PricingCard';
import UsageDisplay from '@/components/subscription/UsageDisplay';
import CancellationModal from '@/components/subscription/CancellationModal';
import { SubscriptionTier } from '@/lib/subscription-config';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useToast } from '@/components/ui/toast';
import { useSubscriptionRequest } from '@/hooks/useApiRequest';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth(); // Use the auth hook
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const userId = user?.uid; // Get user ID from auth context

  // Use our custom hook for subscription status
  const {
    data: subscriptionData,
    error: subscriptionError,
    loading: subscriptionLoading,
    execute: fetchSubscriptionStatus
  } = useSubscriptionRequest(async () => {
    if (!userId) throw new Error("User not authenticated"); // Guard clause
    const response = await fetch(`/api/subscription/upgrade?userId=${userId}`); // Use dynamic userId
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  });

  // Use custom hook for upgrade request
  const {
    loading: upgradeLoading,
    execute: executeUpgrade
  } = useSubscriptionRequest(
    async () => {
      if (!userId) throw new Error("User not authenticated"); // Guard clause
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }) // Use dynamic userId
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          showToast('Failed to get checkout URL', 'error');
        }
      },
      onError: (error) => {
        showToast(error.message || 'Failed to process payment', 'error');
      }
    }
  );

  useEffect(() => {
    // Fetch only when user ID is available
    if (userId) {
      fetchSubscriptionStatus().catch(error => {
        console.error('Failed to fetch subscription status:', error);
      });
    }
  }, [userId]); // Add userId as dependency

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
      // Fetch only when user ID is available
      if (userId) {
        fetchSubscriptionStatus().catch(error => {
          console.error('Failed to refresh subscription status:', error);
        });
      }
    }
  }, [searchParams]);

  const handleSubscriptionCancelled = () => {
    fetchSubscriptionStatus().catch(error => {
      console.error('Failed to refresh subscription status:', error);
    });
    setShowCancellationModal(false);
  };

  // Handle auth loading state
  if (authLoading) {
    return <div className="min-h-screen p-4 flex items-center justify-center">Loading authentication...</div>;
  }

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

  const handleUpgrade = async () => {
    try {
      await executeUpgrade();
    } catch (error) {
      // Error is handled by the hook onError callback
      console.error('Upgrade failed:', error);
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
                userId={userId || ''} // Pass userId, handle potential null
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md">
                <p>Please wait...</p>
              </div>
            </div>
          )}

          {/* Cancellation Modal */}
          <CancellationModal
            isOpen={showCancellationModal}
            onClose={() => setShowCancellationModal(false)}
            userId={userId || ''} // Pass userId, handle potential null
            onCancelled={handleSubscriptionCancelled}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}