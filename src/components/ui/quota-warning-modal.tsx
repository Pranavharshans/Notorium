"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShimmerButton } from './shimmer-button';
import { X } from 'lucide-react';

interface QuotaWarningModalProps {
  type: 'recording' | 'enhance';
  mode: 'warning' | 'limit';
  current: number;
  limit: number;
  onClose: () => void;
}

export function QuotaWarningModal({
  type,
  mode,
  current,
  limit,
  onClose,
}: QuotaWarningModalProps) {
  const router = useRouter();

  const title = {
    warning: {
      recording: "Recording Time Running Low",
      enhance: "Enhance Notes Running Low",
    },
    limit: {
      recording: "Recording Time Limit Reached",
      enhance: "Enhance Notes Limit Reached",
    },
  }[mode][type];

  const message = {
    warning: {
      recording: `You've used ${current} out of ${limit} minutes of recording time.`,
      enhance: `You've used ${current} out of ${limit} enhance operations.`,
    },
    limit: {
      recording: "You've reached your recording time limit.",
      enhance: "You've reached your enhance notes limit.",
    },
  }[mode][type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="mb-4">
            {mode === 'limit' ? (
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            ) : (
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}

            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>

          <div className="mt-6">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  mode === 'limit' 
                    ? 'bg-red-500 dark:bg-red-600'
                    : 'bg-yellow-500 dark:bg-yellow-600'
                }`}
                style={{ width: `${Math.min(100, (current / limit) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            <ShimmerButton
              onClick={() => router.push('/pricing')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Upgrade Now
            </ShimmerButton>
            {mode === 'warning' && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Continue with Limited Access
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Upgrade to Pro for {type === 'recording' ? '20 hours' : '50 enhance operations'} and more features
          </p>
        </div>
      </div>
    </div>
  );
}