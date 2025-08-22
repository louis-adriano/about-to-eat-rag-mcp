import { NextRequest, NextResponse } from 'next/server';
import { GroqFoodService } from '../../../../lib/groq';
import { z } from 'zod';

const SuggestionsSchema = z.object({
  partialQuery: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partialQuery } = SuggestionsSchema.parse(body);

    const suggestions = await GroqFoodService.generateQuerySuggestions(partialQuery);

    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}