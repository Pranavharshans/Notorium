"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotaFeature, QuotaWarningType } from "@/components/ui/usage-display";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

const QuotaWarningModal = dynamic(() => import("@/components/ui/quota-warning-modal").then(mod => mod.QuotaWarningModal), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { user } = useAuth();
  const [quotaWarning, setQuotaWarning] = useState<{
    type: QuotaWarningType;
    feature: QuotaFeature;
    current: number;
    limit: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <Link href="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
          </Link>
        </div>
      )}
      {quotaWarning && (
        <QuotaWarningModal
          type={quotaWarning.feature}
          mode={quotaWarning.type}
          current={quotaWarning.current}
          limit={quotaWarning.limit}
          onClose={() => {
            console.log("QuotaWarningModal close button clicked");
            setQuotaWarning(null);
          }}
        />
      )}
      {children}
    </div>
  );
}