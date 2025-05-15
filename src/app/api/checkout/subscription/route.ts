import { dodopayments } from "@/lib/dodopayments";
import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { storeSubscriptionData } from "@/lib/subscription-utils";
// import { DecodedIdToken } from "firebase-admin/auth"; // Commented out to fix @typescript-eslint/no-unused-vars error

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://www.notorium.app' 
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

async function validateSession(): Promise<{ firebaseUid: string; user: Record<string, unknown> } | null> {
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
      user: user as unknown as Record<string, unknown>
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
    
    // Log the request URL for debugging
    console.log('Request URL:', request.url);
    console.log('Product ID:', productId);
    
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: "Invalid request body", details: 'Failed to parse JSON' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId parameter" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate billing and customer information
    if (!body.billing || !body.customer) {
      return NextResponse.json(
        { error: "Missing billing or customer information" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate session and get user
    const session = await validateSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401, headers: corsHeaders }
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
      billing: body.billing,
      customer: body.customer
    });

    // Create a diagnostics object to help debug
    const diagnostics = {
      dodoApiKeyConfigured: !!process.env.DODO_API_KEY,
      dodoApiKeyLength: process.env.DODO_API_KEY ? process.env.DODO_API_KEY.length : 0,
      dodoPaymentsApiKeyConfigured: !!process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    };
    
    console.log('Diagnostics:', diagnostics);

    // Check if Dodo Payments API key is configured
    if (!process.env.DODO_API_KEY) {
      console.error('DODO_API_KEY not configured');
      return NextResponse.json(
        { error: "Payment provider configuration missing", diagnostics },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      // Create subscription
      console.log('Attempting to create Dodo subscription...');
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
        return_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.notorium.app',
        payment_link: true
      });

      console.log('Subscription created:', {
        subscription_id: response.subscription_id,
        customer_id: response.customer.customer_id,
        metadata: response.metadata
      });

      // Store initial subscription data in Firestore
      await storeSubscriptionData(
        firebaseUid,
        response.customer.customer_id,
        response.subscription_id,
        'pending' // Initial status until webhook confirms
      );

      return NextResponse.json(response, { headers: corsHeaders });
    } catch (dodoError) {
      console.error('Dodo API error:', dodoError);
      
      // Extract useful information from the error
      const errorDetails = {
        message: dodoError instanceof Error ? dodoError.message : 'Unknown Dodo API error',
        name: dodoError instanceof Error ? dodoError.name : 'UnknownError',
        stack: dodoError instanceof Error ? dodoError.stack : null,
        diagnostics
      };
      
      console.error('Detailed Dodo error:', JSON.stringify(errorDetails));
      
      return NextResponse.json(
        { 
          error: "Payment provider error", 
          details: errorDetails.message,
          debug: errorDetails
        },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Subscription creation error:', error);
    
    let errorMessage = "Internal server error";
    let details = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      details = error.stack || "";
    }
    
    console.error('Error details:', { message: errorMessage, details });
    
    return NextResponse.json(
      { error: errorMessage, details },
      { status: 500, headers: corsHeaders }
    );
  }
}
