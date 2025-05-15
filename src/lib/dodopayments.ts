import DodoPayments from "dodopayments";

// Check for required environment variables
const DODO_API_KEY = process.env.DODO_API_KEY;
const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode';

// Create safe initialization
let dodopayments: any = {
  subscriptions: {
    create: async () => {
      throw new Error('DodoPayments SDK not properly initialized. Check environment variables.');
    }
  }
};

// Try to initialize the SDK
try {
  if (!DODO_API_KEY) {
    console.error('Missing DODO_API_KEY environment variable');
  } else {
    dodopayments = new DodoPayments({
      bearerToken: DODO_API_KEY,
      environment: ENVIRONMENT
    });
    console.log(`DodoPayments SDK initialized in ${ENVIRONMENT} mode`);
  }
} catch (error) {
  console.error('Failed to initialize DodoPayments SDK:', error);
}

export { dodopayments };
