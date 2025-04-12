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

    // Validate webhook payload
    const { type, data, business_id } = payload;

    if (!type || !data || !business_id) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Handle different webhook events
    switch (type) {
      case 'subscription.active':
        await handleSubscriptionActive(data, dbService);
        break;

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(data, dbService);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data, dbService);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(data, dbService, usageService);
        break;

      case 'subscription.failed':
        await handleSubscriptionFailed(data, dbService);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(data, dbService);
        break;

      case 'subscription.expired':
        await handleSubscriptionExpired(data, dbService);
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
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id, created_at, next_billing_date, metadata } = data;
  await dbService.updateSubscription(customer.customer_id, {
    tier: metadata?.tier || 'pro',
    subscriptionId: subscription_id,
    status: 'active',
    startDate: new Date(created_at * 1000),
    endDate: next_billing_date ? new Date(next_billing_date * 1000) : null
  });
}

async function handleSubscriptionOnHold(
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id } = data;
  await dbService.updateSubscription(customer.customer_id, {
    status: 'on_hold',
    subscriptionId: subscription_id
  });
}

async function handleSubscriptionCancelled(
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id } = data;
  await dbService.updateSubscription(customer.customer_id, {
    tier: 'free',
    status: 'cancelled',
    endDate: new Date(),
    subscriptionId: subscription_id
  });
}

async function handleSubscriptionRenewed(
  data: any,
  dbService: SubscriptionDBService,
  usageService: UsageService
) {
  const { customer, subscription_id, next_billing_date } = data;
  
  // Update subscription dates
  await dbService.updateSubscription(customer.customer_id, {
    status: 'active',
    startDate: new Date(),
    endDate: next_billing_date ? new Date(next_billing_date * 1000) : null,
    subscriptionId: subscription_id
  });

  // Reset usage counters for new billing period
  await usageService.resetMonthlyUsage(customer.customer_id);
}

async function handleSubscriptionFailed(
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id } = data;
  await dbService.updateSubscription(customer.customer_id, {
    status: 'failed',
    tier: 'free',
    endDate: new Date(),
    subscriptionId: subscription_id
  });
}

async function handleSubscriptionPaused(
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id } = data;
  await dbService.updateSubscription(customer.customer_id, {
    status: 'paused',
    subscriptionId: subscription_id
  });
}

async function handleSubscriptionExpired(
  data: any,
  dbService: SubscriptionDBService
) {
  const { customer, subscription_id } = data;
  await dbService.updateSubscription(customer.customer_id, {
    status: 'expired',
    tier: 'free',
    endDate: new Date(),
    subscriptionId: subscription_id
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