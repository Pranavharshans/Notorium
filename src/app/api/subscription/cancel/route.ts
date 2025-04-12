import { NextRequest, NextResponse } from 'next/server';
import DodoPaymentsService from '@/lib/dodo-service';
import SubscriptionDBService from '@/lib/subscription-db-service';
import { ErrorMessages, createErrorResponse } from '@/lib/errors/subscription-errors';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND'),
        { status: 400 }
      );
    }

    const dodoService = DodoPaymentsService.getInstance();
    const dbService = SubscriptionDBService.getInstance();

    // Get current subscription
    const subscription = await dbService.getSubscription(userId);

    if (!subscription || !subscription.subscriptionId) {
      return NextResponse.json(
        createErrorResponse('SUBSCRIPTION_NOT_FOUND'),
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        createErrorResponse('INVALID_SUBSCRIPTION_STATUS'),
        { status: 400 }
      );
    }

    // Calculate grace period end date (end of current billing period)
    const gracePeriodEnd = subscription.endDate || new Date();
    
    // Cancel subscription with Dodo Payments
    await dodoService.cancelSubscription(subscription.subscriptionId);

    // Update subscription status in database
    await dbService.updateSubscription(userId, {
      status: 'cancelled',
      tier: 'free',
      endDate: gracePeriodEnd // Subscription remains active until the end of billing period
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      gracePeriodEnd
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return NextResponse.json(
      createErrorResponse('UNKNOWN_ERROR', error),
      { status: 500 }
    );
  }
}

// Endpoint to check cancellation status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        createErrorResponse('USER_NOT_FOUND'),
        { status: 400 }
      );
    }

    const dbService = SubscriptionDBService.getInstance();
    const subscription = await dbService.getSubscription(userId);

    if (!subscription) {
      return NextResponse.json(
        createErrorResponse('SUBSCRIPTION_NOT_FOUND'),
        { status: 404 }
      );
    }

    const endDate = subscription.endDate || new Date();
    const isInGracePeriod = subscription.status === 'cancelled' && new Date() < endDate;

    return NextResponse.json({
      status: subscription.status,
      endDate,
      gracePeriod: isInGracePeriod
    });
  } catch (error) {
    console.error('Failed to get cancellation status:', error);
    return NextResponse.json(
      createErrorResponse('UNKNOWN_ERROR', error),
      { status: 500 }
    );
  }
}