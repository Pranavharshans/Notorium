export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface BillingInfo {
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  customer: CustomerInfo;
  billing?: BillingInfo;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  customer: CustomerInfo;
  created_at: string;
  updated_at: string;
  payment_link?: string;
}

export interface WebhookEvent {
  id: string;
  type: 'payment.succeeded' | 'payment.failed' | 'subscription.created' | 'subscription.cancelled';
  created_at: string;
  data: {
    payment?: PaymentResponse;
    subscription?: SubscriptionResponse;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionResponse {
  id: string;
  status: 'active' | 'cancelled' | 'past_due';
  plan_id: string;
  customer_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}