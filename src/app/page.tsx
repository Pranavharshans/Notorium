"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/home");
    }
  }, [user, loading, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push("/home");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  if (loading) return null;
  if (user) return null;

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundPaths />
      <div className="relative z-10 flex flex-col items-center pt-32 text-white text-center px-4">
        <h1 className="text-7xl md:text-9xl font-bold mb-12 tracking-tight">
          NOTORIUM AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-4 mb-12">
          Transform your lectures into comprehensive notes with AI-powered transcription and note generation
        </p>
        <ShimmerButton 
          className="text-lg px-8 py-4" 
          onClick={handleGetStarted}
        >
          Get Started
        </ShimmerButton>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
