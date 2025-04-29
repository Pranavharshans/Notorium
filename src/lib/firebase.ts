import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize with empty values
let app;
let auth;
let db;

// Export a function to get Firebase instances
export const getFirebaseInstance = async () => {
  if (!auth) {
    try {
      const response = await fetch('/api/firebase-config');
      if (!response.ok) {
        throw new Error('Failed to fetch Firebase configuration');
      }
      const { firebaseConfig } = await response.json();

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  return { app, auth, db };
};

export { app, auth, db };