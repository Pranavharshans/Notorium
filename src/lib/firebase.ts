import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let instances: FirebaseInstances | null = null;

// Initialize Firebase when this module loads
const initializeFirebase = async (): Promise<FirebaseInstances> => {
  if (instances) {
    return instances;
  }

  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase configuration');
    }
    const { firebaseConfig } = await response.json();

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    instances = { app, auth, db };
    return instances;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Get Firebase instances, initializing if necessary
export const getFirebaseInstance = async (): Promise<FirebaseInstances> => {
  if (!instances) {
    return await initializeFirebase();
  }
  return instances;
};

// For code that needs to run only after Firebase is initialized
export const whenFirebaseReady = async (): Promise<void> => {
  if (!instances) {
    await initializeFirebase();
  }
};

// Start initialization immediately in browser
if (typeof window !== 'undefined') {
  initializeFirebase().catch(console.error);
}

// Re-export types for convenience
export type { FirebaseInstances };