import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- IMPORTANT ---
// 1. Download your Firebase service account key JSON file.
// 2. Place it in the root of your project (or a secure location).
// 3. Add the path to your .env.local: GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-service-account-key.json
// --- IMPORTANT ---

// Explicitly load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Check if service account path is set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS path is not set in .env.local. Please add the path to your service account key file.");
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Still needed for context
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (initError) {
  console.error("Failed to initialize Firebase Admin SDK:", initError);
  console.error("Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account key JSON file.");
  process.exit(1);
}

const db = getFirestore();

async function initializeCollections() {
  try {
    const batch = db.batch(); // Use a batch for efficiency

    // Create subscriptions collection with a sample document
    const subRef = db.collection('subscriptions').doc('sample');
    batch.set(subRef, {
      tier: 'free',
      subscriptionId: null,
      startDate: Timestamp.now(), // Use Admin SDK Timestamp
      endDate: null,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: { userId: '', email: '', name: '' }
    });
    console.log("Prepared 'subscriptions' sample document.");

    // Create usage collection with a sample document
    const usageRef = db.collection('usage').doc('sample');
    batch.set(usageRef, {
      recordingTimeUsed: 0,
      aiActionsUsed: 0,
      lastResetDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      quotaResets: []
    });
    console.log("Prepared 'usage' sample document.");

    // Create users collection with a sample document
    const userRef = db.collection('users').doc('sample');
    batch.set(userRef, {
      email: '',
      displayName: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      profile: { name: '', city: '', country: '', state: '', street: '', zipcode: '' },
      settings: { notifications: true, emailUpdates: true }
    });
    console.log("Prepared 'users' sample document.");

    // Create payments collection with a sample history document
    const paymentRef = db.collection('payments').doc('sample').collection('history').doc('sample');
    batch.set(paymentRef, {
      id: 'sample',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      type: 'subscription',
      createdAt: Timestamp.now(),
      metadata: { userId: '', tier: 'free', planId: '' }
    });
    console.log("Prepared 'payments/history' sample document.");

    // Commit the batch
    await batch.commit();
    console.log('Successfully initialized all collections via Admin SDK!');

    process.exit(0); // Explicitly exit on success
  } catch (error) {
    console.error('Error initializing collections with Admin SDK:', error);
    if (error.code) console.error("Firestore Error Code:", error.code);
    if (error.details) console.error("Firestore Error Details:", error.details);
    process.exit(1); // Explicitly exit on error
  }
}

// Run the initialization
initializeCollections();