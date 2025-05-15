#!/usr/bin/env ts-node

import fetch from 'node-fetch';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';
let authToken = '';

// Mock data
const mockCustomerData = {
  name: "Test User",
  email: TEST_USER_EMAIL
};

const mockBillingData = {
  street: "123 Test Street",
  city: "Test City",
  state: "Test State",
  country: "US",
  zipcode: "12345"
};

// Utility function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Test functions
async function loginUser(): Promise<string> {
  try {
    // For testing, you'd typically create a test user first or use a pre-existing one
    // Here we're assuming the test user exists or we'd handle authentication differently
    
    // In a real test, you'd call your auth endpoint
    // For now, we'll simulate an auth token
    const token = `test_${Date.now()}_token`;
    
    return token;
  } catch (error) {
    throw error;
  }
}

async function testGetProducts(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    
    const products = await response.json();
    
    return products.map((p: any) => p.product_id);
  } catch (error) {
    throw error;
  }
}

async function testCreateSubscription(productId: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/checkout/subscription?productId=${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        customer: mockCustomerData,
        billing: mockBillingData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create subscription: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    return data.subscription_id;
  } catch (error) {
    throw error;
  }
}

async function testCustomerPortal(): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create customer portal: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    return data.url;
  } catch (error) {
    throw error;
  }
}

async function testCancelSubscription(): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to cancel subscription: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
  } catch (error) {
    throw error;
  }
}

// Main test flow
async function runTests() {
  try {
    console.log("Starting payment API tests...");
    console.log(`Ensure your local server is running on ${BASE_URL}`);
    
    // Login to get auth token
    authToken = await loginUser();
    
    // Get products
    const productIds = await testGetProducts();
    
    if (productIds.length === 0) {
      console.error("No products found to test with");
      return;
    }
    
    // Ask user to select a product
    const productIndex = parseInt(await question("\nSelect a product number to test subscription with: "), 10) - 1;
    const selectedProductId = productIds[productIndex] || productIds[0];
    
    // Create subscription
    const subscriptionId = await testCreateSubscription(selectedProductId);
    
    // Ask user if they want to test the customer portal
    const testPortal = (await question("\nDo you want to test the customer portal? (y/n): ")).toLowerCase() === 'y';
    
    if (testPortal) {
      const portalUrl = await testCustomerPortal();
      await question("\nPress Enter after checking the customer portal...");
    }
    
    // Ask if user wants to test cancellation
    const shouldCancel = (await question("\nDo you want to test subscription cancellation? (y/n): ")).toLowerCase() === 'y';
    
    if (shouldCancel) {
      await testCancelSubscription();
    }
    
    console.log("\n=== All API tests completed successfully ===");
  } catch (error) {
    console.error("API test suite failed:", error);
  } finally {
    rl.close();
  }
}

// Run the tests
runTests(); 