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