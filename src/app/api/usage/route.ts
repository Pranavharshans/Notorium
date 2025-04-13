import { NextRequest, NextResponse } from 'next/server';
import UsageService from '@/lib/usage-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get usage statistics
    const usageService = UsageService.getInstance();
    const usage = await usageService.getUserUsage(userId);

    // Get current subscription status
    // const dodoService = DodoPaymentsService.getInstance();
    
    try {
      // Note: This will be implemented when we have subscription data in the database
      // const subscription = await dodoService.getSubscriptionStatus(subscriptionId);
      // Add subscription status to usage data if needed
    } catch (error) {
      console.error('Failed to get subscription status:', error instanceof Error ? error.message : 'Unknown error');
      // Continue with usage data even if subscription status fails
    }

    return NextResponse.json(usage, { status: 200 });
  } catch (error) {
    console.error('Failed to get usage stats:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const body = await req.json();

    if (!isUsagePayload(body)) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { type, value } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and tracking type are required' },
        { status: 400 }
      );
    }

    const usageService = UsageService.getInstance();
    let result = false;

    // Track usage based on type
    if (type === 'recording') {
      if (typeof value !== 'number' || value <= 0) {
        return NextResponse.json(
          { error: 'Valid recording duration is required' },
          { status: 400 }
        );
      }
      result = await usageService.trackRecordingTime(userId, value);
    } else {
      // ai_action doesn't need a value
      result = await usageService.trackAiAction(userId);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Usage limit exceeded' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Usage tracked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to track usage:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track usage' },
      { status: 500 }
    );
  }
}

type UsagePayload =
  | { type: 'recording'; value: number }
  | { type: 'ai_action' };

function isUsagePayload(payload: unknown): payload is UsagePayload {
  if (!payload || typeof payload !== 'object') return false;
  const { type, value } = payload as { type: unknown; value?: unknown };

  if (type === 'recording') {
    return typeof value === 'number' && value > 0;
  }
  
  if (type === 'ai_action') {
    return true;
  }

  return false;
}
