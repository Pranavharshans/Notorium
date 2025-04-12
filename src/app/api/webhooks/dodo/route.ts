import { NextRequest, NextResponse } from 'next/server';
import DodoPaymentsService from '@/lib/dodo-service';
import UsageService from '@/lib/usage-service';
import SubscriptionDBService from '@/lib/subscription-db-service';
import { WebhookError } from '@/lib/errors/subscription-errors';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const signature = req.headers.get('dodo-signature');
  const timestamp = req.headers.get('dodo-timestamp');
  
  if (!signature || !timestamp) {
    return NextResponse.json({
      error: 'Missing required headers: dodo-signature and dodo-timestamp'
    }, { status: 400 });
  }

  try {
    const payload = await req.json();
    const dodoService = DodoPaymentsService.getInstance();
    const dbService = SubscriptionDBService.getInstance();
    const usageService = UsageService.getInstance();

    try {
      // Verify webhook signature with timestamp
      dodoService.verifyWebhook(payload, signature, timestamp);
    } catch (error: unknown) {
      if (error instanceof WebhookError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Handle different webhook events
    switch (payload.type) {
      case 'subscription.active':
        await handleSubscriptionActive(payload, dbService);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload, dbService);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(payload, dbService, usageService);
        break;

      case 'subscription.failed':
        await handleSubscriptionFailed(payload, dbService);
        break;

      case 'payment.succeeded':
        await handlePaymentSucceeded(payload, dbService);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload, dbService);
        break;

      default:
        console.log(`Unhandled webhook event: ${payload.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActive(
  payload: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription } = payload;
  await dbService.updateSubscription(customer.id, {
    tier: 'pro',
    subscriptionId: subscription.id,
    status: 'active',
    startDate: new Date(subscription.current_period_start * 1000),
    endDate: new Date(subscription.current_period_end * 1000)
  });
}

async function handleSubscriptionCancelled(
  payload: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription } = payload;
  await dbService.updateSubscription(customer.id, {
    tier: 'free',
    status: 'cancelled',
    endDate: new Date(subscription.canceled_at * 1000)
  });
}

async function handleSubscriptionRenewed(
  payload: any,
  dbService: SubscriptionDBService,
  usageService: UsageService
) {
  const { customer, subscription } = payload;
  
  // Update subscription dates
  await dbService.updateSubscription(customer.id, {
    status: 'active',
    startDate: new Date(subscription.current_period_start * 1000),
    endDate: new Date(subscription.current_period_end * 1000)
  });

  // Reset usage counters for new billing period
  await usageService.resetMonthlyUsage(customer.id);
}

async function handleSubscriptionFailed(
  payload: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription } = payload;
  await dbService.updateSubscription(customer.id, {
    status: 'expired',
    tier: 'free',
    endDate: new Date()
  });
}

async function handlePaymentSucceeded(
  payload: any,
  dbService: SubscriptionDBService
) {
  // Update payment status if needed
  console.log('Payment succeeded:', payload.payment.id);
}

async function handlePaymentFailed(
  payload: any,
  dbService: SubscriptionDBService
) {
  const { customer } = payload;
  // Optionally update subscription status or send notification
  console.log('Payment failed for customer:', customer.id);
}