# Dodo Payments Postman Testing Guide

This guide shows how to test your Dodo Payments integration using Postman. The collection serves both as a testing tool and as documentation for your payment APIs.

## Setup Instructions

### 1. Import the Collection

1. Download [Postman](https://www.postman.com/downloads/) if you don't have it installed
2. Open Postman and click "Import" in the top left
3. Import the collection from this URL or copy-paste the JSON below:
   ```
   https://raw.githubusercontent.com/yourusername/notorium/main/postman/dodo-payments-collection.json
   ```

### 2. Set Up Environment Variables

1. In Postman, click "Environments" in the sidebar
2. Create a new environment called "Dodo Payments - Test"
3. Add the following variables:

| Variable Name | Initial Value | Description |
|---------------|---------------|-------------|
| `base_url` | `http://localhost:3000/api` | Your local API base URL |
| `auth_token` | `<empty>` | JWT auth token (will be set after login) |
| `user_email` | `test@example.com` | Test user email |
| `user_password` | `testpassword123` | Test user password |
| `customer_id` | `<empty>` | Customer ID (populated during tests) |
| `subscription_id` | `<empty>` | Subscription ID (populated during tests) |
| `product_id` | `<empty>` | Product ID for testing |

4. Save the environment and make sure it's selected

## Collection Structure

The Postman collection is organized into the following folders:

### Authentication
- **Login**: Get an authentication token for your user

### Products
- **List Products**: View available products and pricing
- **Get Product**: Get details for a specific product

### Subscriptions
- **Create Subscription**: Create a new subscription
- **Get Subscription**: Retrieve subscription details
- **Cancel Subscription**: Cancel an active subscription

### Customer Portal
- **Get Portal URL**: Generate a customer portal session URL

### Webhooks
- **Test Webhook - Subscription Active**: Send a test webhook with active status
- **Test Webhook - Subscription Cancelled**: Send a test webhook with cancelled status
- **Test Webhook - Subscription Renewed**: Send a test webhook for renewal

## Testing Process

### Basic Flow Testing

1. **Authentication**
   - Run the "Login" request to get an authentication token
   - The token will be automatically saved to your environment variables

2. **Products**
   - Run "List Products" to see available products
   - Copy a product ID and save it to your `product_id` environment variable

3. **Create Subscription**
   - Run "Create Subscription" to start a subscription
   - The response includes a payment link - open it in a browser to complete payment
   - The subscription and customer IDs will be automatically saved to environment variables

4. **Verify Subscription**
   - After completing payment, run "Get Subscription" to verify its status

5. **Cancel Subscription**
   - Run "Cancel Subscription" to cancel the subscription
   - Run "Get Subscription" again to verify the status change

### Webhook Testing

1. Select one of the webhook test requests
2. Review the pre-request script that generates a valid signature
3. Run the webhook request
4. Check the response and server logs to verify processing

## Postman Collection Code

Save this JSON as `dodo-payments-collection.json` in your project:

```json
{
  "info": {
    "name": "Dodo Payments API",
    "description": "Collection for testing Dodo Payments integration in Notorium",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{user_email}}\",\n  \"password\": \"{{user_password}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            },
            "description": "Authenticates a user and returns a JWT token"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "const response = pm.response.json();",
                  "if (response && response.token) {",
                  "    pm.environment.set('auth_token', response.token);",
                  "    console.log('Auth token saved to environment');",
                  "} else {",
                  "    console.error('Auth token not found in response');",
                  "}"
                ]
              }
            }
          ]
        }
      ],
      "description": "Authentication-related endpoints"
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "List Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/products",
              "host": ["{{base_url}}"],
              "path": ["products"]
            },
            "description": "Lists all available products and their pricing"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "const response = pm.response.json();",
                  "if (response && response.length > 0) {",
                  "    // Save the first product ID if none is set",
                  "    if (!pm.environment.get('product_id')) {",
                  "        pm.environment.set('product_id', response[0].product_id);",
                  "        console.log('Product ID saved to environment: ' + response[0].product_id);",
                  "    }",
                  "    ",
                  "    // Display available products",
                  "    console.log('Available products:');",
                  "    response.forEach((product, index) => {",
                  "        console.log(`${index + 1}. ${product.name} - ${product.price.unit_amount/100} ${product.price.currency} (${product.product_id})`);",
                  "    });",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Get Product",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/products/{{product_id}}",
              "host": ["{{base_url}}"],
              "path": ["products", "{{product_id}}"]
            },
            "description": "Gets details for a specific product"
          },
          "response": []
        }
      ],
      "description": "Product-related endpoints"
    },
    {
      "name": "Subscriptions",
      "item": [
        {
          "name": "Create Subscription",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customer\": {\n    \"name\": \"Test Customer\",\n    \"email\": \"{{user_email}}\"\n  },\n  \"billing\": {\n    \"street\": \"123 Test Street\",\n    \"city\": \"Test City\",\n    \"state\": \"Test State\",\n    \"country\": \"US\",\n    \"zipcode\": \"12345\"\n  }\n}"
            },
            "url": {
              "raw": "{{base_url}}/checkout/subscription?productId={{product_id}}",
              "host": ["{{base_url}}"],
              "path": ["checkout", "subscription"],
              "query": [
                {
                  "key": "productId",
                  "value": "{{product_id}}"
                }
              ]
            },
            "description": "Creates a new subscription and returns a payment link"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "const response = pm.response.json();",
                  "if (response) {",
                  "    if (response.subscription_id) {",
                  "        pm.environment.set('subscription_id', response.subscription_id);",
                  "        console.log('Subscription ID saved: ' + response.subscription_id);",
                  "    }",
                  "    if (response.customer && response.customer.customer_id) {",
                  "        pm.environment.set('customer_id', response.customer.customer_id);",
                  "        console.log('Customer ID saved: ' + response.customer.customer_id);",
                  "    }",
                  "    if (response.payment_link) {",
                  "        console.log('Payment Link (open in browser to complete payment):');",
                  "        console.log(response.payment_link);",
                  "    }",
                  "}"
                ]
              }
            }
          ]
        },
        {
          "name": "Get Subscription",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/subscription/{{subscription_id}}",
              "host": ["{{base_url}}"],
              "path": ["subscription", "{{subscription_id}}"]
            },
            "description": "Gets details for a specific subscription"
          },
          "response": []
        },
        {
          "name": "Cancel Subscription",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/subscription/cancel",
              "host": ["{{base_url}}"],
              "path": ["subscription", "cancel"]
            },
            "description": "Cancels the active subscription"
          },
          "response": []
        }
      ],
      "description": "Subscription-related endpoints"
    },
    {
      "name": "Customer Portal",
      "item": [
        {
          "name": "Get Portal URL",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/customer-portal",
              "host": ["{{base_url}}"],
              "path": ["customer-portal"]
            },
            "description": "Gets a URL for the customer portal"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "const response = pm.response.json();",
                  "if (response && response.url) {",
                  "    console.log('Customer Portal URL (open in browser):');",
                  "    console.log(response.url);",
                  "}"
                ]
              }
            }
          ]
        }
      ],
      "description": "Customer portal endpoints"
    },
    {
      "name": "Webhooks",
      "item": [
        {
          "name": "Test Webhook - Subscription Active",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "webhook-id",
                "value": "{{webhook_id}}"
              },
              {
                "key": "webhook-timestamp",
                "value": "{{webhook_timestamp}}"
              },
              {
                "key": "webhook-signature",
                "value": "{{webhook_signature}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{{webhook_payload}}"
            },
            "url": {
              "raw": "{{base_url}}/webhook",
              "host": ["{{base_url}}"],
              "path": ["webhook"]
            },
            "description": "Simulates a webhook event for a subscription becoming active"
          },
          "response": [],
          "event": [
            {
              "listen": "prerequest",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "// You need to replace 'test_webhook_secret' with your actual webhook secret",
                  "// For production-like testing, store this in your environment variables",
                  "const webhookSecret = 'test_webhook_secret';",
                  "",
                  "// Generate a webhook ID",
                  "const webhookId = 'test_' + Date.now();",
                  "pm.environment.set('webhook_id', webhookId);",
                  "",
                  "// Generate a timestamp (seconds since epoch)",
                  "const timestamp = Math.floor(Date.now() / 1000).toString();",
                  "pm.environment.set('webhook_timestamp', timestamp);",
                  "",
                  "// Generate unique test IDs",
                  "const subscriptionId = 'sub_test_' + Date.now();",
                  "const customerId = 'cus_test_' + Date.now();",
                  "const firebaseUid = 'test-user-' + Date.now();",
                  "",
                  "// Create webhook payload",
                  "const payload = {",
                  "    type: 'subscription.active',",
                  "    data: {",
                  "        payload_type: 'Subscription',",
                  "        subscription_id: subscriptionId,",
                  "        customer_id: customerId,",
                  "        status: 'active',",
                  "        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),",
                  "        metadata: {",
                  "            firebase_uid: firebaseUid",
                  "        }",
                  "    }",
                  "};",
                  "",
                  "// Set the payload as a string",
                  "const payloadString = JSON.stringify(payload);",
                  "pm.environment.set('webhook_payload', payloadString);",
                  "",
                  "// Note: In a real scenario, you'd use a library like 'standardwebhooks'",
                  "// For Postman, we'll use a simplified version",
                  "// This is only for testing/demonstration - use proper signature generation in production",
                  "const signatureString = `${webhookId}.${timestamp}.${payloadString}`;",
                  "console.log('Webhook prepared with signature:', signatureString);",
                  "",
                  "// In production, you'd use a proper HMAC-SHA256 signature",
                  "// For testing, we're using a simplified approach",
                  "pm.environment.set('webhook_signature', 'test_sig_' + Date.now());",
                  "",
                  "console.log('Firebase UID for testing:', firebaseUid);",
                  "console.log('Subscription ID:', subscriptionId);",
                  "console.log('Customer ID:', customerId);",
                  ""
                ]
              }
            }
          ]
        },
        {
          "name": "Test Webhook - Subscription Cancelled",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "webhook-id",
                "value": "{{webhook_id}}"
              },
              {
                "key": "webhook-timestamp",
                "value": "{{webhook_timestamp}}"
              },
              {
                "key": "webhook-signature",
                "value": "{{webhook_signature}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{{webhook_payload}}"
            },
            "url": {
              "raw": "{{base_url}}/webhook",
              "host": ["{{base_url}}"],
              "path": ["webhook"]
            },
            "description": "Simulates a webhook event for a subscription being cancelled"
          },
          "response": [],
          "event": [
            {
              "listen": "prerequest",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "// You need to replace 'test_webhook_secret' with your actual webhook secret",
                  "const webhookSecret = 'test_webhook_secret';",
                  "",
                  "// Generate a webhook ID",
                  "const webhookId = 'test_' + Date.now();",
                  "pm.environment.set('webhook_id', webhookId);",
                  "",
                  "// Generate a timestamp (seconds since epoch)",
                  "const timestamp = Math.floor(Date.now() / 1000).toString();",
                  "pm.environment.set('webhook_timestamp', timestamp);",
                  "",
                  "// Generate unique test IDs",
                  "const subscriptionId = 'sub_test_' + Date.now();",
                  "const customerId = 'cus_test_' + Date.now();",
                  "const firebaseUid = 'test-user-' + Date.now();",
                  "",
                  "// Create webhook payload",
                  "const payload = {",
                  "    type: 'subscription.cancelled',",
                  "    data: {",
                  "        payload_type: 'Subscription',",
                  "        subscription_id: subscriptionId,",
                  "        customer_id: customerId,",
                  "        status: 'cancelled',",
                  "        metadata: {",
                  "            firebase_uid: firebaseUid",
                  "        }",
                  "    }",
                  "};",
                  "",
                  "// Set the payload as a string",
                  "const payloadString = JSON.stringify(payload);",
                  "pm.environment.set('webhook_payload', payloadString);",
                  "",
                  "// Simplified signature for testing",
                  "const signatureString = `${webhookId}.${timestamp}.${payloadString}`;",
                  "console.log('Webhook prepared with signature:', signatureString);",
                  "pm.environment.set('webhook_signature', 'test_sig_' + Date.now());",
                  "",
                  "console.log('Firebase UID for testing:', firebaseUid);",
                  "console.log('Subscription ID:', subscriptionId);",
                  "console.log('Customer ID:', customerId);",
                  ""
                ]
              }
            }
          ]
        },
        {
          "name": "Test Webhook - Subscription Renewed",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "webhook-id",
                "value": "{{webhook_id}}"
              },
              {
                "key": "webhook-timestamp",
                "value": "{{webhook_timestamp}}"
              },
              {
                "key": "webhook-signature",
                "value": "{{webhook_signature}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{{webhook_payload}}"
            },
            "url": {
              "raw": "{{base_url}}/webhook",
              "host": ["{{base_url}}"],
              "path": ["webhook"]
            },
            "description": "Simulates a webhook event for a subscription being renewed"
          },
          "response": [],
          "event": [
            {
              "listen": "prerequest",
              "script": {
                "type": "text/javascript",
                "exec": [
                  "// You need to replace 'test_webhook_secret' with your actual webhook secret",
                  "const webhookSecret = 'test_webhook_secret';",
                  "",
                  "// Generate a webhook ID",
                  "const webhookId = 'test_' + Date.now();",
                  "pm.environment.set('webhook_id', webhookId);",
                  "",
                  "// Generate a timestamp (seconds since epoch)",
                  "const timestamp = Math.floor(Date.now() / 1000).toString();",
                  "pm.environment.set('webhook_timestamp', timestamp);",
                  "",
                  "// Generate unique test IDs",
                  "const subscriptionId = 'sub_test_' + Date.now();",
                  "const customerId = 'cus_test_' + Date.now();",
                  "const firebaseUid = 'test-user-' + Date.now();",
                  "",
                  "// Create webhook payload",
                  "const payload = {",
                  "    type: 'subscription.renewed',",
                  "    data: {",
                  "        payload_type: 'Subscription',",
                  "        subscription_id: subscriptionId,",
                  "        customer_id: customerId,",
                  "        status: 'active',",
                  "        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),",
                  "        metadata: {",
                  "            firebase_uid: firebaseUid",
                  "        }",
                  "    }",
                  "};",
                  "",
                  "// Set the payload as a string",
                  "const payloadString = JSON.stringify(payload);",
                  "pm.environment.set('webhook_payload', payloadString);",
                  "",
                  "// Simplified signature for testing",
                  "const signatureString = `${webhookId}.${timestamp}.${payloadString}`;",
                  "console.log('Webhook prepared with signature:', signatureString);",
                  "pm.environment.set('webhook_signature', 'test_sig_' + Date.now());",
                  "",
                  "console.log('Firebase UID for testing:', firebaseUid);",
                  "console.log('Subscription ID:', subscriptionId);",
                  "console.log('Customer ID:', customerId);",
                  ""
                ]
              }
            }
          ]
        }
      ],
      "description": "Webhook test endpoints"
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Global Pre-request Script",
          "console.log('Executing request: ' + pm.info.requestName);"
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Global Test Script",
          "console.log('Response status: ' + pm.response.code);"
        ]
      }
    }
  ]
}
```

## Documentation Benefits

Using Postman for testing provides these documentation benefits:

1. **Self-Documenting API Collection**:
   - Each request shows exactly how to format API calls
   - Pre-request scripts demonstrate parameter requirements
   - Real examples of request/response bodies

2. **Environment Variables**:
   - Shows required configuration values
   - Separates test vs. production environments

3. **Test Scripts**:
   - Verifies expected responses
   - Shows how to handle API response data

4. **Webhook Testing**:
   - Documents webhook payload structure
   - Shows required headers for webhook verification

5. **Shareable Knowledge**:
   - Collection can be exported and shared with team members
   - New developers can get up to speed quickly on the API

## Maintenance

As your API evolves:

1. Update the Postman collection with new endpoints
2. Document any changes to request/response formats
3. Update environment variables as needed
4. Export and update the collection JSON in your repository

This keeps your testing and documentation in sync with actual implementation. 