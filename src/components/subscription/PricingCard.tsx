'use client';

import React from 'react';
import { SUBSCRIPTION_TIERS, formatPrice, getFeaturesList, SubscriptionTier } from '@/lib/subscription-config';

interface PricingCardProps {
  currentTier: SubscriptionTier;
  onUpgrade?: () => void;
}

export default function PricingCard({ currentTier, onUpgrade }: PricingCardProps) {
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

          {/* Action Button */}
          {tier === 'pro' && currentTier !== 'pro' && (
            <button
              onClick={onUpgrade}
              className="w-full py-3 px-4 rounded-md bg-blue-600 text-white font-semibold
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:ring-offset-2 transition-colors"
            >
              Upgrade to Pro
            </button>
          )}

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