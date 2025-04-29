"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const provider = new GoogleAuthProvider();

// Function to create session
async function createSession(user: User) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const idToken = await user.getIdToken();
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Function to delete session
async function deleteSession() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/auth/session`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      const { auth } = await getFirebaseInstance();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createSession(user);
      setUser(user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { auth } = await getFirebaseInstance();
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              await createSession(user);
              setUser(user);
            } catch (error) {
              console.error('Auth state change error:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
        return () => {};
      }
    };

    initAuth().then(unsubscribe => {
      // Cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    });
  }, []);

  const signOutUser = async () => {
    try {
      const { auth } = await getFirebaseInstance();
      await deleteSession();
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}