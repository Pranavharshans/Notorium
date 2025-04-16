type EnvVars = {
  DODO_PAYMENTS_API_KEY: string | undefined;
  DODO_PAYMENTS_WEBHOOK_KEY: string | undefined;
  DODO_PRO_PRODUCT_ID: string | undefined;
  NEXT_PUBLIC_BASE_URL: string | undefined;
};

type DodoEvents = {
  SUBSCRIPTION_CREATED: 'subscription.created';
  SUBSCRIPTION_UPDATED: 'subscription.updated';
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled';
  SUBSCRIPTION_TRIAL_ENDING: 'subscription.trial_ending';
  SUBSCRIPTION_TRIAL_ENDED: 'subscription.trial_ended';
  PAYMENT_SUCCEEDED: 'payment.succeeded';
  PAYMENT_FAILED: 'payment.failed';
};

type DodoStatus = {
  ACTIVE: 'active';
  CANCELLED: 'cancelled';
  EXPIRED: 'expired';
  ON_HOLD: 'on_hold';
  TRIAL: 'trial';
};

type DodoConfig = {
  API_KEY: string;
  WEBHOOK_SECRET: string;
  BASE_URL: string;
  PRODUCTS: {
    PRO: string;
  };
  IS_DEVELOPMENT: boolean;
  MODE: 'test_mode' | 'live_mode';
  EVENTS: DodoEvents;
  STATUS: DodoStatus;
  TEST: {
    API_KEY: string;
    WEBHOOK_SECRET: string;
    PRODUCT_ID: string;
  };
  isConfigured(): boolean;
  getApiKey(): string;
  getWebhookSecret(): string;
  mapSubscriptionStatus(dodoStatus: string): keyof DodoStatus;
  URLS: {
    SUCCESS: string;
    CANCEL: string;
  };
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

export const DODO_CONFIG: DodoConfig = {
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
    SUBSCRIPTION_TRIAL_ENDING: 'subscription.trial_ending',
    SUBSCRIPTION_TRIAL_ENDED: 'subscription.trial_ended',
    PAYMENT_SUCCEEDED: 'payment.succeeded',
    PAYMENT_FAILED: 'payment.failed',
  },

  // Subscription Statuses
  STATUS: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    ON_HOLD: 'on_hold',
    TRIAL: 'trial',
  } as const,

  // Maps Dodo payment status to our status
  mapSubscriptionStatus(dodoStatus: string): keyof typeof DODO_CONFIG.STATUS {
    switch (dodoStatus) {
      case 'active':
        return 'ACTIVE';
      case 'on_hold':
      case 'paused':
        return 'ON_HOLD';
      case 'trial':
        return 'TRIAL';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'EXPIRED';
    }
  },

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
    // In development, prefer TEST API key if available
    if (this.IS_DEVELOPMENT && this.TEST.API_KEY) {
      return this.TEST.API_KEY;
    }
    
    // Otherwise use the main API key
    if (this.API_KEY) {
      return this.API_KEY;
    }
    
    throw new Error('Dodo Payments API key not configured. Please check your environment variables.');
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