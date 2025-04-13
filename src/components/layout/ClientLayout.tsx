'use client';

import { useEffect } from "react";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import initDodoSDK from "@/lib/dodo-payments/init-client-sdk";

interface ClientLayoutProps {
  children: React.ReactNode;
  fontClass: string;
}

export function ClientLayout({ children, fontClass }: ClientLayoutProps) {
  useEffect(() => {
    try {
      // Initialize Dodo SDK
      initDodoSDK();
    } catch (error) {
      console.error('Failed to initialize Dodo SDK:', error);
    }
  }, []);

  return (
    <body className={fontClass}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </body>
  );
}

export default ClientLayout;