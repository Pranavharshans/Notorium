"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Check, X } from "lucide-react";

const pricingTiers = [
  {
    name: "Trial",
    price: "Free",
    description: "Try out our core features",
    features: [
      { text: "10 minutes of recording time", included: true },
      { text: "3 enhance note operations", included: true },
      { text: "Basic editing features", included: true },
      { text: "Community support", included: true },
      { text: "Priority processing", included: false },
      { text: "Advanced AI features", included: false },
      { text: "Offline access", included: false },
      { text: "Custom export formats", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Unlock your full learning potential",
    saveAmount: "Save 33% with annual billing",
    features: [
      { text: "20 hours of recording time", included: true },
      { text: "50 enhance note operations", included: true },
      { text: "Advanced editing features", included: true },
      { text: "Priority email support", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Advanced AI summarization", included: true },
      { text: "Offline mode access", included: true },
      { text: "Export to any format", included: true },
    ],
    highlighted: true,
  }
];

const Feature = ({ included, text }: { included: boolean; text: string }) => (
  <li className="flex items-center gap-3">
    {included ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-gray-400" />
    )}
    <span className={included ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
      {text}
    </span>
  </li>
);

const PricingTier = ({
  name,
  price,
  description,
  features,
  highlighted = false,
  onSelect,
  saveAmount = "",
  isLoading = false,
  isCurrentPlan = false,
}: {
  name: string;
  price: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  highlighted?: boolean;
  onSelect: () => void;
  saveAmount?: string;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}) => (
  <div
    className={`relative rounded-2xl ${
      highlighted
        ? "border-2 border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/50"
        : "border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    } p-8 shadow-lg transition-all hover:scale-105`}
  >
    {highlighted && (
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-sm font-bold text-white shadow-lg">
        Most Popular
      </span>
    )}
    <div className="mb-4">
      <h3 className={`text-xl font-bold ${highlighted ? "text-blue-600 dark:text-blue-400" : ""}`}>
        {name}
      </h3>
      <div className="mt-2 text-gray-600 dark:text-gray-400">{description}</div>
    </div>
    <div className="mb-6">
      <div className="flex items-baseline">
        <span className="text-5xl font-bold">{price}</span>
        {price !== "Free" && <span className="text-gray-600 dark:text-gray-400">/month</span>}
      </div>
      {saveAmount && (
        <div className="mt-1 text-sm text-green-600 dark:text-green-400">
          {saveAmount}
        </div>
      )}
    </div>
    <ul className="mb-8 space-y-4">
      {features.map((feature, index) => (
        <Feature key={index} included={feature.included} text={feature.text} />
      ))}
    </ul>
    <ShimmerButton
      onClick={onSelect}
      disabled={isLoading || isCurrentPlan}
      className={`w-full ${
        highlighted
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
          : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
      } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? "Processing..." :
       isCurrentPlan ? "Current Plan" :
       price === "Free" ? "Start Trial" : "Upgrade Now"}
    </ShimmerButton>
  </div>
);

const SubscriptionStatus = () => {
  const { subscriptionData, user } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!subscriptionData) return null;

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the user's ID token
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      console.log('Subscription cancelled successfully:', data);
      
    } catch (error) {
      console.error('Cancel error:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/50">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Subscription Status: {subscriptionData.status}
            </p>
            {subscriptionData.next_billing_date && (
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Next billing: {new Date(subscriptionData.next_billing_date).toLocaleDateString()}
              </p>
            )}
          </div>
          {subscriptionData.status === 'active' && (
            <ShimmerButton
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-sm"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
            </ShimmerButton>
          )}
        </div>
        {error && (
          <div className="p-3 rounded bg-red-100 dark:bg-red-900/50">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { subscriptionData } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = async (plan: string) => {
    if (!user) {
      router.push("/");
      return;
    }

    if (plan === "Pro") {
      setIsLoading(true);
      try {
        router.push(`/billing-details?productId=${process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID}`);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <SubscriptionStatus />
      <header className="py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Choose Your Learning Path
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Unlock your full potential with our Pro features. Switch plans anytime as your needs evolve.
        </p>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:grid-cols-2 lg:px-8">
        {pricingTiers.map((tier) => (
          <PricingTier
            key={tier.name}
            name={tier.name}
            price={tier.price}
            description={tier.description}
            features={tier.features}
            highlighted={tier.highlighted}
            saveAmount={tier.saveAmount}
            isLoading={isLoading}
            isCurrentPlan={
              subscriptionData?.status === 'active' && tier.name === "Pro"
            }
            onSelect={() => handlePlanSelect(tier.name)}
          />
        ))}
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Can I switch plans later?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What happens when I reach my limit?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You&apos;ll receive a notification when you&apos;re close to your limits. Upgrade anytime to continue using the features without interruption.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Is there a refund policy?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Yes, we offer a 30-day money-back guarantee if you&apos;re not satisfied with your Pro subscription.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What if I need help?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Our support team is available to help with any questions you&apos;ve got. Contact us anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}