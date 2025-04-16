import { db } from '../src/lib/firebase.js';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

async function initializeCollections() {
  try {
    // Create subscriptions collection with a sample document
    await setDoc(doc(db, 'subscriptions', 'sample'), {
      tier: 'free',
      subscriptionId: null,
      startDate: Timestamp.now(),
      endDate: null,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        userId: '',
        email: '',
        name: ''
      }
    });

    // Create usage collection with a sample document
    await setDoc(doc(db, 'usage', 'sample'), {
      recordingTimeUsed: 0,
      aiActionsUsed: 0,
      lastResetDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      quotaResets: []
    });

    // Create users collection with a sample document
    await setDoc(doc(db, 'users', 'sample'), {
      email: '',
      displayName: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      profile: {
        name: '',
        city: '',
        country: '',
        state: '',
        street: '',
        zipcode: ''
      },
      settings: {
        notifications: true,
        emailUpdates: true
      }
    });

    // Create payments collection with a sample history document
    await setDoc(doc(db, 'payments/sample/history/sample'), {
      id: 'sample',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      type: 'subscription',
      createdAt: Timestamp.now(),
      metadata: {
        userId: '',
        tier: 'free',
        planId: ''
      }
    });

    console.log('Successfully initialized all collections!');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// Run the initialization
initializeCollections();