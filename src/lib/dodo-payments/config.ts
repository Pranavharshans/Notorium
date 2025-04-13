interface PaymentConfig {
  apiKey: string;
  apiUrl: string;
  webhookSecret: string;
  returnUrl: string;
  productIds: {
    pro: string;
  };
  environment: 'test' | 'production';
}

export const paymentConfig: PaymentConfig = {
  apiKey: process.env.DODO_PAYMENTS_API_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_DODO_API_URL || 'https://test.dodopayments.com',
  webhookSecret: process.env.DODO_WEBHOOK_SECRET || '',
  returnUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  productIds: {
    pro: process.env.DODO_PRO_PRODUCT_ID || '',
  },
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
};

export const API_ENDPOINTS = {
  payments: {
    create: '/v1/payments',
    retrieve: (id: string) => `/v1/payments/${id}`,
    list: '/v1/payments',
  },
  subscriptions: {
    create: '/v1/subscriptions',
    cancel: (id: string) => `/v1/subscriptions/${id}`,
    retrieve: (id: string) => `/v1/subscriptions/${id}`,
  },
  customers: {
    create: '/v1/customers',
    update: (id: string) => `/v1/customers/${id}`,
    retrieve: (id: string) => `/v1/customers/${id}`,
  },
};

export const WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    features: [
      '5 AI-generated notes per month',
      'Basic note editing features',
      '30-minute max lecture transcription',
      '100MB storage limit',
      'Community support',
    ],
    price: 0,
  },
  PRO: {
    name: 'Pro',
    features: [
      '50 AI-generated notes per month',
      'Advanced note editing features',
      '2-hour max lecture transcription',
      '1GB storage limit',
      'Email support',
      'Priority processing',
    ],
    price: 9.99,
    productId: paymentConfig.productIds.pro,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    features: [
      'Unlimited AI-generated notes',
      'Premium note editing features',
      'Unlimited lecture transcription',
      '10GB storage limit',
      'Priority support',
      'Custom AI model training',
      'Team collaboration features',
    ],
    price: 29.99,
  },
};