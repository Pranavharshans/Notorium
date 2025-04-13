import { NextResponse } from 'next/server';
import { DODO_CONFIG } from '@/lib/dodo-payments/config';
import { DodoSubscriptionStatus } from '@/lib/dodo-payments/init-sdk';
import crypto from 'crypto';
import SubscriptionDBService from '@/lib/subscription-db-service';

export async function POST(req: Request) {
  try {
    let webhookSecret: string;
    try {
      webhookSecret = DODO_CONFIG.getWebhookSecret();
    } catch (error) {
      console.error('Webhook secret is not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('dodo-signature');
    const timestamp = req.headers.get('dodo-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const signaturePayload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signaturePayload)
      .digest('hex');

    // Use timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and handle the webhook event
    const event = JSON.parse(body);
    const dbService = SubscriptionDBService.getInstance();

    switch (event.type) {
      case DODO_CONFIG.EVENTS.SUBSCRIPTION_CREATED:
      case DODO_CONFIG.EVENTS.SUBSCRIPTION_UPDATED:
        // Update user's subscription status
        const userId = event.data.metadata?.userId;
        if (userId) {
          await dbService.updateSubscription(userId, {
            tier: 'pro',
            status: event.data.status as DodoSubscriptionStatus,
            subscriptionId: event.data.subscription_id,
            endDate: new Date(event.data.current_period_end)
          });
        }
        break;

      case DODO_CONFIG.EVENTS.SUBSCRIPTION_CANCELLED:
        const cancelledUserId = event.data.metadata?.userId;
        if (cancelledUserId) {
          await dbService.updateSubscription(cancelledUserId, {
            tier: 'free',
            status: 'cancelled',
            subscriptionId: null,
            endDate: null
          });
        }
        break;

      case DODO_CONFIG.EVENTS.PAYMENT_FAILED:
        // Handle failed payment - maybe send notification to user
        const failedUserId = event.data.metadata?.userId;
        if (failedUserId) {
          await dbService.updateSubscription(failedUserId, {
            status: 'expired',
            endDate: new Date() // Current date as Date object
          });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}