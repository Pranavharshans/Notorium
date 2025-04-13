import { NextResponse } from "next/server";
import { dodopayments } from "@/lib/dodo-payments/init-sdk";
import { DODO_CONFIG } from "@/lib/dodo-payments/config";
import { ErrorMessages } from "@/lib/errors/subscription-errors";
import type { DodoSubscriptionStatus } from '@/lib/dodo-payments/init-sdk';

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: ErrorMessages.INVALID_REQUEST_PARAMETERS },
        { status: 400 }
      );
    }

    // Create subscription with payment link
    const response = await dodopayments.subscriptions.create({
      billing: {
        city: "City",
        country: "US",
        state: "State",
        street: "Street",
        zipcode: "12345"
      },
      customer: {
        email: "user@example.com", // This should come from your user data
        name: "Test User" // Required by Dodo API
      },
      payment_link: true,
      product_id: DODO_CONFIG.PRODUCTS.PRO,
      quantity: 1,
      return_url: `${DODO_CONFIG.BASE_URL}/settings/subscription?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId,
        tier: "pro"
      }
    });

    return NextResponse.json({
      checkoutUrl: response.payment_link,
      sessionId: response.subscription_id
    });
  } catch (error: any) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: error.message || ErrorMessages.SUBSCRIPTION_CREATION_FAILED },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: ErrorMessages.USER_NOT_FOUND },
      { status: 400 }
    );
  }

  try {
    // Get user's subscriptions
    const subscriptions = await dodopayments.subscriptions.list();
    const userSubscription = subscriptions.items.find(
      sub => sub.metadata?.userId === userId
    );

    return NextResponse.json({
      tier: userSubscription?.status === "active" ? "pro" : "free",
      status: userSubscription?.status || "inactive",
      subscriptionId: userSubscription?.subscription_id || null,
      endDate: userSubscription?.current_period_end || null
    });
  } catch (error: any) {
    console.error("Failed to get subscription status:", error);
    return NextResponse.json(
      { error: error.message || ErrorMessages.SUBSCRIPTION_NOT_FOUND },
      { status: 500 }
    );
  }
}