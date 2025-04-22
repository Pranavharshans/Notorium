import { NextResponse } from 'next/server';
import { dodopayments } from '@/lib/dodopayments';
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

    if (!userData?.subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription in Dodo Payments
    await dodopayments.subscriptions.update(
      userData.subscription_id,
      { status: 'cancelled' }
    );

    // Get the updated subscription to get the end date
    const subscription = await dodopayments.subscriptions.retrieve(
      userData.subscription_id
    );

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      end_date: subscription.next_billing_date
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}