import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";

export async function GET() {
  try {
    return NextResponse.json({ 
      countries: COUNTRIES 
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}