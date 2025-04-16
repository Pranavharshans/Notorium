# Subscription Implementation Plan

## Current System Gaps

### 1. Payment Service Gaps
- Missing `getSubscriptionStatus()` method to verify active subscriptions
- `cancelSubscription()` only updates metadata without proper verification
- No proper subscription status verification with Dodo Payments

### 2. Subscription Database Service Gaps
- `getSubscription()` only reads from Firebase without verification
- Automatically defaults to free tier without payment checks
- No real-time subscription status verification

### 3. Quota Service Gaps
- Relies solely on Firebase data which may be outdated
- No integration with payment verification system
- Potential for users to retain pro features after subscription expiry

## Required Solutions

### 1. Payment Service Updates

```typescript
// Add new method to verify subscription status
async getSubscriptionStatus(subscriptionId: string) {
  return {
    isActive: boolean,
    currentPeriodEnd: Date,
    status: 'active' | 'cancelled' | 'expired'
  }
}
```

### 2. Subscription Database Service Updates

```typescript
// Modify getSubscription to include payment verification
async getSubscription(userId: string) {
  // 1. Get Firebase data
  const dbData = await getFirebaseSubscription();
  
  // 2. Verify with payment provider if subscriptionId exists
  if (dbData.subscriptionId) {
    const paymentStatus = await paymentService.getSubscriptionStatus(dbData.subscriptionId);
    
    // 3. Return pro tier only if payment is verified
    if (paymentStatus.isActive) {
      return {
        tier: 'pro',
        ...dbData
      };
    }
  }
  
  // 4. Default to free tier if no active subscription
  return {
    tier: 'free',
    ...defaultFreeData
  };
}
```

### 3. Payment Processing Flow

When user makes a payment:

1. Dodo Payments processes the payment
2. Webhook endpoint receives payment notification
3. System updates Firebase:

```typescript
async function handlePaymentWebhook(webhookData) {
  if (webhookData.type === 'subscription.created') {
    const { customerId, subscriptionId, status } = webhookData;
    
    // Update subscription in Firebase
    await subscriptionDBService.updateSubscription(customerId, {
      tier: 'pro',
      subscriptionId: subscriptionId,
      status: 'active',
      startDate: new Date(),
      endDate: webhookData.currentPeriodEnd
    });

    // Reset usage quotas for new billing period
    await subscriptionDBService.resetUsage(customerId);
  }
}
```

## Implementation Flow

1. **Payment Receipt**
   - User completes payment through Dodo Payments
   - Payment service processes transaction
   - Webhook receives success notification

2. **Database Update**
   - System updates Firebase with new subscription status
   - Updates user's tier to 'pro'
   - Resets usage quotas for new billing period

3. **Access Verification**
   - On each request requiring premium features:
     - System checks Firebase for subscription data
     - Verifies subscription status with Dodo Payments
     - Grants access only if subscription is active

4. **Ongoing Monitoring**
   - Regular verification of subscription status
   - Automatic downgrade to free tier on expiry
   - Usage tracking and quota enforcement

## Benefits

- Immediate premium access after payment
- Accurate subscription tracking
- Proper verification on each request
- Automatic handling of expired subscriptions
- Clean separation of payment and access control