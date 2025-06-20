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
  const quotaRef = db.collection('quotas').doc(userId);
  await quotaRef.update({
    recordingMinutesUsed: 0,
    enhanceNotesUsed: 0,
    subscriptionStartDate: new Date().toISOString(),
  });
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
    // SECURITY FIX: Always verify webhooks regardless of environment
    // if (process.env.NODE_ENV === 'development') {
    //   // Skip verification
    // } else {
    //   await webhook.verify(rawBody, webhookHeaders);
    // }
      await webhook.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody);

    if (payload.data.payload_type === "Subscription") {
      const firebaseUid = payload.data.metadata?.firebase_uid;
      
      if (!firebaseUid) {
        return Response.json(
          { message: "Missing firebase_uid in metadata" },
          { status: 400 }
        );
      }

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
            let subscription;
            if (process.env.NODE_ENV === 'development') {
              subscription = {
                next_billing_date: payload.data.next_billing_date || "2025-06-10T02:22:25.300403Z"
              };
            } else {
              subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
            }
            
            await updateSubscriptionStatus(
              firebaseUid,
              'active',
              subscription.next_billing_date,
              payload.data
            );
            
            await syncQuotaWithSubscriptionAdmin(firebaseUid);
            
            await resetQuotaUsageAdmin(firebaseUid);
            
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

/*
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
*/