# Dodo Payments Testing Guide

This guide will help you test the payment integration with Dodo Payments in your Notorium application.

## Prerequisites

Before you begin, make sure you have the following set up:

1. Environment variables properly configured:
   ```
   DODO_API_KEY_TEST=your_test_api_key
   DODO_PAYMENTS_WEBHOOK_KEY=your_webhook_secret_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. Ensure you have products set up in your Dodo Payments test account
3. Node.js and npm/yarn installed
4. Your Next.js application running locally on port 3000

## Testing Scripts

We've provided three testing scripts to help you test different aspects of the payment system:

### 1. Direct SDK Testing

This script tests the direct integration with the Dodo Payments SDK.

```bash
# Make the script executable
chmod +x src/scripts/test-payments.ts

# Run the script
npx ts-node src/scripts/test-payments.ts
```

This script will:
- List all products from your Dodo Payments account
- Allow you to select a product to test with
- Create a test subscription with a payment link
- Let you complete the payment flow in your browser
- Test subscription management (status updates, cancellation)

### 2. Webhook Testing

This script tests the webhook handling functionality.

```bash
# Make the script executable
chmod +x src/scripts/test-webhooks.ts

# In one terminal, start your Next.js application
npm run dev

# In another terminal, run the webhook test script
npx ts-node src/scripts/test-webhooks.ts
```

This script will:
- Generate signed mock webhook events for various subscription statuses
- Send them to your local webhook endpoint
- Verify the response and processing

### 3. API Endpoint Testing

This script tests your application's payment-related API endpoints.

```bash
# Make the script executable
chmod +x src/scripts/test-payment-api.ts

# In one terminal, start your Next.js application
npm run dev

# In another terminal, run the API test script
npx ts-node src/scripts/test-payment-api.ts
```

This script will:
- Test authentication
- Test the product listing API
- Test subscription creation
- Test the customer portal
- Test subscription cancellation

## Manual Testing Checklist

For thorough testing, also perform these manual checks:

### Subscription Flow
1. ☐ Navigate to the pricing page
2. ☐ Select a subscription plan
3. ☐ Fill in billing details
4. ☐ Complete the payment form
5. ☐ Verify successful subscription activation
6. ☐ Verify Firebase quota updates

### Customer Management
1. ☐ Access the customer portal
2. ☐ Update payment method
3. ☐ View subscription details
4. ☐ View billing history

### Subscription Management
1. ☐ Cancel a subscription
2. ☐ Verify cancellation reflected in the UI
3. ☐ Verify cancellation reflected in Dodo Payments dashboard
4. ☐ Verify quota updates after cancellation

### Webhook Handling
1. ☐ Use the Dodo Payments dashboard to trigger various events
2. ☐ Verify proper handling of each event type
3. ☐ Check logs for any errors

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check that the `DODO_PAYMENTS_WEBHOOK_KEY` matches the one in your Dodo Payments dashboard
   - Ensure the webhook is being sent with the correct headers

2. **Authentication Issues**
   - Verify that your test user is properly created in Firebase
   - Check that session cookies are being set correctly

3. **Product Not Found**
   - Verify products exist in your Dodo Payments test account
   - Check product visibility settings

## Test Card Information

For testing payments, use these test cards:

- **Successful Payment**: 4242 4242 4242 4242
- **Payment Requires Authentication**: 4000 0027 6000 3184
- **Payment Declined**: 4000 0000 0000 0002

Card expiration: Any future date
CVC: Any 3 digits
Postal code: Any valid postal code

## Switching to Production

When you're ready to switch to production:

1. Update environment variables:
   ```
   DODO_API_KEY=your_live_api_key (not the test key)
   ```

2. Update the Dodo Payments client initialization:
   ```typescript
   export const dodopayments = new DodoPayments({
     bearerToken: process.env.DODO_API_KEY,
     environment: "live_mode" // Changed from test_mode
   });
   ```

3. Update webhook endpoints in the Dodo Payments dashboard to point to your production URL 