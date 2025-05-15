import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Initialize Firebase Admin if it hasn't been initialized
const apps = getApps();

if (!apps.length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
      ))
    });
  } catch (error) {
    throw error;
  }
}

let db: Firestore;
let auth: Auth;

try {
  db = getFirestore();
  auth = getAuth();
} catch (error) {
  throw error;
}

export { db, auth };