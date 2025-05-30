#!/usr/bin/env ts-node

import * as http from 'http';
import * as crypto from 'crypto';
import { Webhook } from "standardwebhooks";
import { updateSubscriptionStatus } from "../lib/subscription-utils";

// Replace with your actual webhook secret from environment
const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY || 'test_webhook_secret';
const webhook = new Webhook(webhookSecret);

// This port should match your local development server
const PORT = 3000;

// Generate mock webhook event
function generateMockSubscriptionEvent(type: string, firebaseUid: string = 'test-user-123') {
  // The timestamp needs to be recent for signature verification
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const payload = {
    type,
    data: {
      payload_type: "Subscription",
      subscription_id: `sub_${crypto.randomUUID()}`,
      customer_id: `cus_${crypto.randomUUID()}`,
      status: type.split('.')[1], // e.g., 'active' from 'subscription.active'
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        firebase_uid: firebaseUid
      }
    }
  };
  
  return { payload, timestamp };
}

// Function to sign the webhook payload
async function signPayload(payload: any, timestamp: string) {
  const payloadString = JSON.stringify(payload);
  const webhookId = `test_${crypto.randomUUID()}`;
  
  const signature = await webhook.sign(payloadString, {
    'webhook-id': webhookId,
    'webhook-timestamp': timestamp
  });
  
  return {
    payloadString,
    headers: {
      'webhook-id': webhookId,
      'webhook-signature': signature,
      'webhook-timestamp': timestamp,
      'content-type': 'application/json'
    }
  };
}

// Function to send webhook to local server
async function sendWebhook(path: string, payload: any, headers: any) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'POST',
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Main test function
async function testWebhooks() {
  // Test different subscription events
  const events = [
    'subscription.active',
    'subscription.failed',
    'subscription.cancelled',
    'subscription.renewed',
    'subscription.on_hold'
  ];
  
  for (const eventType of events) {
    try {
      // Generate unique Firebase UID for testing
      const testFirebaseUid = `test-user-${Date.now()}`;
      
      // Create mock event
      const { payload, timestamp } = generateMockSubscriptionEvent(eventType, testFirebaseUid);
      
      // Sign payload
      const { payloadString, headers } = await signPayload(payload, timestamp);
      
      // Send webhook to local server
      const result = await sendWebhook('/api/webhook', payloadString, headers);
      
      // Manual verification
      // Wait for a moment to allow server to process
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error testing ${eventType} webhook:`, error);
    }
  }
}

// Run tests
testWebhooks().catch(error => {
  console.error('Webhook test suite failed:', error);
}); 