"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const provider = new GoogleAuthProvider();

// Function to create session
async function createSession(user: User) {
  try {
    // Get the current window origin instead of using environment variables
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const idToken = await user.getIdToken();
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include', // Include cookies in the request
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
    // Get the current window origin instead of using environment variables
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
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
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { auth } = await getFirebaseInstance();
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Only create session if we haven't initialized yet
              if (!initialized) {
                await createSession(user);
              }
              setUser(user);
            } catch (error) {
              console.error('Auth state change error:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
          setInitialized(true);
        });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initialized]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { auth } = await getFirebaseInstance();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createSession(user);
      setUser(user);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      const { auth } = await getFirebaseInstance();
      await deleteSession();
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
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