"use client";

import { useRouter } from "next/navigation";
import { Dialog } from '@headlessui/react';
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { X } from "lucide-react";

export function AuthNotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X size={20} />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <Dialog.Title className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Sign in Required
              </Dialog.Title>

              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please sign in to continue with the upgrade process. Create an account or sign in to access premium features.
                </p>
              </div>

              <div className="mt-6 w-full">
                <ShimmerButton
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500"
                >
                  Sign In to Continue
                </ShimmerButton>
                
                <button
                  onClick={onClose}
                  className="mt-3 w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
} 