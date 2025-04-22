"use client";

import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const createSession = async (idToken: string) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        // Get the ID token
        const idToken = await result.user.getIdToken();
        
        // Create session cookie
        await createSession(idToken);
        
        // Redirect to home page
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Signing in..." : "Sign In with Google"}
        </button>
      </div>
    </div>
  );
};

export default SignIn;