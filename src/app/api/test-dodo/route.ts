import { NextResponse } from 'next/server';
import { dodopayments } from "@/lib/dodopayments";

export async function GET() {
  try {
    const diagnostics = {
      dodoApiKeyConfigured: !!process.env.DODO_API_KEY,
      dodoApiKeyLength: process.env.DODO_API_KEY ? process.env.DODO_API_KEY.length : 0,
      dodoPaymentsApiKeyConfigured: !!process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    };
    
    // Try to get products to check if the API key works
    let productsResult = { success: false, error: null };
    try {
      const products = await dodopayments.products.list();
      productsResult = { 
        success: true, 
        productCount: products?.length || 0,
        firstProductId: products?.[0]?.product_id || null
      };
    } catch (error) {
      productsResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return NextResponse.json({
      status: 'Dodo Payments API test',
      diagnostics,
      productsTest: productsResult
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error running Dodo Payments API test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 