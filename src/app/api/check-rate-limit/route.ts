import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const REQUESTS_PER_MINUTE = 10;

export async function POST(request: Request) {
  try {
    const { ip } = await request.json();
    const now = Timestamp.now();
    const minuteAgo = Timestamp.fromMillis(now.toMillis() - 60 * 1000);
    
    const rateLimitRef = db.collection('rateLimits').doc(ip);
    
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      
      if (!doc.exists) {
        transaction.set(rateLimitRef, {
          requests: 1,
          lastReset: now,
        });
        return {
          success: true,
          count: 1,
          lastReset: now,
        };
      }

      const data = doc.data()!;
      const resetTime = data.lastReset.toMillis();
      
      if (resetTime < minuteAgo.toMillis()) {
        transaction.set(rateLimitRef, {
          requests: 1,
          lastReset: now,
        });
        return {
          success: true,
          count: 1,
          lastReset: now,
        };
      }

      const newCount = data.requests + 1;
      if (newCount <= REQUESTS_PER_MINUTE) {
        transaction.update(rateLimitRef, {
          requests: newCount,
        });
        return {
          success: true,
          count: newCount,
          lastReset: data.lastReset,
        };
      }

      return {
        success: false,
        count: data.requests,
        lastReset: data.lastReset,
      };
    });

    const timeUntilReset = Math.ceil(
      (result.lastReset.toMillis() + 60 * 1000 - Date.now()) / 1000
    );

    return NextResponse.json({
      success: result.success,
      limit: REQUESTS_PER_MINUTE,
      remaining: Math.max(0, REQUESTS_PER_MINUTE - result.count),
      reset: timeUntilReset,
    });
  } catch (error) {
    console.error('Rate limit error:', error);
    // If there's an error, allow the request
    return NextResponse.json({
      success: true,
      limit: REQUESTS_PER_MINUTE,
      remaining: 1,
      reset: 60,
    });
  }
}