"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { quotaService } from '@/lib/quota-service';

export type QuotaFeature = 'recording' | 'enhance';
export type QuotaWarningType = 'warning' | 'limit';

interface UsageStats {
  recording: {
    minutesRemaining: number;
    percentageUsed: number;
  };
  enhance: {
    remaining: number;
    percentageUsed: number;
  };
}

interface UsageDisplayProps {
  onQuotaWarning: (
    type: QuotaWarningType,
    feature: QuotaFeature,
    current: number,
    limit: number
  ) => void;
}

export function UsageDisplay({ onQuotaWarning }: UsageDisplayProps) {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [warningIssued, setWarningIssued] = useState(false);
  
  useEffect(() => {
    async function fetchUsage() {
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
      if (warningIssued) return;
      if (warningIssued) return;
      if (!user) return;

      try {
        const [recordingQuota, enhanceQuota] = await Promise.all([
          quotaService.checkRecordingQuota(user.uid),
          quotaService.checkEnhanceQuota(user.uid),
        ]);

        // Check recording quota warning levels
        if (recordingQuota.isExhausted || recordingQuota.percentageUsed >= 80) {
          const tierLimits = quotaService.getQuotaLimits(recordingQuota.subscriptionStatus);
          onQuotaWarning(
            recordingQuota.isExhausted || recordingQuota.percentageUsed >= 100 ? 'limit' : 'warning',
            'recording',
            Math.floor(tierLimits.recordingMinutes - recordingQuota.minutesRemaining),
            tierLimits.recordingMinutes
          );
          setWarningIssued(true);
        }

        // Check enhance quota warning levels
        if (enhanceQuota.percentageUsed >= 80) {
          const tierLimits = quotaService.getQuotaLimits(enhanceQuota.subscriptionStatus);
          onQuotaWarning(
            enhanceQuota.percentageUsed >= 100 ? 'limit' : 'warning',
            'enhance',
            tierLimits.enhanceNotes - enhanceQuota.enhancesRemaining,
            tierLimits.enhanceNotes
          );
          setWarningIssued(true);
        }

        setUsage({
          recording: {
            minutesRemaining: recordingQuota.minutesRemaining,
            percentageUsed: recordingQuota.percentageUsed,
          },
          enhance: {
            remaining: enhanceQuota.enhancesRemaining,
            percentageUsed: enhanceQuota.percentageUsed,
          },
        });
      } catch (error) {
        console.error('Error fetching usage:', error);
        console.log('User ID:', user?.uid);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
    // Set up periodic refresh
    const interval = setInterval(fetchUsage, 60000); // Check every minute
    return () => {
      clearInterval(interval);
      setWarningIssued(false); // Reset warning state when component unmounts
    };
  }, [user, onQuotaWarning, warningIssued]);

  if (loading || !usage) {
    return (
      <div className="animate-pulse flex space-x-4 p-4">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-green-500 dark:text-green-400';
  };

  return (
    <div className="flex items-center space-x-4 p-4">
      <div className="relative group">
        <div className={`cursor-help rounded-full p-2 ${getStatusColor(usage.recording.percentageUsed)}`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-sm">
          <p className="font-medium">Recording Time</p>
          <p className="text-gray-600 dark:text-gray-400">
            {usage.recording.minutesRemaining} minutes remaining
          </p>
          <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(usage.recording.percentageUsed)}`}
              style={{ width: `${Math.min(100, usage.recording.percentageUsed)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className={`cursor-help rounded-full p-2 ${getStatusColor(usage.enhance.percentageUsed)}`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-sm">
          <p className="font-medium">Enhance Notes</p>
          <p className="text-gray-600 dark:text-gray-400">
            {usage.enhance.remaining} operations remaining
          </p>
          <div className="mt-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(usage.enhance.percentageUsed)}`}
              style={{ width: `${Math.min(100, usage.enhance.percentageUsed)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}