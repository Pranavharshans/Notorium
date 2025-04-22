import DodoPayments from "dodopayments";

if (!process.env.DODO_API_KEY_TEST) {
  throw new Error('Missing DODO_API_KEY_TEST environment variable');
}

export const dodopayments = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY_TEST,
  environment: "test_mode"
});

console.log('Dodo Payments client initialized in test mode');
