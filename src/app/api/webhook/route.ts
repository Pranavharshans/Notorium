import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { dodopayments } from "@/lib/dodopayments";
import { updateSubscriptionStatus } from "@/lib/subscription-utils";
import { quotaService } from "@/lib/quota-service";
import { NextResponse } from 'next/server';
import { db } from "@/lib/firebase-admin";
import { getFirestore } from 'firebase-admin/firestore';

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

async function resetQuotaUsageAdmin(userId: string): Promise<void> {
  console.log(`Resetting usage quotas for user: ${userId}`);
  
  const quotaRef = db.collection('quotas').doc(userId);
  
  const quotaDoc = await quotaRef.get();
  if (!quotaDoc.exists) {
    console.log(`No quota found for user: ${userId}, skipping reset`);
    return;
  }
  
  await quotaRef.update({
    recordingMinutesUsed: 0,
    enhanceNotesUsed: 0,
    subscriptionStartDate: new Date().toISOString(),
  });
  
  console.log(`Successfully reset usage quotas for user: ${userId}`);
}

async function syncQuotaWithSubscriptionAdmin(userId: string): Promise<void> {
  const userDoc = await db.collection('users').doc(userId).get();
  const isActiveSubscription = userDoc.exists && userDoc.data()?.status === 'active';
  
  const quotaRef = db.collection('quotas').doc(userId);
  const quotaDoc = await quotaRef.get();
  
  if (quotaDoc.exists) {
    const quota = quotaDoc.data();
    const newStatus = isActiveSubscription ? 'paid' : 'trial';
    
    if (quota && quota.subscriptionStatus !== newStatus) {
      await quotaRef.update({
        subscriptionStatus: newStatus,
        subscriptionStartDate: new Date().toISOString(),
      });
    }
  } else {
    console.log(`No quota found for user: ${userId}, skipping sync`);
  }
}

export async function POST(request: Request) {
  const headersList = await headers();

  try {
    const rawBody = await request.text();
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping webhook signature verification');
      // Skip verification
    } else {
      await webhook.verify(rawBody, webhookHeaders);
    }
    const payload = JSON.parse(rawBody);

    console.log('Webhook payload:', JSON.stringify(payload, null, 2));
    
    if (payload.data.payload_type === "Subscription") {
      const firebaseUid = payload.data.metadata?.firebase_uid;
      console.log('Firebase UID from metadata:', firebaseUid);
      
      if (!firebaseUid) {
        console.error("No firebase_uid found in metadata");
        return Response.json(
          { message: "Missing firebase_uid in metadata" },
          { status: 400 }
        );
      }

      console.log('Processing subscription event:', payload.type);

      switch (payload.type) {
        case "subscription.active": {
          const subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
          await updateSubscriptionStatus(
            firebaseUid,
            'active',
            subscription.next_billing_date,
            payload.data
          );
          await syncQuotaWithSubscriptionAdmin(firebaseUid);
          break;
        }
        case "subscription.failed": {
          await updateSubscriptionStatus(
            firebaseUid,
            'pending',
            undefined,
            payload.data
          );
          break;
        }
        case "subscription.cancelled": {
          await updateSubscriptionStatus(
            firebaseUid,
            'cancelled',
            undefined,
            payload.data
          );
          break;
        }
        case "subscription.renewed": {
          try {
            console.log('Processing subscription.renewed event');
            
            let subscription;
            if (process.env.NODE_ENV === 'development') {
              console.log('Development mode: Using mock subscription data');
              subscription = {
                next_billing_date: payload.data.next_billing_date || "2025-06-10T02:22:25.300403Z"
              };
            } else {
              subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
            }
            
            console.log('Updating subscription status...');
            await updateSubscriptionStatus(
              firebaseUid,
              'active',
              subscription.next_billing_date,
              payload.data
            );
            
            console.log('Synchronizing quota with subscription...');
            await syncQuotaWithSubscriptionAdmin(firebaseUid);
            
            console.log('Resetting usage quotas...');
            await resetQuotaUsageAdmin(firebaseUid);
            
            console.log('Successfully processed subscription.renewed event');
          } catch (innerError) {
            console.error('Error in subscription.renewed handler:', innerError);
          }
          break;
        }
        case "subscription.on_hold": {
          await updateSubscriptionStatus(
            firebaseUid,
            'on_hold',
            undefined,
            payload.data
          );
          break;
        }
        default:
          break;
      }
    } else if (payload.data.payload_type === "Payment") {
      switch (payload.type) {
        case "payment.succeeded":
          const paymentDataResp = await dodopayments.payments.retrieve(payload.data.payment_id);
          console.log('Payment data retrieved:', paymentDataResp.payment_id);
          break;
        default:
          break;
      }
    }
    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    
    let errorMessage = "Webhook processing failed";
    let errorDetails = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "No stack trace available";
    }
    
    console.error("Error message:", errorMessage);
    console.error("Error details:", errorDetails);
    
    return Response.json(
      { message: "Webhook processing failed", error: errorMessage },
      { status: 400 }
    );
  }
}

export async function testQuotaReset(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }
    
    console.log(`Testing quota reset for user: ${userId}`);
    
    // Use the Admin version for server-side operation
    await resetQuotaUsageAdmin(userId);
    
    return NextResponse.json({
      success: true,
      message: "Successfully reset quota for user",
      userId
    });
  } catch (error) {
    console.error("Error in test-quota-reset:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}