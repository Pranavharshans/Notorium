import { NextResponse } from 'next/server';
import { dodopayments } from "@/lib/dodopayments";

export async function GET(request: Request) {
  try {
    // Get productId from query params if present
    const { searchParams } = new URL(request.url);
    const specificProductId = searchParams.get('productId') || process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;
    
    const diagnostics = {
      dodoApiKeyConfigured: !!process.env.DODO_API_KEY,
      dodoApiKeyLength: process.env.DODO_API_KEY ? process.env.DODO_API_KEY.length : 0,
      dodoPaymentsApiKeyConfigured: !!process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_DODO_PRO_PRODUCT_ID: process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID || "Not set"
    };
    
    // Try to get all products to check if the API key works
    let productsResult = { success: false, error: null };
    try {
      const products = await dodopayments.products.list();
      productsResult = { 
        success: true, 
        productCount: products?.length || 0,
        productIds: products?.map((p: any) => p.product_id) || [],
        firstProductId: products?.[0]?.product_id || null
      };
    } catch (error) {
      productsResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    // Try to get the specific product
    let specificProductResult = { success: false, error: null };
    if (specificProductId) {
      try {
        console.log('Testing specific product retrieval for ID:', specificProductId);
        // Check if specific product ID exists by retrieving it
        const product = await dodopayments.products.retrieve(specificProductId);
        specificProductResult = { 
          success: true, 
          productExists: !!product,
          productDetails: product || null
        };
      } catch (error) {
        console.error('Error retrieving specific product:', error);
        specificProductResult = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      specificProductResult = {
        success: false,
        error: "No product ID specified to check"
      };
    }
    
    return NextResponse.json({
      status: 'Dodo Payments API test',
      diagnostics,
      productsTest: productsResult,
      specificProductTest: specificProductResult,
      checkedProductId: specificProductId
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error running Dodo Payments API test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 