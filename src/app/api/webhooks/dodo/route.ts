import { NextResponse } from 'next/server';
import { DODO_CONFIG } from '@/lib/dodo-payments/config';
import crypto from 'crypto';
import SubscriptionDBService from '@/lib/subscription-db-service';

interface WebhookEvent {
  type: string;
  data: {
    metadata?: {
      userId?: string;
    };
    status: string;
    subscription_id: string;
    current_period_start: string;
    current_period_end: string;
    trial_end?: string;
  };
}

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
    const event = JSON.parse(body) as WebhookEvent;
    const dbService = SubscriptionDBService.getInstance();

    switch (event.type) {
      case DODO_CONFIG.EVENTS.SUBSCRIPTION_CREATED:
      case DODO_CONFIG.EVENTS.SUBSCRIPTION_UPDATED:
        const userId = event.data.metadata?.userId;
        if (userId) {
          const mappedStatus = DODO_CONFIG.mapSubscriptionStatus(event.data.status);
          const isActive = mappedStatus === 'ACTIVE';
          
          await dbService.updateSubscription(userId, {
            tier: isActive ? 'pro' : 'free',
            status: DODO_CONFIG.STATUS[mappedStatus],
            subscriptionId: event.data.subscription_id,
            startDate: new Date(event.data.current_period_start),
            endDate: new Date(event.data.current_period_end)
          });

          // Reset usage quotas when subscription becomes active
          if (isActive) {
            await dbService.resetUsage(userId);
          }
        }
        break;

      case DODO_CONFIG.EVENTS.SUBSCRIPTION_CANCELLED:
        const cancelledUserId = event.data.metadata?.userId;
        if (cancelledUserId) {
          const mappedStatus = DODO_CONFIG.mapSubscriptionStatus('cancelled');
          await dbService.updateSubscription(cancelledUserId, {
            tier: 'free',
            status: DODO_CONFIG.STATUS[mappedStatus],
            subscriptionId: null,
            endDate: new Date()
          });
        }
        break;

      case DODO_CONFIG.EVENTS.PAYMENT_FAILED:
        const failedUserId = event.data.metadata?.userId;
        if (failedUserId) {
          const subscription = await dbService.getSubscription(failedUserId);
          
          if (subscription.status === DODO_CONFIG.STATUS.ACTIVE) {
            await dbService.updateSubscription(failedUserId, {
              status: DODO_CONFIG.STATUS[DODO_CONFIG.mapSubscriptionStatus('on_hold')],
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 day grace period
            });
          } else if (subscription.status === DODO_CONFIG.STATUS.ON_HOLD) {
            const mappedStatus = DODO_CONFIG.mapSubscriptionStatus('expired');
            await dbService.updateSubscription(failedUserId, {
              tier: 'free',
              status: DODO_CONFIG.STATUS[mappedStatus],
              subscriptionId: null,
              endDate: new Date()
            });
          }
        }
        break;

      case DODO_CONFIG.EVENTS.SUBSCRIPTION_TRIAL_ENDING:
        const trialUserId = event.data.metadata?.userId;
        if (trialUserId && event.data.trial_end) {
          const mappedStatus = DODO_CONFIG.mapSubscriptionStatus('trial');
          await dbService.updateSubscription(trialUserId, {
            status: DODO_CONFIG.STATUS[mappedStatus],
            endDate: new Date(event.data.trial_end)
          });
        }
        break;

      case DODO_CONFIG.EVENTS.SUBSCRIPTION_TRIAL_ENDED:
        const trialEndedUserId = event.data.metadata?.userId;
        if (trialEndedUserId) {
          const mappedStatus = DODO_CONFIG.mapSubscriptionStatus(event.data.status);
          const isActive = mappedStatus === 'ACTIVE';
          await dbService.updateSubscription(trialEndedUserId, {
            tier: isActive ? 'pro' : 'free',
            status: DODO_CONFIG.STATUS[mappedStatus],
            endDate: isActive ? null : new Date()
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