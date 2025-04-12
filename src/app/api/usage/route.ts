import { NextRequest, NextResponse } from 'next/server';
import UsageService from '@/lib/usage-service';
import DodoPaymentsService from '@/lib/dodo-service';

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
    const dodoService = DodoPaymentsService.getInstance();
    
    try {
      // Note: This will be implemented when we have subscription data in the database
      // const subscription = await dodoService.getSubscriptionStatus(subscriptionId);
      // Add subscription status to usage data if needed
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      // Continue with usage data even if subscription status fails
    }

    return NextResponse.json(usage, { status: 200 });
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const { type, value } = await req.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and tracking type are required' },
        { status: 400 }
      );
    }

    const usageService = UsageService.getInstance();
    let result = false;

    // Track usage based on type
    switch (type) {
      case 'recording':
        result = await usageService.trackRecordingTime(userId, value);
        break;
      case 'ai_action':
        result = await usageService.trackAiAction(userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid tracking type' },
          { status: 400 }
        );
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
    console.error('Failed to track usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}