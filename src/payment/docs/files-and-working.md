# Project Structure and File Documentation

## File Tree
```
src/
├── app/
│   ├── api/
│   │   ├── checkout/              # Payment Routes
│   │   │   ├── onetime/
│   │   │   │   └── route.ts       # One-time payment
│   │   │   └── subscription/
│   │   │       └── route.ts       # Subscription payment
│   │   ├── customer-portal/
│   │   │   └── route.ts          # Customer management
│   │   ├── subscription/
│   │   │   └── cancel/
│   │   │       └── route.ts      # Cancel subscription
│   │   ├── webhook/
│   │   │   └── route.ts          # Payment webhooks
│   │   ├── products/
│   │   │   └── route.ts          # Product management
│   │   ├── auth/
│   │   │   └── session/
│   │   │       └── route.ts      # Auth session management
│   │   ├── middleware.ts         # API middleware
│   │   └── firebase-config/
│   │       └── route.ts          # Firebase configuration
│   │
│   ├── components/
│   │   ├── CancelSubscription.tsx # Cancel UI
│   │   ├── ProductCard.tsx        # Product display
│   │   ├── SignOutButton.tsx     # Auth UI
│   │   └── SubscriptionStatus.tsx # Status display
│   │
│   └── auth/                     # Auth pages
│       ├── signin/
│       └── signup/
│
├── hooks/
│   └── useSubscription.ts        # Subscription hook
│
├── lib/
│   ├── dodopayments.ts          # Dodo client setup
│   ├── subscription-utils.ts     # Subscription helpers
│   ├── firebase-admin.ts        # Firebase admin setup
│   └── firebase.ts              # Firebase client setup
│
└── middleware.ts                # Global middleware
```

## File Details

### Core Configuration Files

1. **src/lib/dodopayments.ts**
   - Purpose: Initializes and configures Dodo Payments client
   - Functions: 
     - Creates DodoPayments instance with API key
     - Configures environment (test/production)

2. **src/lib/firebase.ts**
   - Purpose: Firebase client-side configuration
   - Functions:
     - Initializes Firebase app for client-side use
     - Provides authentication and Firestore instances

3. **src/lib/firebase-admin.ts**
   - Purpose: Firebase server-side configuration
   - Functions:
     - Initializes Firebase Admin SDK
     - Provides admin access to Firestore and Auth

### Middleware Files

1. **src/middleware.ts**
   - Purpose: Global route protection and authentication
   - Functions:
     - Allows webhook endpoints to bypass auth
     - Protects checkout routes
     - Validates session cookies
     - Returns 401 for unauthenticated requests

2. **src/app/api/middleware.ts**
   - Purpose: API-specific Firebase connection validation
   - Functions:
     - Tests Firebase Admin SDK connection
     - Prevents API execution if Firebase fails
     - Returns 500 error on initialization failure

### API Routes

1. **src/app/api/checkout/subscription/route.ts**
   - Purpose: Handle subscription creation
   - Functions:
     - Validates user session
     - Creates subscription with Dodo Payments
     - Stores subscription data in Firestore

2. **src/app/api/checkout/onetime/route.ts**
   - Purpose: Handle one-time payments
   - Functions:
     - Processes single payments
     - Creates payment records

3. **src/app/api/webhook/route.ts**
   - Purpose: Handle Dodo Payments webhooks
   - Functions:
     - Verifies webhook signatures
     - Updates subscription statuses
     - Processes payment events

4. **src/app/api/subscription/cancel/route.ts**
   - Purpose: Handle subscription cancellations
   - Functions:
     - Cancels active subscriptions
     - Updates status in Firestore

### Utility Files

1. **src/lib/subscription-utils.ts**
   - Purpose: Manage subscription data in Firestore
   - Functions:
     - storeSubscriptionData: Saves new subscriptions
     - updateSubscriptionStatus: Updates existing subscriptions
     - Handles all Firestore operations for subscriptions

### React Components

1. **src/app/components/ProductCard.tsx**
   - Purpose: Display product information
   - Functions:
     - Shows product details
     - Handles checkout initiation

2. **src/app/components/SubscriptionStatus.tsx**
   - Purpose: Show subscription status
   - Functions:
     - Displays current subscription state
     - Shows billing information
     - Indicates subscription status (active/cancelled)

3. **src/app/components/CancelSubscription.tsx**
   - Purpose: Subscription cancellation UI
   - Functions:
     - Provides cancellation interface
     - Handles cancellation requests
     - Shows confirmation dialogs

### Hooks

1. **src/hooks/useSubscription.ts**
   - Purpose: Real-time subscription data management
   - Functions:
     - Provides real-time subscription updates
     - Manages loading and error states
     - Returns subscription status and data
     - Handles cleanup on unmount
     - Updates on user authentication changes

Each file in this structure plays a specific role in the payment integration system, from handling payments and subscriptions to managing user interface and data storage. The modular organization allows for easy maintenance and scalability.