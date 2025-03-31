import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Notorium AI",
  description: "Transform your lectures into comprehensive notes with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
