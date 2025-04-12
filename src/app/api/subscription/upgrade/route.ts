import { NextRequest, NextResponse } from 'next/server';
import DodoPaymentsService from '@/lib/dodo-service';
import SubscriptionDBService from '@/lib/subscription-db-service';
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-config';
import { ErrorMessages, PaymentError } from '@/lib/errors/subscription-errors';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { userId, paymentMethodId } = await req.json();

    if (!userId || !paymentMethodId) {
      return NextResponse.json(
        { error: ErrorMessages.INVALID_REQUEST_PARAMETERS },
        { status: 400 }
      );
    }

    const dodoService = DodoPaymentsService.getInstance();
    const dbService = SubscriptionDBService.getInstance();

    // Get current subscription status
    const currentSubscription = await dbService.getSubscription(userId);

    // Don't create new subscription if user is already on pro tier
    if (currentSubscription?.tier === 'pro' && currentSubscription?.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active pro subscription' },
        { status: 400 }
      );
    }

    // Create subscription checkout session
    const proTier = SUBSCRIPTION_TIERS.pro;

    // Create payment intent first
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: (proTier.price || 0) * 100, // Convert to cents
      currency: 'USD',
      status: 'requires_confirmation' as const,
      paymentMethod: paymentMethodId
    };

    // Store payment intent
    await dbService.createPaymentIntent(userId, paymentIntent);

    // Create subscription
    const session = await dodoService.createSubscription(
      userId,
      proTier.price || 0,
      paymentMethodId,
      paymentIntent.id
    );

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error('Failed to create subscription:', error);

    // Handle specific error types
    if (error instanceof PaymentError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Log detailed error for debugging
    console.error('Subscription creation error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json(
      { error: ErrorMessages.SUBSCRIPTION_CREATION_FAILED },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
if (!userId) {
  return NextResponse.json(
    { error: ErrorMessages.USER_NOT_FOUND },
    { status: 400 }
  );
}

// Get payment history along with subscription status
  }

  try {
    const dbService = SubscriptionDBService.getInstance();
    const [subscription, paymentHistory] = await Promise.all([
      dbService.getSubscription(userId),
      dbService.getPaymentHistory(userId)
    ]);

    return NextResponse.json({
      subscription: {
        tier: subscription?.tier || 'free',
        status: subscription?.status || 'active',
        subscriptionId: subscription?.subscriptionId || null,
        endDate: subscription?.endDate || null
      },
      paymentHistory: paymentHistory.slice(0, 5) // Return last 5 payments
    });
  } catch (error: any) {
    console.error('Failed to get subscription status:', error);

    // Log detailed error for debugging
    console.error('Subscription status error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json(
      { error: ErrorMessages.SUBSCRIPTION_NOT_FOUND },
      { status: 500 }
    );
  }
}