type EnvVars = {
  DODO_PAYMENTS_API_KEY: string | undefined;
  DODO_PAYMENTS_WEBHOOK_KEY: string | undefined;
  DODO_PRO_PRODUCT_ID: string | undefined;
  NEXT_PUBLIC_BASE_URL: string | undefined;
};

// Read environment variables
const requiredEnvVars: EnvVars = {
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
  DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  DODO_PRO_PRODUCT_ID: process.env.DODO_PRO_PRODUCT_ID,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
};

// Log environment status (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Dodo Payments Environment Status:', {
    ...Object.entries(requiredEnvVars).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value ? 'Set' : 'Not set'
    }), {}),
    NODE_ENV: process.env.NODE_ENV
  });
}

export const DODO_CONFIG = {
  // API Configuration
  API_KEY: requiredEnvVars.DODO_PAYMENTS_API_KEY || '',
  WEBHOOK_SECRET: requiredEnvVars.DODO_PAYMENTS_WEBHOOK_KEY || '',
  BASE_URL: requiredEnvVars.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

  // Product Configuration
  PRODUCTS: {
    PRO: requiredEnvVars.DODO_PRO_PRODUCT_ID || 'prod_test_dodopayments',
  },

  // Environment & Mode
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  MODE: process.env.NODE_ENV === 'development' ? 'test_mode' : 'live_mode' as const,

  // Webhook Events
  EVENTS: {
    SUBSCRIPTION_CREATED: 'subscription.created',
    SUBSCRIPTION_UPDATED: 'subscription.updated',
    SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
    PAYMENT_SUCCEEDED: 'payment.succeeded',
    PAYMENT_FAILED: 'payment.failed',
  },

  // Subscription Statuses
  STATUS: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  } as const,

  // URLs
  URLS: {
    SUCCESS: '/settings/subscription?session_id={CHECKOUT_SESSION_ID}',
    CANCEL: '/settings/subscription',
  },

  // Test values for development
  TEST: {
    API_KEY: 'sk_test_dodopayments_dev',
    WEBHOOK_SECRET: 'whsec_test_dodopayments_dev',
    PRODUCT_ID: 'prod_test_dodopayments'
  },

  // Validation
  isConfigured(): boolean {
    const apiKey = this.API_KEY || (this.IS_DEVELOPMENT ? this.TEST.API_KEY : '');
    const webhookSecret = this.WEBHOOK_SECRET || (this.IS_DEVELOPMENT ? this.TEST.WEBHOOK_SECRET : '');
    return Boolean(apiKey && webhookSecret);
  },

  // Get API key with fallback to test values in development
  getApiKey(): string {
    const key = this.API_KEY || (this.IS_DEVELOPMENT ? this.TEST.API_KEY : '');
    if (!key) {
      throw new Error('API key not configured');
    }
    return key;
  },

  // Get webhook secret with fallback to test values in development
  getWebhookSecret(): string {
    const secret = this.WEBHOOK_SECRET || (this.IS_DEVELOPMENT ? this.TEST.WEBHOOK_SECRET : '');
    if (!secret) {
      throw new Error('Webhook secret not configured');
    }
    return secret;
  }
} as const;

export type DodoMode = typeof DODO_CONFIG.MODE;
export type DodoEventType = typeof DODO_CONFIG.EVENTS[keyof typeof DODO_CONFIG.EVENTS];
export type DodoSubscriptionStatus = typeof DODO_CONFIG.STATUS[keyof typeof DODO_CONFIG.STATUS];