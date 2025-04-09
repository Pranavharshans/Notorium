# Dojo Payments Integration and Subscription Plans

## Subscription Plans

### Free Tier
- 5 AI-generated notes per month
- Basic note editing features
- 30-minute max lecture transcription
- 100MB storage limit
- Community support

### Pro Tier ($9.99/month)
- 50 AI-generated notes per month
- Advanced note editing features
- 2-hour max lecture transcription
- 1GB storage limit
- Email support
- Priority processing

### Enterprise Tier ($29.99/month)
- Unlimited AI-generated notes
- Premium note editing features
- Unlimited lecture transcription
- 10GB storage limit
- Priority support
- Custom AI model training
- Team collaboration features

## Dojo Payments Integration

### 1. Setup Requirements
```bash
npm install @dojo/payments-sdk
```

### 2. Environment Variables
```env
DOJO_API_KEY=your_api_key
DOJO_CLIENT_ID=your_client_id
DOJO_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Payment Service Implementation
```typescript
// src/lib/payment-service.ts

import { DojoClient } from '@dojo/payments-sdk';

export class PaymentService {
  private client: DojoClient;

  constructor() {
    this.client = new DojoClient({
      apiKey: process.env.DOJO_API_KEY,
      clientId: process.env.DOJO_CLIENT_ID,
    });
  }

  async createSubscription(userId: string, planId: string) {
    try {
      const subscription = await this.client.subscriptions.create({
        customerId: userId,
        planId: planId,
        paymentMethod: {
          type: 'card',
        },
      });
      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      await this.client.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw error;
    }
  }
}
```

### 4. Usage Quota Implementation
```typescript
// src/lib/quota-service.ts

import { db } from './firebase';

export class QuotaService {
  async checkUserQuota(userId: string, feature: string): Promise<boolean> {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const plan = userData.subscription.plan;

    const quotaLimits = {
      free: {
        aiNotes: 5,
        transcriptionMinutes: 30,
        storage: 100 * 1024 * 1024, // 100MB
      },
      pro: {
        aiNotes: 50,
        transcriptionMinutes: 120,
        storage: 1024 * 1024 * 1024, // 1GB
      },
      enterprise: {
        aiNotes: Infinity,
        transcriptionMinutes: Infinity,
        storage: 10 * 1024 * 1024 * 1024, // 10GB
      },
    };

    const usage = await this.getUserUsage(userId, feature);
    return usage < quotaLimits[plan][feature];
  }

  async incrementUsage(userId: string, feature: string) {
    await db.collection('usage').doc(userId).update({
      [feature]: firebase.firestore.FieldValue.increment(1),
    });
  }
}
```

### 5. Webhook Handler
```typescript
// src/app/api/webhooks/dojo/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const payload = await request.json();
  const signature = request.headers.get('dojo-signature');

  // Verify webhook signature
  const isValid = verifyWebhookSignature(
    payload,
    signature,
    process.env.DOJO_WEBHOOK_SECRET
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Handle different webhook events
  switch (payload.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(payload);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(payload);
      break;
    case 'payment.failed':
      await handlePaymentFailed(payload);
      break;
  }

  return NextResponse.json({ received: true });
}
```

### 6. Frontend Integration
```typescript
// src/components/subscription/PaymentForm.tsx

import { useState } from 'react';
import { useDojoElements } from '@dojo/payments-react';

export function PaymentForm({ planId }) {
  const { elements } = useDojoElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { token } = await elements.submit();
      await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, token }),
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div id="dojo-card-element" />
      <button type="submit" disabled={loading}>
        Subscribe
      </button>
    </form>
  );
}
```

## Implementation Steps

1. **Initial Setup**
   - Create Dojo merchant account
   - Configure webhook endpoints
   - Set up environment variables

2. **Database Schema Updates**
   - Add subscription and usage tracking tables
   - Implement quota tracking system
   - Set up usage analytics

3. **Backend Implementation**
   - Implement payment service
   - Set up webhook handlers
   - Create quota management system
   - Add subscription management endpoints

4. **Frontend Implementation**
   - Create subscription UI components
   - Implement payment form
   - Add usage tracking displays
   - Create upgrade prompts

5. **Testing**
   - Test payment processing
   - Verify webhook handling
   - Check quota enforcement
   - Test subscription lifecycle

6. **Monitoring**
   - Set up payment monitoring
   - Track subscription metrics
   - Monitor quota usage
   - Set up alerts for failures

## Security Considerations

1. **Payment Data**
   - Never store raw credit card data
   - Use Dojo's tokenization
   - Implement proper error handling
   - Secure webhook endpoints

2. **Quota Management**
   - Implement server-side quota checks
   - Use atomic operations for usage tracking
   - Add rate limiting
   - Monitor for abuse

3. **Access Control**
   - Verify subscription status
   - Implement proper authentication
   - Check feature access rights
   - Log access attempts

## Deployment Checklist

- [ ] Configure production environment variables
- [ ] Set up webhook URLs
- [ ] Update database schemas
- [ ] Configure monitoring
- [ ] Test payment flow
- [ ] Verify quota enforcement
- [ ] Set up error tracking
- [ ] Configure backup systems