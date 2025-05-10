import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server'; // Commented out - @typescript-eslint/no-unused-vars
import { db, /* auth */ } from '@/lib/firebase-admin'; // Commented out auth - @typescript-eslint/no-unused-vars

export async function middleware(/* request: NextRequest */) { // Commented out request - @typescript-eslint/no-unused-vars
  try {
    // Test Firebase Admin connection
    await db.collection('_test_').doc('_test_').get();
    console.log('Firebase Admin SDK initialized successfully');
    
    return NextResponse.next();
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error - Firebase initialization failed' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};