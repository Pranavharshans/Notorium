import DodoPayments from "dodopayments";

if (!process.env.DODO_API_KEY) {
  throw new Error('Missing DODO_API_KEY environment variable');
}

export const dodopayments = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY,
  environment: "live_mode"
});
