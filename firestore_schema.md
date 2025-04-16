# Firestore Schema

This document outlines the schema for the Firestore database used in this project.

## Collections

### 1. `users`

*   **Document ID:** `{userId}` (string, Firebase Auth UID)
*   **Fields:**

    *   `email`: string (User's email address)
    *   `displayName`: string (User's display name)
    *   `createdAt`: timestamp (When the user account was created)
    *   `updatedAt`: timestamp (Last time the user document was updated)
    *   `profile`: map
        *   `name`: string (User's full name)
        *   `city`: string (User's city)
        *   `country`: string (User's country)
        *   `state`: string (User's state)
        *   `street`: string (User's street address)
        *   `zipcode`: string (User's zip code)
    *   `settings`: map
        *   `notifications`: boolean (Whether the user has enabled notifications)
        *   `emailUpdates`: boolean (Whether the user has enabled email updates)

### 2. `subscriptions`

*   **Document ID:** `{userId}` (string, Firebase Auth UID)
*   **Fields:**

    *   `tier`: string ("free" or "pro")
    *   `subscriptionId`: string (Dodo Payments subscription ID, may be null for "free" tier)
    *   `startDate`: timestamp (When the subscription period started)
    *   `endDate`: timestamp (When the subscription period ends, may be null for "free" tier)
    *   `status`: string ("active", "cancelled", or "expired")
    *   `createdAt`: timestamp (When the subscription document was created)
    *   `updatedAt`: timestamp (Last time the subscription document was updated)
    *   `metadata`: map
        *   `userId`: string (Firebase Auth UID)
        *   `email`: string (User's email address)
        *   `name`: string (User's display name)

### 3. `usage`

*   **Document ID:** `{userId}` (string, Firebase Auth UID)
*   **Fields:**

    *   `recordingTimeUsed`: number (Minutes of recording time used in the current period)
    *   `aiActionsUsed`: number (Number of AI actions used in the current period)
    *   `lastResetDate`: timestamp (Date when the usage counts were last reset)
    *   `createdAt`: timestamp (When the usage document was created)
    *   `updatedAt`: timestamp (Last time the usage document was updated)
    *    `quotaResets`: array (History of quota resets)
         *    `date`: timestamp (When reset occurred)
         *    `reason`: string (Reason for reset, e.g., "monthly", "upgrade")

### 4. `payments`

*   **Collection Group:** `history` (Subcollection of `payments`)
    *   **Parent Document ID:** `payments/{userId}` (string, Firebase Auth UID)
    *   **Document ID:** `{paymentId}` (string, Unique payment ID)
    *   **Fields:**

        *   `id`: string (Unique payment ID)
        *   `amount`: number (Payment amount in cents/smallest currency unit)
        *   `currency`: string (Currency code, e.g., "USD")
        *   `status`: string ("succeeded", "failed", "pending", or "refunded")
        *   `type`: string ("subscription" or "one\_time")
        *   `createdAt`: timestamp (When the payment record was created)
        *   `metadata`: map
            *   `userId`: string (Firebase Auth UID)
            *   `tier`: string (Subscription tier at the time of payment)
            *   `planId`: string (Dodo Payments plan ID)

**Note:** `timestamp` refers to a Firestore Timestamp object.