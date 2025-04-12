# Introduction

> Welcome to the Dodo Payments API. Our APIs makes it easy to integrate secure, scalable, and versatile payment solutions into your applications.

## Overview

Dodo Payments provides a comprehensive RESTful API that enables you to integrate payment processing, subscription management, and other features into your applications. This documentation will guide you through our APIs and help you implement our services effectively.

<CardGroup cols={2}>
  <Card title="Integration Tutorial" icon="graduation-cap" href="/api-reference/integration-tutorial">
    Step-by-step guide to integrate Dodo Payments
  </Card>

  <Card title="SDKs & Libraries" icon="code" href="/api-reference/dodo-payments-sdks">
    Official SDKs and client libraries
  </Card>

  <Card title="Webhooks Guide" icon="bell" href="/api-reference/webhooks/intents/webhook-events-guide">
    Real-time event notifications
  </Card>

  <Card title="Technical FAQs" icon="question" href="/api-reference/technical-faqs">
    Common technical questions
  </Card>
</CardGroup>

## Authentication

All API requests require authentication using your API keys. You can find your API keys in the [Dodo Payments Dashboard](https://dashboard.dodopayments.com/settings/api-keys).

<CodeGroup>
  ```bash Test Mode
  Authorization: Bearer sk_test_your_test_key
  ```

  ```bash Live Mode
  Authorization: Bearer sk_live_your_live_key
  ```
</CodeGroup>

<Warning>
  Never expose your secret API keys in client-side code or public repositories. Always use test keys for development and testing.
</Warning>

## Environment URLs

Use the appropriate base URL for your environment:

* Test Mode: [`https://test.dodopayments.com`](https://test.dodopayments.com)
* Live Mode: [`https://live.dodopayments.com`](https://live.dodopayments.com)

Learn more about [Test Mode vs Live Mode](/miscellaneous/test-mode-vs-live-mode).

## Core Concepts

Before diving into the API, familiarize yourself with these core concepts:

<CardGroup cols={2}>
  <Card title="Products" icon="box" href="/api-reference/managing-products">
    Create and manage your product catalog
  </Card>

  <Card title="Payments" icon="credit-card" href="/api-reference/integration-guide">
    Process one-time payments
  </Card>

  <Card title="Subscriptions" icon="repeat" href="/api-reference/subscription-integration-guide">
    Handle recurring payments
  </Card>

  <Card title="Customers" icon="users" href="/api-reference/customers/create-customer">
    Manage customer data
  </Card>
</CardGroup>

## Integration Steps

Follow these steps to integrate Dodo Payments:

<Steps>
  1. [Set up your account](/quickstart) and get your API keys
  2. Choose your integration method:
     * [Follow our tutorial](/api-reference/integration-tutorial)
     * [Use our SDKs](/api-reference/dodo-payments-sdks)
     * [Direct API integration](/api-reference/integration-guide)
  3. [Set up webhooks](/api-reference/webhooks/intents/webhook-events-guide) for real-time updates
  4. [Test your integration](/miscellaneous/testing-process)
  5. Go live!
</Steps>

## Need Help?

* Check our [Technical FAQs](/api-reference/technical-faqs)
* Contact [Developer Support](/miscellaneous/help-support)

## API Status

Monitor our API status and get real-time updates:
[status.dodopayments.com](https://status.dodopayments.com)

<Note>
  Our API implements rate limiting to ensure stable service for all users.
</Note>

## What's Next?

<CardGroup cols={2}>
  <Card title="Quick Integration" icon="bolt" href="/api-reference/integration-tutorial">
    Follow our step-by-step tutorial
  </Card>

  <Card title="API Explorer" icon="compass" href="/api-reference/payments/get-payments">
    Browse all available endpoints
  </Card>
</CardGroup>


# Introduction

> Welcome to the Dodo Payments API. Our APIs makes it easy to integrate secure, scalable, and versatile payment solutions into your applications.

## Overview

Dodo Payments provides a comprehensive RESTful API that enables you to integrate payment processing, subscription management, and other features into your applications. This documentation will guide you through our APIs and help you implement our services effectively.

<CardGroup cols={2}>
  <Card title="Integration Tutorial" icon="graduation-cap" href="/api-reference/integration-tutorial">
    Step-by-step guide to integrate Dodo Payments
  </Card>

  <Card title="SDKs & Libraries" icon="code" href="/api-reference/dodo-payments-sdks">
    Official SDKs and client libraries
  </Card>

  <Card title="Webhooks Guide" icon="bell" href="/api-reference/webhooks/intents/webhook-events-guide">
    Real-time event notifications
  </Card>

  <Card title="Technical FAQs" icon="question" href="/api-reference/technical-faqs">
    Common technical questions
  </Card>
</CardGroup>

## Authentication

All API requests require authentication using your API keys. You can find your API keys in the [Dodo Payments Dashboard](https://dashboard.dodopayments.com/settings/api-keys).

<CodeGroup>
  ```bash Test Mode
  Authorization: Bearer sk_test_your_test_key
  ```

  ```bash Live Mode
  Authorization: Bearer sk_live_your_live_key
  ```
</CodeGroup>

<Warning>
  Never expose your secret API keys in client-side code or public repositories. Always use test keys for development and testing.
</Warning>

## Environment URLs

Use the appropriate base URL for your environment:

* Test Mode: [`https://test.dodopayments.com`](https://test.dodopayments.com)
* Live Mode: [`https://live.dodopayments.com`](https://live.dodopayments.com)

Learn more about [Test Mode vs Live Mode](/miscellaneous/test-mode-vs-live-mode).

## Core Concepts

Before diving into the API, familiarize yourself with these core concepts:

<CardGroup cols={2}>
  <Card title="Products" icon="box" href="/api-reference/managing-products">
    Create and manage your product catalog
  </Card>

  <Card title="Payments" icon="credit-card" href="/api-reference/integration-guide">
    Process one-time payments
  </Card>

  <Card title="Subscriptions" icon="repeat" href="/api-reference/subscription-integration-guide">
    Handle recurring payments
  </Card>

  <Card title="Customers" icon="users" href="/api-reference/customers/create-customer">
    Manage customer data
  </Card>
</CardGroup>

## Integration Steps

Follow these steps to integrate Dodo Payments:

<Steps>
  1. [Set up your account](/quickstart) and get your API keys
  2. Choose your integration method:
     * [Follow our tutorial](/api-reference/integration-tutorial)
     * [Use our SDKs](/api-reference/dodo-payments-sdks)
     * [Direct API integration](/api-reference/integration-guide)
  3. [Set up webhooks](/api-reference/webhooks/intents/webhook-events-guide) for real-time updates
  4. [Test your integration](/miscellaneous/testing-process)
  5. Go live!
</Steps>

## Need Help?

* Check our [Technical FAQs](/api-reference/technical-faqs)
* Contact [Developer Support](/miscellaneous/help-support)

## API Status

Monitor our API status and get real-time updates:
[status.dodopayments.com](https://status.dodopayments.com)

<Note>
  Our API implements rate limiting to ensure stable service for all users.
</Note>

## What's Next?

<CardGroup cols={2}>
  <Card title="Quick Integration" icon="bolt" href="/api-reference/integration-tutorial">
    Follow our step-by-step tutorial
  </Card>

  <Card title="API Explorer" icon="compass" href="/api-reference/payments/get-payments">
    Browse all available endpoints
  </Card>
</CardGroup>

# Introduction

> Welcome to the Dodo Payments API. Our APIs makes it easy to integrate secure, scalable, and versatile payment solutions into your applications.

## Overview

Dodo Payments provides a comprehensive RESTful API that enables you to integrate payment processing, subscription management, and other features into your applications. This documentation will guide you through our APIs and help you implement our services effectively.

<CardGroup cols={2}>
  <Card title="Integration Tutorial" icon="graduation-cap" href="/api-reference/integration-tutorial">
    Step-by-step guide to integrate Dodo Payments
  </Card>

  <Card title="SDKs & Libraries" icon="code" href="/api-reference/dodo-payments-sdks">
    Official SDKs and client libraries
  </Card>

  <Card title="Webhooks Guide" icon="bell" href="/api-reference/webhooks/intents/webhook-events-guide">
    Real-time event notifications
  </Card>

  <Card title="Technical FAQs" icon="question" href="/api-reference/technical-faqs">
    Common technical questions
  </Card>
</CardGroup>

## Authentication

All API requests require authentication using your API keys. You can find your API keys in the [Dodo Payments Dashboard](https://dashboard.dodopayments.com/settings/api-keys).

<CodeGroup>
  ```bash Test Mode
  Authorization: Bearer sk_test_your_test_key
  ```

  ```bash Live Mode
  Authorization: Bearer sk_live_your_live_key
  ```
</CodeGroup>

<Warning>
  Never expose your secret API keys in client-side code or public repositories. Always use test keys for development and testing.
</Warning>

## Environment URLs

Use the appropriate base URL for your environment:

* Test Mode: [`https://test.dodopayments.com`](https://test.dodopayments.com)
* Live Mode: [`https://live.dodopayments.com`](https://live.dodopayments.com)

Learn more about [Test Mode vs Live Mode](/miscellaneous/test-mode-vs-live-mode).

## Core Concepts

Before diving into the API, familiarize yourself with these core concepts:

<CardGroup cols={2}>
  <Card title="Products" icon="box" href="/api-reference/managing-products">
    Create and manage your product catalog
  </Card>

  <Card title="Payments" icon="credit-card" href="/api-reference/integration-guide">
    Process one-time payments
  </Card>

  <Card title="Subscriptions" icon="repeat" href="/api-reference/subscription-integration-guide">
    Handle recurring payments
  </Card>

  <Card title="Customers" icon="users" href="/api-reference/customers/create-customer">
    Manage customer data
  </Card>
</CardGroup>

## Integration Steps

Follow these steps to integrate Dodo Payments:

<Steps>
  1. [Set up your account](/quickstart) and get your API keys
  2. Choose your integration method:
     * [Follow our tutorial](/api-reference/integration-tutorial)
     * [Use our SDKs](/api-reference/dodo-payments-sdks)
     * [Direct API integration](/api-reference/integration-guide)
  3. [Set up webhooks](/api-reference/webhooks/intents/webhook-events-guide) for real-time updates
  4. [Test your integration](/miscellaneous/testing-process)
  5. Go live!
</Steps>

## Need Help?

* Check our [Technical FAQs](/api-reference/technical-faqs)
* Contact [Developer Support](/miscellaneous/help-support)

## API Status

Monitor our API status and get real-time updates:
[status.dodopayments.com](https://status.dodopayments.com)

<Note>
  Our API implements rate limiting to ensure stable service for all users.
</Note>

## What's Next?

<CardGroup cols={2}>
  <Card title="Quick Integration" icon="bolt" href="/api-reference/integration-tutorial">
    Follow our step-by-step tutorial
  </Card>

  <Card title="API Explorer" icon="compass" href="/api-reference/payments/get-payments">
    Browse all available endpoints
  </Card>
</CardGroup>



# Subscription Integration Guide

> This guide will help you integrate the Dodo Payments Subscription Product into your website.

## Prerequisites

To integrate the Dodo Payments API, you'll need:

* A Dodo Payments merchant account
* API credentials (API key and webhook secret key) from the dashboard

If you don't have an account yet, you can get your business approved by [contacting the founder](https://demo.dodopayments.com/) or by filling out this [form](https://dodopayments.com/early-access).

For a more detailed guide on the prerequisites, check this [section](/api-reference/integration-guide#dashboard-setup).

## API Integration

### Payment Links

Dodo Payments supports two types of payment links:

#### 1. Static Payment Links

[Detailed Guide](/api-reference/integration-guide#1-static-payment-links)

#### 2. Dynamic Payment Links

Created via API call or our SDK with customer details. Here's an example:

There are two APIs for creating dynamic payment links:

* **Subscription Payment Link API** - [API reference](/api-reference/subscriptions/post-subscriptions)
* **One-time Payment Link API** - [API reference](/api-reference/payments/post-payments)

The guide below focuses on subscription payment link creation.

For detailed instructions on integrating one-time products, refer to this [One-time Integration Guide](/api-reference/integration-guide).

<Info>Make sure you are passing `payment_link = true` to get payment link </Info>

<Tabs>
  <Tab title="Node.js SDK">
    ```javascript
    import DodoPayments from 'dodopayments';

    const client = new DodoPayments({
    bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted
    });

    async function main() {
    const subscription = await client.subscriptions.create({
    billing: { city: 'city', country: 'IN', state: 'state', street: 'street', zipcode: 89789 },
    customer: { customer_id: 'customer_id' },
    product_id: 'product_id',
    payment_link: true,
    return_url: 'https://example.com/success',
    quantity: 1,
    });

    console.log(subscription.subscription_id);
    }

    main();
    ```
  </Tab>

  <Tab title="Python SDK">
    ```python
    import os
    from dodopayments import DodoPayments

    client = DodoPayments(
      bearer_token=os.environ.get("DODO_PAYMENTS_API_KEY"),  # This is the default and can be omitted
    )
    subscription = client.subscriptions.create(
      billing={
          "city": "city",
          "country": "IN",
          "state": "state",
          "street": "street",
          "zipcode": 54535,
      },
      customer={
          "customer_id": "customer_id"
      },
      product_id="product_id",
      quantity=1,
      payment_link: true,
      return_url: 'https://example.com/success',
    )
    print(subscription.subscription_id)
    ```
  </Tab>

  <Tab title="GO SDK">
    ```go
    package main

    import (
    "context"
    "fmt"

    "github.com/dodopayments/dodopayments-go"
    "github.com/dodopayments/dodopayments-go/option"
    )

    func main() {
    client := dodopayments.NewClient(
      option.WithBearerToken("My Bearer Token"), // defaults to os.LookupEnv("DODO_PAYMENTS_API_KEY")
    )
    subscription, err := client.Subscriptions.New(context.TODO(), dodopayments.SubscriptionNewParams{
      Billing: dodopayments.F(dodopayments.SubscriptionNewParamsBilling{
        City: dodopayments.F("city"),
        Country: dodopayments.F(dodopayments.CountryCodeIn),
        State: dodopayments.F("state"),
        Street: dodopayments.F("street"),
        Zipcode: dodopayments.F(int64(65787)),
      }),
      Customer: dodopayments.F[dodopayments.SubscriptionNewParamsCustomerUnion](dodopayments.SubscriptionNewParamsCustomerAttachExistingCustomer{
        CustomerID: dodopayments.F("customer_id"),
      }),
      ProductID: dodopayments.F("product_id"),
      Quantity: dodopayments.F(int64(1)),
    })
    if err != nil {
      panic(err.Error())
    }
    fmt.Printf("%+v\n", subscription.SubscriptionID)
    }
    ```
  </Tab>

  <Tab title="Api Reference">
    ```javascript
    import { NextRequest, NextResponse } from "next/server";      

    export async function POST(request: NextRequest) {
    try {
    const body = await request.json();
    const { formData, cartItems } = paymentRequestSchema.parse(body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_DODO_TEST_API}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`, // Replace with your API secret key generated from the Dodo Payments Dashboard
    },
    body: JSON.stringify({
      billing: {
        city: formData.city,
        country: formData.country,
        state: formData.state,
        street: formData.addressLine,
        zipcode: parseInt(formData.zipCode),
      },
      customer: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phoneNumber || undefined,
      },
      payment_link: true,
      product_id: id,
      quantity: 1,
      return_url: process.env.NEXT_PUBLIC_RETURN_URL,
    }),
    });

    if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    return NextResponse.json(
      { error: "Payment link creation failed", details: errorData },
      { status: response.status }
    );
    }

    const data = await response.json();
    return NextResponse.json({ paymentLink: data.payment_link });
    } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
    {
      error: err instanceof Error ? err.message : "An unknown error occurred",
    },
    { status: 500 }
    );
    }
    }
    ```
  </Tab>
</Tabs>

### API Response

The following is an example of the response:

```json
{
  "client_secret": "<string>",
  "customer": {
    "customer_id": "<string>",
    "email": "<string>",
    "name": "<string>"
  },
  "metadata": {},
  "payment_link": "<string>",
  "recurring_pre_tax_amount": 1,
  "subscription_id": "<string>"
}
```

Redirect the customer to `payment_link`.

### Webhooks

When integrating subscriptions, you'll receive webhooks to track the subscription lifecycle. These webhooks help you manage subscription states and payment scenarios effectively.

To set up your webhook endpoint, please follow our [Detailed Integration Guide](/api-reference/integration-guide#implementing-webhooks).

#### Subscription Event Types

The following webhook events track subscription status changes:

1. **`subscription.active`** - Subscription is successfully activated.
2. **`subscription.on_hold`** - Subscription is put on hold due to failed renewal.
3. **`subscription.failed`** - Subscription creation failed during mandate creation.
4. **`subscription.renewed`** - Subscription is renewed for the next billing period.

For reliable subscription lifecycle management, we recommend tracking these subscription events.

#### Payment Scenarios

**Successful Payment Flow**

When a payment succeeds, you'll receive the following webhooks:

1. `subscription.active` - Indicates subscription activation
2. `payment.succeeded` - Confirms the initial payment:
   * For immediate billing (0 trial days): Expect within 2-10 minutes
   * For trial days: whenever that ends
3. `subscription.renewed` - Indicates payment deduction and renewal for next cycle. (Basically, whenever payment gets deducted for subscription products, you will get `subscription.renewal` webhook along with `payment.succeeded`)

**Payment Failure Scenarios**

1. Subscription Failure

* `subscription.failed` - Subscription creation failed due to failure to create a mandate.
* `payment.failed` - Indicates failed payment.

<Info>**Best Practice**: To simplify implementation, we recommend primarily tracking subscription events for managing the subscription lifecycle.</Info>

### Sample Subscription event payload

***

| Property      | Type   | Required | Description                                                                                  |
| ------------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `business_id` | string | Yes      | The unique identifier for the business                                                       |
| `timestamp`   | string | Yes      | The timestamp of when the event occurred (not necessarily the same as when it was delivered) |
| `type`        | string | Yes      | The type of event. See [Event Types](#event-types)                                           |
| `data`        | object | Yes      | The main data payload. See [Data Object](#data-object)                                       |

## Data Object

The `data` object contains the following properties:

| Property                       | Type    | Required | Description                             |
| ------------------------------ | ------- | -------- | --------------------------------------- |
| `created_at`                   | string  | Yes      | Creation timestamp                      |
| `currency`                     | string  | Yes      | Three-letter currency code              |
| `customer`                     | object  | Yes      | Customer information                    |
| `metadata`                     | object  | Yes      | Additional metadata                     |
| `next_billing_date`            | string  | Yes      | Next scheduled billing date             |
| `payment_frequency_count`      | integer | Yes      | Number of payment frequency units       |
| `payment_frequency_interval`   | string  | Yes      | Payment frequency unit                  |
| `product_id`                   | string  | Yes      | Unique product identifier               |
| `quantity`                     | integer | Yes      | Quantity of the subscription            |
| `recurring_pre_tax_amount`     | integer | Yes      | Pre-tax amount for recurring payments   |
| `status`                       | string  | Yes      | Current subscription status             |
| `subscription_id`              | string  | Yes      | Unique subscription identifier          |
| `subscription_period_count`    | integer | Yes      | Number of subscription period units     |
| `subscription_period_interval` | string  | Yes      | Subscription period unit                |
| `trial_period_days`            | integer | Yes      | Number of trial days                    |
| `payload_type`                 | string  | Yes      | Type of payload (always "Subscription") |

## Enums

### Time Intervals

Both `payment_frequency_interval` and `subscription_period_interval` accept the following values:

* `Day`
* `Week`
* `Month`
* `Year`

### Status

The `status` field can have the following values:

* `pending` - Initial state
* `active` - Subscription is active
* `on_hold` - Temporarily on hold
* `renewed` - New Billing Cycle started
* `paused` - Paused by user or system
* `cancelled` - Subscription has been cancelled
* `failed` - Payment or other failure
* `expired` - Subscription has expired

### Event Types

#### Subscription Events

* `subscription.active`
* `subscription.on_hold`
* `subscription.paused`
* `subscription.cancelled`
* `subscription.failed`
* `subscription.expired`
