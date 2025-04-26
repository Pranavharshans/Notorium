"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ShimmerButton } from './shimmer-button';
import { X, AlertTriangle } from 'lucide-react';

interface QuotaPopupProps {
  type: 'recording' | 'enhance';
  onClose: () => void;
}

export function QuotaPopup({ type, onClose }: QuotaPopupProps) {
  const router = useRouter();

  const title = {
    recording: "Recording Time Limit Reached",
    enhance: "Enhance Notes Limit Reached",
  }[type];

  const message = {
    recording: "You've reached your recording time limit for this period.",
    enhance: "You've reached your enhance notes limit for this period.",
  }[type];

  const upgradeMessage = {
    recording: "Upgrade to Pro for 20 hours of recording time.",
    enhance: "Upgrade to Pro for 50 enhance operations.",
  }[type];

  // Use createPortal to render outside the main DOM hierarchy
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" aria-modal="true">
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6" role="dialog">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-red-500 dark:text-red-400">
            <AlertTriangle size={40} />
          </div>

          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>

          <ShimmerButton
            onClick={() => router.push('/pricing')}
            className="w-full mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Upgrade Now
          </ShimmerButton>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {upgradeMessage}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}