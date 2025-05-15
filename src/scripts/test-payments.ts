#!/usr/bin/env ts-node

import { dodopayments } from "../lib/dodopayments";
import * as readline from 'readline';
import { updateSubscriptionStatus } from "../lib/subscription-utils";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Mock data for testing
const mockCustomer = {
  name: "Test Customer",
  email: "test@example.com"
};

const mockBilling = {
  street: "123 Test Street",
  city: "Test City",
  state: "Test State",
  country: "US",
  zipcode: "12345"
};

// Test functions
async function testListProducts() {
  console.log("\n=== Testing List Products ===");
  try {
    const products = await dodopayments.products.list();
    console.log(`Successfully retrieved ${products.items.length} products`);
    console.log("Sample product:", JSON.stringify(products.items[0], null, 2));
    return products.items;
  } catch (error) {
    console.error("Error listing products:", error);
    throw error;
  }
}

async function testCreateSubscription(productId: string, firebaseUid = "test-user-id") {
  console.log("\n=== Testing Create Subscription ===");
  try {
    const metadata = {
      firebase_uid: firebaseUid,
      test_mode: "true"
    };

    const response = await dodopayments.subscriptions.create({
      billing: mockBilling,
      customer: mockCustomer,
      metadata,
      product_id: productId,
      quantity: 1,
      return_url: "http://localhost:3000/subscription-success",
      payment_link: true
    });

    console.log("Subscription created:", {
      subscription_id: response.subscription_id,
      customer_id: response.customer.customer_id,
      payment_link: response.payment_link
    });
    
    console.log("\nPayment Link (copy and open in browser to test payment):");
    console.log(response.payment_link);
    
    return {
      subscriptionId: response.subscription_id,
      customerId: response.customer.customer_id,
      paymentLink: response.payment_link
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

async function testRetrieveSubscription(subscriptionId: string) {
  console.log("\n=== Testing Retrieve Subscription ===");
  try {
    const subscription = await dodopayments.subscriptions.retrieve(subscriptionId);
    console.log("Subscription retrieved:", {
      id: subscription.subscription_id,
      status: subscription.status,
      next_billing_date: subscription.next_billing_date
    });
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

async function testUpdateSubscriptionStatus(firebaseUid: string, status: string) {
  console.log(`\n=== Testing Update Subscription Status to ${status} ===`);
  try {
    await updateSubscriptionStatus(firebaseUid, status as any);
    console.log(`Successfully updated subscription status to ${status}`);
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

async function testCancelSubscription(subscriptionId: string) {
  console.log("\n=== Testing Cancel Subscription ===");
  try {
    await dodopayments.subscriptions.update(subscriptionId, { status: 'cancelled' });
    console.log(`Successfully cancelled subscription ${subscriptionId}`);
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

// Main test flow
async function runTests() {
  try {
    // Test listing products
    const products = await testListProducts();
    
    if (!products || products.length === 0) {
      console.error("No products found to test with");
      return;
    }

    // Ask user to select a product for testing
    console.log("\nAvailable products for testing:");
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.product_id})`);
    });

    const productIndex = await new Promise<number>((resolve) => {
      rl.question("\nSelect a product number to test subscription with: ", (answer) => {
        const index = parseInt(answer, 10) - 1;
        resolve(index >= 0 && index < products.length ? index : 0);
      });
    });

    const selectedProduct = products[productIndex];
    console.log(`Selected product: ${selectedProduct.name}`);

    // Generate a test Firebase UID
    const testFirebaseUid = `test-user-${Date.now()}`;
    
    // Create subscription
    const { subscriptionId, customerId, paymentLink } = await testCreateSubscription(selectedProduct.product_id, testFirebaseUid);
    
    // Wait for user to complete the payment flow
    await new Promise<void>((resolve) => {
      rl.question("\nPress Enter after completing the payment flow in the browser...", () => {
        resolve();
      });
    });
    
    // Retrieve subscription after payment
    await testRetrieveSubscription(subscriptionId);
    
    // Test subscription status updates
    await testUpdateSubscriptionStatus(testFirebaseUid, 'active');
    
    // Ask if user wants to test cancellation
    const shouldCancel = await new Promise<boolean>((resolve) => {
      rl.question("\nDo you want to test subscription cancellation? (y/n): ", (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (shouldCancel) {
      await testCancelSubscription(subscriptionId);
      await testUpdateSubscriptionStatus(testFirebaseUid, 'cancelled');
    }
    
    console.log("\n=== All tests completed successfully ===");
  } catch (error) {
    console.error("Test suite failed:", error);
  } finally {
    rl.close();
  }
}

// Run the tests
runTests(); 