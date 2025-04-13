import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { Firestore, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { paymentConfig } from '@/lib/dodo-payments/config';
import { WebhookEvent } from '@/lib/dodo-payments/types';
import { paymentService } from '@/lib/dodo-payments/payment-service';
import { db } from '@/lib/firebase';

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!signature || !timestamp || !paymentConfig.webhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', paymentConfig.webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(event: WebhookEvent) {
  const payment = event.data.payment;
  if (!payment) return;

  // Update payment status in database
  const paymentRef = doc(db as Firestore, 'payments', payment.payment_id);
  await setDoc(paymentRef, {
    status: 'completed',
    updatedAt: new Date().toISOString(),
    metadata: payment.metadata
  }, { merge: true });

  // If this is a subscription payment, update subscription status
  if (payment.metadata?.subscription_id) {
    const subscriptionRef = doc(db as Firestore, 'subscriptions', payment.metadata.subscription_id as string);
    await updateDoc(subscriptionRef, {
      status: 'active',
      lastPaymentDate: new Date().toISOString()
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event: WebhookEvent) {
  const payment = event.data.payment;
  if (!payment) return;

  // Update payment status in database
  const paymentRef = doc(db as Firestore, 'payments', payment.payment_id);
  await setDoc(paymentRef, {
    status: 'failed',
    updatedAt: new Date().toISOString(),
    error: payment.metadata?.error
  }, { merge: true });

  // If this is a subscription payment, update subscription status
  if (payment.metadata?.subscription_id) {
    const subscriptionRef = doc(db as Firestore, 'subscriptions', payment.metadata.subscription_id as string);
    await updateDoc(subscriptionRef, {
      status: 'past_due',
      lastFailedDate: new Date().toISOString()
    });
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(event: WebhookEvent) {
  const subscription = event.data.subscription;
  if (!subscription) return;

  // Update subscription in database
  const subscriptionRef = doc(db as Firestore, 'subscriptions', subscription.subscription_id);
  await setDoc(subscriptionRef, {
    status: subscription.status,
    planId: subscription.plan_id,
    customerId: subscription.customer_id,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: new Date().toISOString(),
    metadata: subscription.metadata
  });

  // Update user's subscription status
  const userRef = doc(db as Firestore, 'users', subscription.customer_id);
  await updateDoc(userRef, {
    subscriptionStatus: 'active',
    subscriptionPlan: subscription.plan_id,
    subscriptionUpdatedAt: new Date().toISOString()
  });
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(event: WebhookEvent) {
  const subscription = event.data.subscription;
  if (!subscription) return;

  // Update subscription in database
  const subscriptionRef = doc(db as Firestore, 'subscriptions', subscription.subscription_id);
  await updateDoc(subscriptionRef, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelAtPeriodEnd: true
  });

  // Update user's subscription status
  const userRef = doc(db as Firestore, 'users', subscription.customer_id);
  await updateDoc(userRef, {
    subscriptionStatus: 'cancelled',
    subscriptionUpdatedAt: new Date().toISOString()
  });
}

/**
 * Main webhook handler
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    
    // Verify webhook signature
    const signature = headersList.get('dodo-signature') || null;
    const timestamp = headersList.get('dodo-timestamp') || null;
    
    const isValid = verifyWebhookSignature(body, signature, timestamp);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event: WebhookEvent = JSON.parse(body);

    // Handle different webhook events
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      default:
        console.warn('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}