"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tiles } from "@/components/ui/tiles";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/context/auth-context";
import { WordRotate } from "@/components/ui/word-rotate";
import { GradientText } from "@/components/ui/gradient-text";

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
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 [background:radial-gradient(100%_100%_at_50%_0%,transparent_30%,white_70%)] z-10"></div>
          <Tiles />
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center pt-32 text-black text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight flex flex-col items-center gap-4 font-roboto">
          <div className="whitespace-nowrap flex items-baseline gap-2">
            Learn{" "}<span className="inline-flex align-middle"><WordRotate words={["faster", "easier", "better"]} useGradient={true} /></span>{" "}
          </div>
          <div className="flex gap-5"><span>not</span><span>harder</span></div>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed mt-4 mb-12">
        Built with intelligence, for your intelligence.
        </p>
        <ShimmerButton 
          className="text-lg px-8 py-4" 
          onClick={handleGetStarted}
        >
          Try Notorium AI
        </ShimmerButton>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
