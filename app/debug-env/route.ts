import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    tokenExists: !!process.env.UPSTASH_VECTOR_REST_TOKEN,
    // Don't log the actual token for security
  });
}