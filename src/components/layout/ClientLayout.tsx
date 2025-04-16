"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotaFeature, QuotaWarningType } from "@/components/ui/usage-display";

const UsageDisplay = dynamic(() => import("@/components/ui/usage-display").then(mod => mod.UsageDisplay), { ssr: false });
const QuotaWarningModal = dynamic(() => import("@/components/ui/quota-warning-modal").then(mod => mod.QuotaWarningModal), { ssr: false });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [quotaWarning, setQuotaWarning] = useState<{
    type: QuotaWarningType;
    feature: QuotaFeature;
    current: number;
    limit: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 right-0 z-50">
        <UsageDisplay 
          onQuotaWarning={(type, feature, current, limit) => {
            setQuotaWarning({ type, feature, current, limit });
          }} 
        />
      </div>
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