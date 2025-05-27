import { NextResponse } from 'next/server';

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

export async function GET() {
  try {
    const firebaseConfig: FirebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };

    // Verify that all required configuration values are present
    const requiredFields: (keyof FirebaseConfig)[] = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ];

    for (const field of requiredFields) {
      if (!firebaseConfig[field]) {
        throw new Error(`Missing required Firebase configuration field: ${field}`);
      }
    }

    return NextResponse.json({ firebaseConfig });
  } catch (error) {
    console.error('Error getting Firebase configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get Firebase configuration' },
      { status: 500 }
    );
  }
}
