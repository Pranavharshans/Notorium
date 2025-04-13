import type { Metadata } from "next";
import ClientLayout from "@/components/layout/ClientLayout";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <ClientLayout fontClass={inter.className}>
        {children}
      </ClientLayout>
    </html>
  );
}
