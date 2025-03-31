"use client";

import { useState } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      // Navigate to dashboard or start using the app
      console.log("Already signed in");
    } else {
      setIsAuthModalOpen(true);
    }
  };

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
          {user ? "Go to Dashboard" : "Get Started"}
        </ShimmerButton>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
