import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { dodopayments } from "@/lib/dodopayments";
import { updateSubscriptionStatus } from "@/lib/subscription-utils";

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();

  try {
    const rawBody = await request.text();
    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };
    await webhook.verify(rawBody, webhookHeaders);
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
            subscription
          );
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
          const subscription = await dodopayments.subscriptions.retrieve(payload.data.subscription_id);
          await updateSubscriptionStatus(
            firebaseUid,
            'active',
            subscription.next_billing_date,
            subscription
          );
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
      // Handle payment events if needed
      switch (payload.type) {
        case "payment.succeeded":
          const paymentDataResp = await dodopayments.payments.retrieve(payload.data.payment_id);
          // paymentDataResp is retrieved for future use but not currently used
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
    console.error("Error details:", JSON.stringify(error, null, 2));
    return Response.json(
      { message: "Webhook processing failed" },
      { status: 400 }
    );
  }
}