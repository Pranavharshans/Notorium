# Dodo Payments Testing Guide

## Prerequisites
1. Development server running (`npm run dev`)
2. Test API keys configured in `.env.local`
3. Webhook endpoint set up

## Test Cards
Use these test card numbers in the checkout page:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Payment succeeds |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 0002 | Payment declined |

For all test cards:
- Expiry Date: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name/ZIP: Any values

## Testing Flow

### 1. Basic Payment Flow
1. Navigate to `/settings/subscription`
2. Click "Upgrade to Pro"
3. Fill in test card details
4. Complete payment
5. Verify subscription status update

### 2. Webhook Testing
```bash
# Test payment.succeeded event
dodo webhook send payment.succeeded \
  --api-key sk_test_your_test_key \
  --endpoint http://localhost:3000/api/webhooks/dodo

# Test subscription.created event
dodo webhook send subscription.created \
  --api-key sk_test_your_test_key \
  --endpoint http://localhost:3000/api/webhooks/dodo
```

### 3. Error Scenarios
1. Use declined card (4000 0000 0000 0002)
   - Verify error message display
   - Check payment status update

2. Cancel during authentication
   - Use authentication required card
   - Cancel during 3D Secure prompt
   - Verify cancellation handling

### 4. Subscription Management
1. Successfully subscribe
2. Verify Pro features access
3. Test subscription cancellation
4. Verify graceful downgrade

## Verification Points

### Frontend
- [ ] Payment form loads correctly
- [ ] Success/error messages display properly
- [ ] Loading states work
- [ ] Subscription status updates

### Backend
- [ ] Webhook signatures verify
- [ ] Payment status updates in database
- [ ] Subscription records create/update
- [ ] Error handling works

### Database
- [ ] Check payments collection
- [ ] Verify subscription records
- [ ] Confirm user status updates

## Common Issues & Debugging

1. Webhook Issues
   - Check webhook secret in .env
   - Verify endpoint URL
   - Check webhook logs

2. Payment Failures
   - Verify API key configuration
   - Check payment logs
   - Confirm currency settings

3. Subscription Issues
   - Check subscription creation payload
   - Verify product/price IDs
   - Check webhook processing

## Monitoring

1. Check payment logs:
```bash
dodo logs list --type payment
```

2. View webhook events:
```bash
dodo webhooks list
```

3. Monitor subscription status:
```bash
dodo subscriptions list