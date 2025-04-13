import type { ClientOptions } from 'dodopayments';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type WebhookEventType = 
  | 'payment.succeeded'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.cancelled';

export interface CustomerData {
  name: string;
  email: string;
  metadata?: Record<string, unknown>;
}

export interface BillingAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  customer: CustomerData;
  billing_address?: BillingAddress;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  payment_id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  customer: CustomerData;
  billing_address?: BillingAddress;
  created: string;
  metadata?: Record<string, unknown>;
  payment_url?: string;
}

export interface WebhookEvent {
  event_id: string;
  type: WebhookEventType;
  created: string;
  data: {
    payment?: PaymentResponse;
    subscription?: SubscriptionResponse;
  };
}

export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionResponse {
  subscription_id: string;
  status: 'active' | 'cancelled' | 'past_due';
  plan_id: string;
  customer_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  metadata?: Record<string, unknown>;
}

export interface PaymentError {
  error_code: string;
  error_message: string;
  details?: Record<string, unknown>;
}

export interface DojoConfig extends ClientOptions {
  apiKey: string;
  apiUrl: string;
}