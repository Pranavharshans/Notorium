"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuotaFeature, QuotaWarningType } from "@/components/ui/usage-display";
import { useAuth } from "@/context/auth-context";

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