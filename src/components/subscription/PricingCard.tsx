'use client';

import React from 'react';
import { useState } from 'react';
import { SUBSCRIPTION_TIERS, formatPrice, getFeaturesList, SubscriptionTier } from '@/lib/subscription-config';

interface BillingInfo {
  city: string;
  country: string;
  state: string;
  street: string;
  zipcode: string;
}

interface CustomerInfo {
  name?: string;
  email?: string;
  phone_number?: string;
}

interface PricingCardProps {
  currentTier: SubscriptionTier;
  customerInfo?: CustomerInfo;
  onUpgrade?: (billingInfo: BillingInfo) => Promise<{ checkoutUrl: string }>;
}

export default function PricingCard({ currentTier, customerInfo, onUpgrade }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    city: '',
    country: '',
    state: '',
    street: '',
    zipcode: ''
  });

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpgrade) return;

    setIsLoading(true);
    setError(null);

    try {
      const { checkoutUrl } = await onUpgrade(billingInfo);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8 p-4">
      {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => (
        <div
          key={tier}
          className={`
            rounded-lg border p-6 
            ${currentTier === tier ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
          `}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold">{config.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">{formatPrice(config.price)}</span>
              {config.price && <span className="text-gray-600">/month</span>}
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-4 mb-8">
            {getFeaturesList(tier as SubscriptionTier).map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
{/* Action Button or Billing Form */}
{tier === 'pro' && currentTier !== 'pro' && (
  <>
    {!showBillingForm ? (
      <button
        onClick={() => setShowBillingForm(true)}
        className="w-full py-3 px-4 rounded-md bg-blue-600 text-white font-semibold
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:ring-offset-2 transition-colors"
      >
        Upgrade to Pro
      </button>
    ) : (
      <form onSubmit={handleBillingSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="street"
            value={billingInfo.street}
            onChange={handleInputChange}
            placeholder="Street Address"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="city"
            value={billingInfo.city}
            onChange={handleInputChange}
            placeholder="City"
            required
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            name="state"
            value={billingInfo.state}
            onChange={handleInputChange}
            placeholder="State"
            required
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="country"
            value={billingInfo.country}
            onChange={handleInputChange}
            placeholder="Country"
            required
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            name="zipcode"
            value={billingInfo.zipcode}
            onChange={handleInputChange}
            placeholder="ZIP Code"
            required
            className="px-3 py-2 border rounded-md"
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowBillingForm(false)}
            className="flex-1 py-2 px-4 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:ring-offset-2 transition-colors
              disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    )}
  </>
)}
          )

          {/* Current Plan Indicator */}
          {currentTier === tier && (
            <div className="text-center text-sm font-medium text-blue-600 mt-4">
              Current Plan
            </div>
          )}
        </div>
      ))}
    </div>
  );
}