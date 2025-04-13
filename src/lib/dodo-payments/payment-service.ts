import { DodoPayments } from 'dodopayments';
import { paymentConfig } from './config';
import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentError, 
  CustomerData,
  SubscriptionResponse,
  DojoConfig
} from './types';
import {
  DodoCustomerRequest,
  DodoPaymentRequest,
  DodoSubscriptionRequest
} from './sdk-types';

export class PaymentService {
  private client: DodoPayments;
  private static instance: PaymentService;

  private constructor() {
    const config: DojoConfig = {
      apiKey: paymentConfig.apiKey,
      apiUrl: paymentConfig.apiUrl,
    };
    this.client = new DodoPayments(config);
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a new payment
   */
  async createPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      this.validatePaymentData(data);

      const sdkRequest: DodoPaymentRequest = {
        amount: data.amount,
        currency: data.currency,
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          extraData: data.customer.metadata as Record<string, string>
        },
        extraData: data.metadata as Record<string, string>,
        returnUrl: `${paymentConfig.returnUrl}/payment/success`
      };

      const paymentResponse = await this.client.payments.create(sdkRequest);

      return {
        payment_id: paymentResponse.id,
        status: paymentResponse.status as PaymentResponse['status'],
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        customer: data.customer,
        created: new Date().toISOString(),
        metadata: data.metadata,
        payment_url: paymentResponse.paymentUrl
      };
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const payment = await this.client.payments.retrieve(paymentId);
      
      return {
        payment_id: payment.id,
        status: payment.status as PaymentResponse['status'],
        amount: payment.amount,
        currency: payment.currency,
        customer: {
          name: payment.name,
          email: payment.email,
          metadata: payment.extraData
        },
        created: payment.created,
        metadata: payment.extraData
      };
    } catch (error) {
      console.error('Payment status check failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(
    customerId: string,
    planId: string
  ): Promise<SubscriptionResponse> {
    try {
      const sdkRequest: DodoSubscriptionRequest = {
        customerId,
        planId,
        extraData: {
          created_at: new Date().toISOString()
        }
      };

      const subscription = await this.client.subscriptions.create(sdkRequest);

      return {
        subscription_id: subscription.id,
        status: subscription.status as SubscriptionResponse['status'],
        plan_id: subscription.planId,
        customer_id: subscription.customerId,
        current_period_end: subscription.currentPeriodEnd,
        cancel_at_period_end: false,
        metadata: subscription.extraData
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.client.subscriptions.update(subscriptionId, {
        extraData: {
          cancelled_at: new Date().toISOString(),
          status: 'cancelled'
        }
      });
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Create or update customer information
   */
  async upsertCustomer(customerData: CustomerData): Promise<CustomerData> {
    try {
      const sdkRequest: DodoCustomerRequest = {
        name: customerData.name,
        email: customerData.email,
        extraData: customerData.metadata as Record<string, string>
      };

      const customer = await this.client.customers.create(sdkRequest);

      return {
        name: customer.name,
        email: customer.email,
        metadata: customer.extraData
      };
    } catch (error) {
      console.error('Customer operation failed:', error);
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Handle payment errors
   */
  private handlePaymentError(error: any): PaymentError {
    const errorResponse: PaymentError = {
      error_code: error.code || 'unknown_error',
      error_message: error.message || 'An unknown error occurred',
      details: error.details
    };

    // Log error for monitoring
    console.error('Payment error:', {
      error_code: errorResponse.error_code,
      error_message: errorResponse.error_message,
      details: errorResponse.details,
    });

    return errorResponse;
  }

  /**
   * Validate payment data
   */
  private validatePaymentData(data: PaymentRequest): void {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!data.currency) {
      throw new Error('Currency is required');
    }

    if (!data.customer || !data.customer.email) {
      throw new Error('Customer email is required');
    }

    if (!data.customer.name) {
      throw new Error('Customer name is required');
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();