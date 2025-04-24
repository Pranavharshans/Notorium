import { dodopayments } from "@/lib/dodopayments";
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { storeSubscriptionData } from "@/lib/subscription-utils";
import { DecodedIdToken } from "firebase-admin/auth";

async function validateSession(): Promise<{ firebaseUid: string; user: any } | null> {
  const cookiesList = await cookies();
  const sessionCookie = cookiesList.get("session");

  if (!sessionCookie?.value) {
    console.error("No session cookie found");
    return null;
  }

  try {
    const decodedClaim = await auth.verifySessionCookie(sessionCookie.value);
    const user = await auth.getUser(decodedClaim.uid);
    return {
      firebaseUid: decodedClaim.uid,
      user
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") as string;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId parameter" },
        { status: 400 }
      );
    }

    // Validate billing and customer information
    if (!body.billing || !body.customer) {
      return NextResponse.json(
        { error: "Missing billing or customer information" },
        { status: 400 }
      );
    }

    // Validate session and get user
    const session = await validateSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401 }
      );
    }

    const { firebaseUid, user } = session;

    // Prepare metadata
    const metadata = {
      firebase_uid: String(firebaseUid),
      user_email: String(user.email || ''),
      user_name: String(user.displayName || '')
    };

    console.log('Creating subscription for user:', {
      uid: firebaseUid,
      email: user.email,
      metadata,
      billing: body.billing, // Log received billing information
      customer: body.customer // Log received customer information
    });

    // Create subscription
    const response = await dodopayments.subscriptions.create({
      billing: {
        city: body.billing.city,
        country: body.billing.country,
        state: body.billing.state,
        street: body.billing.street,
        zipcode: body.billing.zipcode
      },
      customer: {
        email: body.customer.email || user.email,
        name: body.customer.name,
      },
      metadata,
      product_id: productId,
      quantity: 1,
      return_url: process.env.NEXT_PUBLIC_BASE_URL,
      payment_link: true
    });

    console.log('Subscription created:', {
      subscription_id: response.subscription_id,
      customer_id: response.customer.customer_id,
      metadata: response.metadata // Log metadata from response
    });

    // Store initial subscription data in Firestore
    await storeSubscriptionData(
      firebaseUid,
      response.customer.customer_id,
      response.subscription_id,
      'pending' // Initial status until webhook confirms
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('Subscription creation error:', error);
    
    if (error instanceof Error) {
      const statusCode = error.message.includes('Unauthorized') ? 401 : 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
