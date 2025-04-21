import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Initialize Firebase Admin if it hasn't been initialized
const apps = getApps();

if (!apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    if (!serviceAccount.project_id) {
      throw new Error('Invalid service account configuration');
    }

    console.log('Project ID:', serviceAccount.project_id);
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

let db: Firestore;
let auth: Auth;

try {
  db = getFirestore();
  auth = getAuth();
  console.log('Firestore and Auth services initialized');
} catch (error) {
  console.error('Error initializing Firestore/Auth services:', error);
  throw error;
}

export { db, auth };