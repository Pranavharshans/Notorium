import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { QuotaPopupProvider } from "@/context/QuotaPopupContext";
import { UploadProgress } from "@/components/ui/upload-progress";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notorium - Smart Lecture Notes",
  description: "AI-powered lecture notes and transcription",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <QuotaPopupProvider>
            <UploadProgress />
            {children}
          </QuotaPopupProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
