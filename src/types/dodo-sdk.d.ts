// Server-side SDK
declare module "dodopayments" {
  export interface DodoOptions {
    bearerToken?: string;
    environment?: 'test_mode' | 'live_mode';
  }

  export interface BillingDetails {
    city: string;
    country: string;
    state: string;
    street: string;
    zipcode: string;
  }

  export interface CustomerDetails {
    email: string;
    name: string;
  }

  export interface Subscription {
    subscription_id: string;
    status: 'active' | 'inactive' | 'past_due' | 'cancelled';
    current_period_end: string;
    metadata?: {
      userId?: string;
      [key: string]: any;
    };
  }

  export interface SubscriptionResponse {
    subscription_id: string;
    payment_link?: string;
    status: Subscription['status'];
  }

  export interface SubscriptionListResponse {
    items: Subscription[];
    total: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  }

  export default class DodoPayments {
    constructor(options: DodoOptions);

    subscriptions: {
      create(params: {
        billing: BillingDetails;
        customer: CustomerDetails;
        payment_link: boolean;
        product_id: string;
        quantity: number;
        return_url: string;
        metadata?: Record<string, any>;
      }): Promise<SubscriptionResponse>;

      list(): Promise<SubscriptionListResponse>;
    };

    products: {
      list(): Promise<any>;
    };
  }
}

// Client-side SDK
interface DodoClientSDK {
  initializePayments(config: {
    environment?: 'test' | 'live';
  }): void;

  createPaymentMethod(options: {
    type: 'card'
  }): Promise<{
    paymentMethodId: string;
  }>;
}

declare global {
  interface Window {
    dodo: DodoClientSDK;
  }
}