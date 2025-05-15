/**
 * Simple Dodo Payments Testing Script
 * 
 * This script provides a straightforward way to test Dodo Payments integration.
 * Run with: node test-dodo-payments.js [command]
 * 
 * Available commands:
 * - products: List all products
 * - create-subscription: Create a test subscription
 * - webhook: Test a webhook
 * - cancel: Cancel a subscription
 */

const DodoPayments = require('dodopayments');
const http = require('http');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Dodo Payments client with test mode
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY_TEST,
  environment: 'test_mode'
});

// Test customer data
const testCustomer = {
  name: "Test Customer",
  email: "test@example.com"
};

// Test billing data
const testBilling = {
  street: "123 Test Street",
  city: "Test City",
  state: "Test State",
  country: "US",
  zipcode: "12345"
};

// Test functions
async function listProducts() {
  try {
    const products = await dodoClient.products.list();
    
    return products.items;
  } catch (error) {
    console.error("Error listing products:", error);
  }
}

async function createSubscription(productId) {
  if (!productId) {
    const products = await listProducts();
    if (products && products.length > 0) {
      productId = products[0].product_id;
    } else {
      console.error("No products found. Please create products in your Dodo Payments dashboard.");
      return;
    }
  }
  
  try {
    const response = await dodoClient.subscriptions.create({
      billing: testBilling,
      customer: testCustomer,
      metadata: {
        test: "true"
      },
      product_id: productId,
      quantity: 1,
      return_url: "http://localhost:3000",
      payment_link: true
    });
    
    return {
      subscriptionId: response.subscription_id,
      customerId: response.customer.customer_id
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
  }
}

async function testWebhook(eventType = 'subscription.active') {
  try {
    const testFirebaseUid = "test-user-1747301653340";
    const testSubscriptionId = "sub_QC4fG3Rft0TVarCvBOojg";
    const testCustomerId = "cus_rgMWPU52wMwDU6HULrHrx";
    
    // Create webhook payload
    const payload = {
      type: eventType,
      data: {
        payload_type: "Subscription",
        subscription_id: testSubscriptionId,
        customer_id: testCustomerId,
        status: eventType.split('.')[1], // e.g., 'active' from 'subscription.active'
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          firebase_uid: testFirebaseUid
        }
      }
    };
    
    const payloadString = JSON.stringify(payload);
    const webhookId = `test_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Note: In a real application, you'd use the standardwebhooks library to generate proper signatures
    // This is a simplified version for testing
    const signature = `test_sig_${Date.now()}`;
    
    // Send webhook to your local server
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-id': webhookId,
        'webhook-signature': signature,
        'webhook-timestamp': timestamp
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = data ? JSON.parse(data) : {};
        } catch (error) {
          console.log("Raw response:", data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error("Error sending webhook:", error);
    });
    
    req.write(payloadString);
    req.end();
    
    return { 
      firebaseUid: testFirebaseUid, 
      subscriptionId: testSubscriptionId
    };
  } catch (error) {
    console.error("Error testing webhook:", error);
  }
}

async function cancelSubscription(subscriptionId) {
  if (!subscriptionId) {
    console.error("No subscription ID provided. Please provide a subscription ID.");
    return;
  }
  
  try {
    await dodoClient.subscriptions.update(subscriptionId, { status: 'cancelled' });
    
    // Retrieve the updated subscription
    const subscription = await dodoClient.subscriptions.retrieve(subscriptionId);
    
    return subscription;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
  }
}

// Main function
async function main() {
  const command = process.argv[2] || 'help';
  const param = process.argv[3];
  
  switch (command) {
    case 'products':
      await listProducts();
      break;
    
    case 'create-subscription':
      await createSubscription(param);
      break;
    
    case 'webhook':
      const eventType = param || 'subscription.active';
      await testWebhook(eventType);
      break;
    
    case 'cancel':
      if (!param) {
        console.error("Please provide a subscription ID: node test-dodo-payments.js cancel <subscription_id>");
        process.exit(1);
      }
      await cancelSubscription(param);
      break;
    
    case 'help':
    default:
      console.log(`
Dodo Payments Test Script

Usage: node test-dodo-payments.js [command] [params]

Commands:
  products                      List all products
  create-subscription [id]      Create a test subscription with optional product ID
  webhook [event]               Test a webhook (default: subscription.active)
                                Events: subscription.active, subscription.cancelled, subscription.renewed
  cancel <subscription_id>      Cancel a subscription
  help                          Show this help message

Examples:
  node test-dodo-payments.js products
  node test-dodo-payments.js create-subscription
  node test-dodo-payments.js webhook subscription.renewed
  node test-dodo-payments.js cancel sub_123456
      `);
  }
}

main().catch(console.error); 