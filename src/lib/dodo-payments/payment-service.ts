import DodoPayments from 'dodopayments';
import { DODO_CONFIG } from './config';
import type { DodoSubscriptionStatus } from './config';

export interface PaymentError {
  error_code: string;
  error_message: string;
  details?: Record<string, unknown>;
}

export class PaymentService {
  private static instance: PaymentService;
  private client: DodoPayments;

  private constructor() {
    // Initialize with API key as bearer token
    this.client = new DodoPayments({
      bearerToken: DODO_CONFIG.getApiKey()
    });
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<{
    isActive: boolean;
    status: DodoSubscriptionStatus;
    currentPeriodEnd: string;
    metadata?: Record<string, unknown>;
  }> {
    try {
      // Cast to any temporarily until we have proper types
      const subscription = await (this.client as any).subscriptions.retrieve({
        subscription_id: subscriptionId
      });

      return {
        isActive: subscription.status === DODO_CONFIG.STATUS.ACTIVE,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        metadata: subscription.metadata
      };
    } catch (error) {
      console.error('Subscription status check failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  private handlePaymentError(error: unknown): PaymentError {
    const errorResponse: PaymentError = {
      error_code: (error as any)?.code || 'unknown_error',
      error_message: (error as any)?.message || 'An unknown error occurred',
      details: (error as any)?.details
    };

    console.error('Payment error:', errorResponse);
    return errorResponse;
  }
}

export const paymentService = PaymentService.getInstance();