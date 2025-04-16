'use client';

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context"; // Import useAuth instead of AuthProvider
import { ToastProvider } from "@/components/ui/toast";
import initDodoSDK from "@/lib/dodo-payments/init-client-sdk";

interface ClientLayoutProps {
  children: React.ReactNode;
  fontClass: string;
}

export function ClientLayout({ children, fontClass }: ClientLayoutProps) {
  const { user, loading: authLoading } = useAuth(); // Use the hook

  useEffect(() => {
    // Wait for auth loading to finish before initializing SDK
    /*
    if (!authLoading) {
      try {
        // Initialize Dodo SDK
        initDodoSDK();
      } catch (error) {
        console.error('Failed to initialize Dodo SDK:', error);
      }
    }
    */
    // Add authLoading as dependency
  }, [authLoading]);

  return (
    <body className={fontClass}>
      {/* AuthProvider removed from here, now wraps this component in layout.tsx */}
      <ToastProvider>
        {children}
      </ToastProvider>
    </body>
  );
}

export default ClientLayout;