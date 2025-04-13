/**
 * SDK Type Mappings
 * This file contains interfaces that map our domain types to the SDK's expected types
 */

export interface DodoCustomerRequest {
  name: string;
  email: string;
  extraData?: Record<string, string>;
}

export interface DodoPaymentRequest {
  amount: number;
  currency: string;
  customer: DodoCustomerRequest;
  extraData?: Record<string, string>;
  returnUrl: string;
}

export interface DodoSubscriptionRequest {
  customerId: string;
  planId: string;
  extraData?: Record<string, string>;
}

export interface DodoResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// SDK response type augmentations
declare module 'dodopayments' {
  interface PaymentCreateResponse {
    id: string;
    status: string;
    amount: number;
    currency: string;
    customerId: string;
    paymentUrl?: string;
    extraData?: Record<string, string>;
  }

  interface Payment {
    id: string;
    status: string;
    amount: number;
    currency: string;
    customerId: string;
    created: string;
    extraData?: Record<string, string>;
  }

  interface CustomerCreateResponse {
    id: string;
    name: string;
    email: string;
    extraData?: Record<string, string>;
  }

  interface SubscriptionCreateResponse {
    id: string;
    status: string;
    customerId: string;
    planId: string;
    currentPeriodEnd: string;
    extraData?: Record<string, string>;
  }
}