'use client';

import React, { useEffect, useState } from 'react';
import { UsageStats } from '@/lib/usage-service';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription-config';

interface UsageDisplayProps {
  userId: string;
  currentTier: SubscriptionTier;
  onLimitReached?: () => void;
}

export default function UsageDisplay({ userId, currentTier, onLimitReached }: UsageDisplayProps) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [userId]);

  const fetchUsage = async () => {
    try {
      const response = await fetch(`/api/usage?userId=${userId}`);
      const data = await response.json();
      setUsage(data);
      
      // Check if limits are reached and notify
      const limits = SUBSCRIPTION_TIERS[currentTier].limits;
      if (
        data.recordingTimeUsed >= limits.recordingTimeMinutes ||
        data.aiActionsUsed >= limits.aiActionsPerMonth
      ) {
        onLimitReached?.();
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  if (loading) {
    return <div className="animate-pulse">Loading usage data...</div>;
  }

  if (!usage) {
    return <div>Error loading usage data</div>;
  }

  const limits = SUBSCRIPTION_TIERS[currentTier].limits;
  const recordingPercentage = calculatePercentage(usage.recordingTimeUsed, limits.recordingTimeMinutes);
  const aiActionsPercentage = calculatePercentage(usage.aiActionsUsed, limits.aiActionsPerMonth);

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
      
      {/* Recording Time Usage */}
      <div>
        <div className="flex justify-between mb-2">
          <span>Recording Time</span>
          <span>
            {usage.recordingTimeUsed} / {limits.recordingTimeMinutes} minutes
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full ${
              recordingPercentage >= 90 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${recordingPercentage}%` }}
          />
        </div>
      </div>

      {/* AI Actions Usage */}
      <div>
        <div className="flex justify-between mb-2">
          <span>AI Actions</span>
          <span>
            {usage.aiActionsUsed} / {limits.aiActionsPerMonth} actions
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full ${
              aiActionsPercentage >= 90 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${aiActionsPercentage}%` }}
          />
        </div>
      </div>

      {/* Warning Messages */}
      {(recordingPercentage >= 90 || aiActionsPercentage >= 90) && currentTier === 'free' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <p className="text-yellow-800">
            You're approaching your usage limits. Upgrade to Pro for higher limits.
          </p>
        </div>
      )}
    </div>
  );
}