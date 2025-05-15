import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    DODO_API_KEY: process.env.DODO_API_KEY ? 'Configured' : 'Not configured',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    // Redact actual values for security
  };

  return NextResponse.json({
    status: 'Environment variables check',
    vars: envVars
  });
} 