import axios from 'axios';
import crypto from 'crypto';
import { WebhookError, PaymentError, ErrorMessages } from './errors/subscription-errors';
import { SubscriptionTier } from './subscription-config';

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
  metadata: Record<string, string>;
  payment_link: string;
  recurring_pre_tax_amount: number;
  subscription_id: string;
}

interface DodoApiResponse extends SubscriptionResponse {
  status?: 'succeeded' | 'requires_action' | 'failed' | 'pending';
  message?: string;
}

interface DodoErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  paymentLink?: string;
  clientSecret?: string;
}

export interface WebhookPayload {
  type: string;
  data: DodoSubscriptionData;
  business_id: string;
  payment?: DodoPaymentData;
}

export interface DodoCustomer {
  customer_id: string;
  id: string;
}

export interface DodoSubscriptionData {
  customer: DodoCustomer;
  subscription_id: string;
  created_at: number;
  next_billing_date?: number;
  metadata?: {
    tier?: SubscriptionTier;
  };
}

export interface DodoPaymentData {
  id: string;
  customer: DodoCustomer;
}

interface AxiosError extends Error {
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: any;
    status: number;
    headers: Record<string, string>;
  };
  isAxiosError: boolean;
}

function isAxiosError(error: any): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
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

    this.validateApiKey(apiKey);
    
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

  public getMode(): 'test' | 'live' {
    return this.config.isTestMode ? 'test' : 'live';
  }

  public static getInstance(): DodoPaymentsService {
    if (!DodoPaymentsService.instance) {
      DodoPaymentsService.instance = new DodoPaymentsService();
    }
    return DodoPaymentsService.instance;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Api-Version': API_VERSION,
      'X-Client-Mode': this.getMode()
    };
  }

  private formatPrice(price: number): number {
    return Math.round(price * 100);
  }

  async createProduct(name: string, price: number, interval: 'month' | 'year'): Promise<SubscriptionResponse> {
    try {
      const response = await axios.post<SubscriptionResponse>(
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
    } catch (error: any) {
      console.error('Failed to create product:', error);
      if (isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as DodoErrorResponse;
        throw new PaymentError(errorData.message);
      }
      throw error;
    }
  }

  async createSubscription(
    userId: string,
    price: number,
    billing: BillingInfo,
    customer: Partial<CustomerInfo> = {}
  ): Promise<CheckoutSession> {
    try {
      const response = await axios.post<DodoApiResponse>(
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

      const data = response.data;
      
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
      if (isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as DodoErrorResponse;
        throw new PaymentError(errorData.message);
      }
      throw new PaymentError(ErrorMessages.SUBSCRIPTION_CREATION_FAILED);
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<DodoApiResponse> {
    try {
      const response = await axios.get<DodoApiResponse>(
        `${DODO_API_BASE_URL}/subscriptions/${subscriptionId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  verifyWebhook(payload: WebhookPayload, signature: string, timestamp: string): boolean {
    try {
      const timestampMs = parseInt(timestamp, 10) * 1000;
      const now = Date.now();
      const tolerance = 5 * 60 * 1000;

      if (Math.abs(now - timestampMs) > tolerance) {
        throw new WebhookError(ErrorMessages.WEBHOOK_SIGNATURE_INVALID + ': Timestamp expired');
      }

      const signaturePayload = `${timestamp}.${JSON.stringify(payload)}`;
      
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(signaturePayload)
        .digest('hex');

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

  private validateApiKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new PaymentError(ErrorMessages.INVALID_API_KEY);
    }

    const keyPattern = /^(sk|pk)_(test|live)_[A-Za-z0-9]{32}$/;
    if (!keyPattern.test(apiKey)) {
      throw new PaymentError(ErrorMessages.INVALID_API_KEY);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await axios.post<DodoApiResponse>(
        `${DODO_API_BASE_URL}/subscriptions/${subscriptionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );
      const data = response.data;
      
      if (data.status === 'failed') {
        throw new PaymentError(data.message || ErrorMessages.SUBSCRIPTION_NOT_FOUND);
      }
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      if (isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as DodoErrorResponse;
        throw new PaymentError(errorData.message);
      }
      throw error;
    }
  }
}

export default DodoPaymentsService;