"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { quotaService } from '@/lib/quota-service';
import { ShimmerButton } from '@/components/ui/shimmer-button';

interface UsageStats {
  recording: {
    used: number;
    limit: number;
    percentageUsed: number;
    formattedTimeRemaining: string;
  };
  enhance: {
    used: number;
    limit: number;
    percentageUsed: number;
  };
  subscription: {
    status: 'trial' | 'paid';
    startDate: string;
  };
}

export default function UsagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsageStats() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const [recordingQuota, enhanceQuota] = await Promise.all([
          quotaService.checkRecordingQuota(user.uid),
          quotaService.checkEnhanceQuota(user.uid),
        ]);

        const quota = await quotaService.getUserQuota(user.uid);
        const recordingLimits = quotaService.getQuotaLimits(quota.subscriptionStatus);

        setUsageStats({
          recording: {
            used: recordingLimits.recordingMinutes - recordingQuota.minutesRemaining,
            limit: recordingLimits.recordingMinutes,
            percentageUsed: recordingQuota.percentageUsed,
            formattedTimeRemaining: recordingQuota.formattedTimeRemaining,
          },
          enhance: {
            used: recordingLimits.enhanceNotes - enhanceQuota.enhancesRemaining,
            limit: recordingLimits.enhanceNotes,
            percentageUsed: enhanceQuota.percentageUsed,
          },
          subscription: {
            status: quota.subscriptionStatus,
            startDate: quota.subscriptionStartDate.toISOString(),
          },
        });
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsageStats();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!usageStats) return null;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage & Limits</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your current subscription: {' '}
            <span className="font-semibold">
              {usageStats.subscription.status === 'paid' ? 'Pro Plan' : 'Trial'}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Recording Usage */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recording Time
            </h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {usageStats.recording.formattedTimeRemaining} remaining
                </span>
                <span className={getStatusColor(usageStats.recording.percentageUsed)}>
                  {Math.round(usageStats.recording.percentageUsed)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(usageStats.recording.percentageUsed)} bg-current transition-all`}
                  style={{ width: `${Math.min(100, usageStats.recording.percentageUsed)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Enhance Notes Usage */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Enhance Notes
            </h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {usageStats.enhance.used} / {usageStats.enhance.limit} operations used
                </span>
                <span className={getStatusColor(usageStats.enhance.percentageUsed)}>
                  {Math.round(usageStats.enhance.percentageUsed)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(usageStats.enhance.percentageUsed)} bg-current transition-all`}
                  style={{ width: `${Math.min(100, usageStats.enhance.percentageUsed)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Subscription Details
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>Status: {usageStats.subscription.status === 'paid' ? 'Pro Plan' : 'Trial'}</p>
              <p>Started: {formatDate(usageStats.subscription.startDate)}</p>
            </div>
            
            {usageStats.subscription.status === 'trial' && (
              <div className="mt-6">
                <ShimmerButton
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Upgrade to Pro
                </ShimmerButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}