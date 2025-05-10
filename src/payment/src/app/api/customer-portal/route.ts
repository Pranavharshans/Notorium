import { NextResponse } from 'next/server';
// import { dodopayments } from '@/lib/dodopayments'; // Commented out - @typescript-eslint/no-unused-vars
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    // Get the session token from header
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify the token and get user
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user's subscription data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userData?.customer_id) {
      return NextResponse.json(
        { error: 'No customer found' },
        { status: 404 }
      );
    }

    // Create customer portal session using the API
    const response = await fetch(
      `https://test.dodopayments.com/customers/${userData.customer_id}/customer-portal/session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DODO_API_KEY_TEST}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          send_email: false
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { link } = await response.json();

    if (!link) {
      throw new Error('No portal link received');
    }

    return NextResponse.json({ url: link });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}