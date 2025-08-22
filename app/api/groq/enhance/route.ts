import { NextRequest, NextResponse } from 'next/server';
import { GroqFoodService } from '../../../../lib/groq';
import { z } from 'zod';

const EnhanceSchema = z.object({
  query: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = EnhanceSchema.parse(body);

    const enhancement = await GroqFoodService.enhanceQuery(query);

    return NextResponse.json({
      success: true,
      enhancement
    });
  } catch (error) {
    console.error('Query enhancement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to enhance query' },
      { status: 500 }
    );
  }
}