import DodoPayments from "dodopayments";
import { DODO_CONFIG } from './config';

// Debug logging for environment variables
console.log('Environment:', {
  API_KEY: DODO_CONFIG.API_KEY ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV,
  CONFIG_STATUS: {
    IS_CONFIGURED: DODO_CONFIG.isConfigured()
  }
});

// Initialize SDK with fallback to test values in development
export const dodopayments = new DodoPayments({
  bearerToken: DODO_CONFIG.getApiKey(),
  environment: DODO_CONFIG.MODE
});

// Export types and status values
export type DodoMode = 'test_mode' | 'live_mode';
export type DodoSubscriptionStatus = 'active' | 'cancelled' | 'expired';

// Re-export config and types
export { DODO_CONFIG as paymentConfig };
export * from './config';