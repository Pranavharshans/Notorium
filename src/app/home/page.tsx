"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
        <button 
          onClick={signOutUser}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/90 transition-colors"
        >
          Sign Out
        </button>
      </header>
      
      <main>
        {/* Content will be added here */}
      </main>
    </div>
  );
}