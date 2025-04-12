import axios from 'axios';
import crypto from 'crypto';
import { WebhookError, PaymentError, ErrorMessages } from './errors/subscription-errors';

const DODO_API_BASE_URL = process.env.NEXT_PUBLIC_DODO_API_URL || 'https://test.dodopayments.com';
const API_VERSION = '2025-04-12';
export interface DodoConfig {
  apiKey: string;
  webhookSecret: string;
  isTestMode: boolean;
}

export interface BillingInfo {
  city: string;
  country: string;
  state: string;
  street: string;
  zipcode: string;
}

export interface CustomerInfo {
  customer_id: string;
  email?: string;
  name?: string;
  phone_number?: string;
}

interface SubscriptionResponse {
  client_secret: string;
  customer: CustomerInfo;
  metadata: Record<string, any>;
  payment_link: string;
  recurring_pre_tax_amount: number;
  subscription_id: string;
}

interface DodoApiResponse extends SubscriptionResponse {
  status?: 'succeeded' | 'requires_action' | 'failed' | 'pending';
  message?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  paymentLink?: string;
  clientSecret?: string;
}

export class DodoPaymentsService {
  private static instance: DodoPaymentsService;
  private readonly config: DodoConfig;
  
  private constructor() {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    const environment = process.env.NODE_ENV || 'development';
    
    if (!apiKey || !webhookSecret) {
      throw new PaymentError(ErrorMessages.INVALID_API_KEY);
    }

    // Validate API key format and environment
    this.validateApiKey(apiKey);
    
    // Ensure test keys in development and live keys in production
    const isTestKey = apiKey.startsWith('sk_test_');
    if (environment === 'production' && isTestKey) {
      throw new PaymentError('Test API key cannot be used in production');
    }
    if (environment === 'development' && !isTestKey) {
      throw new PaymentError('Live API key cannot be used in development');
    }
    
    this.config = {
      apiKey,
      webhookSecret,
      isTestMode: isTestKey
    };
  }

  /**
   * Get current API mode
   */
  public getMode(): 'test' | 'live' {
    return this.config.isTestMode ? 'test' : 'live';
  }

  public static getInstance(): DodoPaymentsService {
    if (!DodoPaymentsService.instance) {
      DodoPaymentsService.instance = new DodoPaymentsService();
    }
    return DodoPaymentsService.instance;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Api-Version': API_VERSION,
      'X-Client-Mode': this.getMode()
    };
  }

  /**
   * Format price for Dodo Payments API
   * Converts price to cents/smallest currency unit
   */
  private formatPrice(price: number): number {
    return Math.round(price * 100);
  }

  /**
   * Create a subscription product
   */
  async createProduct(name: string, price: number, interval: 'month' | 'year') {
    try {
      const response = await axios.post(
        `${DODO_API_BASE_URL}/products`,
        {
          name,
          price: this.formatPrice(price),
          currency: 'USD',
          interval
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Create a subscription for a user with payment method
   */
  async createSubscription(
    userId: string,
    price: number,
    billing: BillingInfo,
    customer: Partial<CustomerInfo> = {}
  ): Promise<CheckoutSession> {
    try {
      const response = await axios.post(
        `${DODO_API_BASE_URL}/subscriptions`,
        {
          billing,
          customer: {
            customer_id: userId,
            ...customer
          },
          payment_link: true,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
          product_id: process.env.DODO_PRO_PRODUCT_ID,
          quantity: 1,
          metadata: {
            tier: 'pro',
            userId
          }
        },
        { headers: this.getHeaders() }
      );

      const data = response.data as DodoApiResponse;
      
      if (data.status === 'failed') {
        throw new PaymentError(data.message || ErrorMessages.PAYMENT_FAILED);
      }

      return {
        id: data.subscription_id,
        url: data.payment_link,
        paymentLink: data.payment_link,
        clientSecret: data.client_secret
      };
    } catch (error: any) {
      console.error('Failed to create subscription:', error);
      if (error.response?.data?.message) {
        throw new PaymentError(error.response.data.message);
      }
      throw new PaymentError(ErrorMessages.SUBSCRIPTION_CREATION_FAILED);
    }
  }

  /**
   * Get a user's subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<DodoApiResponse> {
    try {
      const response = await axios.get(
        `${DODO_API_BASE_URL}/subscriptions/${subscriptionId}`,
        { headers: this.getHeaders() }
      );
      return response.data as DodoApiResponse;
    } catch (error: any) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature using HMAC
   * @throws {WebhookError} If signature verification fails
   */
  verifyWebhook(payload: any, signature: string, timestamp: string): boolean {
    try {
      // Verify timestamp is within tolerance (5 minutes)
      const timestampMs = parseInt(timestamp, 10) * 1000;
      const now = Date.now();
      const tolerance = 5 * 60 * 1000; // 5 minutes

      if (Math.abs(now - timestampMs) > tolerance) {
        throw new WebhookError(ErrorMessages.WEBHOOK_SIGNATURE_INVALID + ': Timestamp expired');
      }

      // Create the signature payload
      const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
      
      // Calculate expected signature using HMAC
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(signaturePayload)
        .digest('hex');

      // Constant-time string comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        throw new WebhookError(ErrorMessages.WEBHOOK_SIGNATURE_INVALID);
      }

      return true;
    } catch (error) {
      if (error instanceof WebhookError) {
        throw error;
      }
      console.error('Webhook verification failed:', error);
      throw new WebhookError(ErrorMessages.WEBHOOK_SIGNATURE_INVALID);
    }
  }

  /**
   * Validate API key format and type
   * @throws {PaymentError} If API key is invalid
   */
  private validateApiKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new PaymentError(ErrorMessages.INVALID_API_KEY);
    }

    const keyPattern = /^(sk|pk)_(test|live)_[A-Za-z0-9]{32}$/;
    if (!keyPattern.test(apiKey)) {
      throw new PaymentError(ErrorMessages.INVALID_API_KEY);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await axios.post(
        `${DODO_API_BASE_URL}/subscriptions/${subscriptionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );
      const data = response.data as DodoApiResponse;
      
      if (data.status === 'failed') {
        throw new PaymentError(data.message || ErrorMessages.SUBSCRIPTION_NOT_FOUND);
      }
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }
}

export default DodoPaymentsService;