import { NextResponse } from 'next/server';
import { DODO_CONFIG } from '@/lib/dodo-payments/config';
import { dodopayments } from '@/lib/dodo-payments/init-sdk';

export async function GET() {
  try {
    // Check environment configuration
    const configStatus = {
      environment: DODO_CONFIG.MODE,
      isConfigured: DODO_CONFIG.isConfigured(),
      apiKeyPresent: Boolean(DODO_CONFIG.API_KEY),
      webhookSecretPresent: Boolean(DODO_CONFIG.WEBHOOK_SECRET),
      baseUrl: DODO_CONFIG.BASE_URL,
      productId: DODO_CONFIG.PRODUCTS.PRO
    };

    // Test SDK initialization
    let sdkStatus = 'not_initialized';
    try {
      if (dodopayments) {
        sdkStatus = 'initialized';
      }
    } catch (error) {
      sdkStatus = 'initialization_failed';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: configStatus,
      sdk: sdkStatus
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}