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
  try {
    const products = await dodopayments.products.list();
    return products.items;
  } catch (error) {
    throw error;
  }
}

async function testCreateSubscription(productId: string, firebaseUid = "test-user-id") {
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

    return {
      subscriptionId: response.subscription_id,
      customerId: response.customer.customer_id,
      paymentLink: response.payment_link
    };
  } catch (error) {
    throw error;
  }
}

async function testRetrieveSubscription(subscriptionId: string) {
  try {
    const subscription = await dodopayments.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    throw error;
  }
}

async function testUpdateSubscriptionStatus(firebaseUid: string, status: string) {
  try {
    await updateSubscriptionStatus(firebaseUid, status as any);
  } catch (error) {
    throw error;
  }
}

async function testCancelSubscription(subscriptionId: string) {
  try {
    await dodopayments.subscriptions.update(subscriptionId, { status: 'cancelled' });
  } catch (error) {
    throw error;
  }
}

// Main test flow
async function runTests() {
  try {
    // Test listing products
    const products = await testListProducts();
    
    if (!products || products.length === 0) {
      return;
    }

    // Ask user to select a product for testing
    const productIndex = await new Promise<number>((resolve) => {
      rl.question("\nSelect a product number to test subscription with: ", (answer) => {
        const index = parseInt(answer, 10) - 1;
        resolve(index >= 0 && index < products.length ? index : 0);
      });
    });

    const selectedProduct = products[productIndex];

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
  } catch (error) {
    throw error;
  } finally {
    rl.close();
  }
}

// Run the tests
runTests(); 